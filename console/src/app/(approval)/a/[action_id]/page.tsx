"use client";

/**
 * Public approval page — `/a/{action_id}?sig={hmac_token}`
 *
 * Lane 3a + 3b composed into one route. Per OV5: GET is render-only (no
 * mutation), POST is the decision (CSRF token bound to sig). Lane 1's
 * `GET /a/{action_id}` returns one of the 6 contract shapes; we switch
 * on `shape` to render the right view:
 *
 *   PENDING               → identity card + args panel + countdown + form
 *   EXPIRED_ERROR         → expired error variant (D20 yellow)
 *   INVALID_SIG_ERROR     → invalid-sig error variant (D20 red, NO action_id)
 *   ROTATED_ERROR         → rotation error variant (D20 red, tenant_secret_rotated_at)
 *   ALREADY_DECIDED_RACE  → race banner with link to receipt (D32)
 *
 * D24 in-place morph: on a successful POST the same page re-renders with
 * a `DecisionReceipt` banner instead of nav'ing to a new URL. The args
 * panel stays in DOM so visually it morphs from "pending review" to
 * "decided" without a full page swap.
 *
 * D31 countdown @ 00:00: when the token's `expires_at` passes, the
 * Approve/Deny buttons get disabled inline + an expired notice appears.
 *
 * D22 graduation overlay (3rd identical approval within 48h) is wired in
 * via `<AuditPanel>` — the overlay renders below the args panel and
 * before the action buttons. Snooze/skip/save flows are stubbed v1; the
 * "save policy" path opens `/policies/new?prefill=...` for now.
 */
import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PublicPageChrome } from "@/components/PublicPageChrome";
import { IdentityCard } from "@/components/IdentityCard";
import { ArgsPanel } from "@/components/ArgsPanel";
import { StateBanner } from "@/components/StateBanner";
import { AuditPanel } from "@/components/AuditPanel";
import {
  ApprovalShape,
  type ApprovalGetResponse,
  type ApprovalDecisionResponse,
  type DecisionReceipt,
  type PendingResponse,
} from "@/lib/approval-types";

const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";


export default function ApprovalPage(): React.ReactElement {
  const params = useParams<{ action_id: string }>();
  const search = useSearchParams();
  const sig = search.get("sig") || "";
  const actionId = params?.action_id || "";

  const [getState, setGetState] = React.useState<
    | { kind: "loading" }
    | { kind: "loaded"; data: ApprovalGetResponse }
    | { kind: "error"; detail: string }
  >({ kind: "loading" });

  const [decisionState, setDecisionState] = React.useState<
    | null
    | { kind: "submitting"; decision: "APPROVED" | "DENIED" }
    | { kind: "decided"; receipt: DecisionReceipt }
    | { kind: "race"; receiptUrl: string; decision: "APPROVED" | "DENIED" }
    | { kind: "error"; detail: string }
  >(null);

  // -------------- GET: fetch approval state once on mount --------------
  React.useEffect(() => {
    if (!actionId || !sig) {
      setGetState({ kind: "error", detail: "Missing action_id or sig" });
      return;
    }
    let cancelled = false;
    fetch(
      `${API_BASE}/a/${encodeURIComponent(actionId)}?sig=${encodeURIComponent(sig)}`,
    )
      .then(async (r) => {
        const body = (await r.json()) as ApprovalGetResponse;
        if (!cancelled) setGetState({ kind: "loaded", data: body });
      })
      .catch((e) => {
        if (!cancelled)
          setGetState({ kind: "error", detail: String(e?.message ?? e) });
      });
    return () => {
      cancelled = true;
    };
  }, [actionId, sig]);

  // -------------- POST: decision handler --------------
  const submitDecision = React.useCallback(
    async (decision: "APPROVED" | "DENIED") => {
      setDecisionState({ kind: "submitting", decision });
      try {
        const res = await fetch(
          `${API_BASE}/a/${encodeURIComponent(actionId)}/decision?sig=${encodeURIComponent(sig)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              decision,
              csrf_token: sig, // OV5: token bound to sig; Lane 1 narrows
            }),
          },
        );
        const payload = (await res.json()) as ApprovalDecisionResponse;
        if (payload.shape === ApprovalShape.DECISION_RECEIPT) {
          setDecisionState({ kind: "decided", receipt: payload });
        } else if (payload.shape === ApprovalShape.ALREADY_DECIDED_RACE) {
          setDecisionState({
            kind: "race",
            receiptUrl: payload.receipt_url,
            decision: payload.decision,
          });
        } else {
          setDecisionState({
            kind: "error",
            detail: ("detail" in payload && payload.detail) || payload.shape,
          });
        }
      } catch (e) {
        setDecisionState({ kind: "error", detail: String((e as Error).message) });
      }
    },
    [actionId, sig],
  );

  // -------------- Render --------------
  if (getState.kind === "loading") {
    return (
      <PublicPageChrome eyebrow="approval">
        <p data-testid="loading">Loading…</p>
      </PublicPageChrome>
    );
  }
  if (getState.kind === "error") {
    return (
      <PublicPageChrome eyebrow="approval" showLinkBearerWarning={false}>
        <StateBanner
          variant="fail"
          title="Could not load this action"
          caption={getState.detail}
        />
      </PublicPageChrome>
    );
  }

  const data = getState.data;

  if (data.shape === ApprovalShape.INVALID_SIG_ERROR) {
    return (
      <PublicPageChrome eyebrow="approval" showLinkBearerWarning={false}>
        <StateBanner variant="fail" title="INVALID LINK" caption="signature" />
        <p data-testid="invalid-detail">{data.detail}</p>
      </PublicPageChrome>
    );
  }
  if (data.shape === ApprovalShape.EXPIRED_ERROR) {
    return (
      <PublicPageChrome eyebrow="approval" showLinkBearerWarning={false}>
        <StateBanner
          variant="warn"
          title="LINK EXPIRED"
          caption={`expired ${formatTime(data.expired_at)}`}
        />
        <p data-testid="expired-detail">{data.recovery_hint}</p>
        <p>
          Action <code>{data.action_id}</code>
        </p>
      </PublicPageChrome>
    );
  }
  if (data.shape === ApprovalShape.ROTATED_ERROR) {
    return (
      <PublicPageChrome eyebrow="approval" showLinkBearerWarning={false}>
        <StateBanner
          variant="fail"
          title="LINK INVALIDATED"
          caption={`tenant key rotated ${formatTime(data.rotated_at)}`}
        />
        <p data-testid="rotated-detail">{data.detail}</p>
      </PublicPageChrome>
    );
  }
  if (data.shape === ApprovalShape.ALREADY_DECIDED_RACE) {
    return (
      <PublicPageChrome eyebrow="approval" showLinkBearerWarning={false}>
        <StateBanner
          variant="ok"
          title="ALREADY DECIDED"
          caption={`${data.decision.toLowerCase()} by ${data.decided_by ?? "another reviewer"}`}
        />
        <p data-testid="race-detail">
          This action was already decided.{" "}
          <a href={data.receipt_url}>View receipt →</a>
        </p>
      </PublicPageChrome>
    );
  }

  // PENDING — main approval surface
  return (
    <PendingView
      pending={data}
      decisionState={decisionState}
      onDecide={submitDecision}
    />
  );
}


/* ------------------------------------------------------------------ */
/* PENDING surface + D24 in-place morph                                */
/* ------------------------------------------------------------------ */

function PendingView({
  pending,
  decisionState,
  onDecide,
}: {
  pending: PendingResponse;
  decisionState:
    | null
    | { kind: "submitting"; decision: "APPROVED" | "DENIED" }
    | { kind: "decided"; receipt: DecisionReceipt }
    | { kind: "race"; receiptUrl: string; decision: "APPROVED" | "DENIED" }
    | { kind: "error"; detail: string };
  onDecide: (d: "APPROVED" | "DENIED") => void;
}): React.ReactElement {
  const action = pending.action;
  const expiresAt = new Date(action.expires_at).getTime();
  const [now, setNow] = React.useState(() => Date.now());

  // Per-second tick for the countdown (D31).
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const remainingMs = expiresAt - now;
  const expired = remainingMs <= 0;

  // D24 morph target: render the receipt card in the same DOM slot as
  // the buttons. The args panel stays mounted above so the visual
  // continuity is preserved.
  let actionSlot: React.ReactElement;
  if (decisionState?.kind === "decided") {
    actionSlot = <DecisionMorphed receipt={decisionState.receipt} />;
  } else if (decisionState?.kind === "race") {
    actionSlot = (
      <StateBanner
        variant="ok"
        title="ALREADY DECIDED"
        caption={`${decisionState.decision.toLowerCase()} elsewhere`}
      />
    );
  } else {
    actionSlot = (
      <ApproveDenyButtons
        disabled={
          expired ||
          decisionState?.kind === "submitting"
        }
        submitting={decisionState?.kind === "submitting" ? decisionState.decision : null}
        onClick={onDecide}
      />
    );
  }

  return (
    <PublicPageChrome
      eyebrow="approval"
      footer={
        <ApprovalFooter
          actionId={action.action_id}
          remainingMs={remainingMs}
          expired={expired}
        />
      }
    >
      <h1
        style={{
          fontSize: 16,
          fontWeight: 500,
          margin: "0 0 16px",
          color: "var(--text)",
        }}
      >
        {action.action_type}{" "}
        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
          on {action.target_system}
        </span>
      </h1>

      <IdentityCard agent={action.agent} />

      <div style={{ height: 16 }} />

      <ArgsPanel parameters={action.parameters} />

      {/* D18 audit panel — only renders if there are 1+ prior identical approvals */}
      <AuditPanel actionId={action.action_id} />

      {decisionState?.kind === "error" ? (
        <p
          data-testid="decision-error"
          style={{ color: "#dc2626", fontSize: 12, marginTop: 12 }}
        >
          {decisionState.detail}
        </p>
      ) : null}

      <div style={{ marginTop: 20 }}>{actionSlot}</div>

      {expired && decisionState?.kind !== "decided" ? (
        <p
          data-testid="expired-banner"
          style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 12 }}
        >
          link expired — request a new one
        </p>
      ) : null}
    </PublicPageChrome>
  );
}


function ApproveDenyButtons({
  disabled,
  submitting,
  onClick,
}: {
  disabled: boolean;
  submitting: "APPROVED" | "DENIED" | null;
  onClick: (d: "APPROVED" | "DENIED") => void;
}): React.ReactElement {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="button"
        data-testid="approve-button"
        onClick={() => onClick("APPROVED")}
        disabled={disabled}
        style={btnStyle({ primary: true, disabled })}
      >
        {submitting === "APPROVED" ? "approving…" : "Approve"}
      </button>
      <button
        type="button"
        data-testid="deny-button"
        onClick={() => onClick("DENIED")}
        disabled={disabled}
        style={btnStyle({ primary: false, disabled })}
      >
        {submitting === "DENIED" ? "denying…" : "Deny"}
      </button>
    </div>
  );
}


function DecisionMorphed({
  receipt,
}: {
  receipt: DecisionReceipt;
}): React.ReactElement {
  // The D24 in-place morph target. Same DOM slot the buttons lived in —
  // CSS transition lives on the parent, so swapping content here animates.
  return (
    <div
      data-testid="decision-receipt"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid #16a34a",
        borderLeft: "3px solid #16a34a",
        borderRadius: 4,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 4,
        }}
      >
        decided · {receipt.decision.toLowerCase()}
      </div>
      <div style={{ fontSize: 14, color: "var(--text)" }}>
        receipt <code>{receipt.receipt_id}</code>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
        signed: {receipt.signature_alg} · {receipt.public_key_id}
      </div>
      <a
        href={receipt.receipt_url}
        style={{ fontSize: 12, color: "var(--text-2)", marginTop: 8, display: "inline-block" }}
      >
        view receipt →
      </a>
    </div>
  );
}


function ApprovalFooter({
  actionId,
  remainingMs,
  expired,
}: {
  actionId: string;
  remainingMs: number;
  expired: boolean;
}): React.ReactElement {
  return (
    <>
      <span>
        action <code>{actionId}</code>
      </span>
      <span data-testid="countdown">
        {expired
          ? "expired"
          : `expires in ${formatRemaining(remainingMs)}`}
      </span>
    </>
  );
}


function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}


function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}


function btnStyle({
  primary,
  disabled,
}: {
  primary: boolean;
  disabled: boolean;
}): React.CSSProperties {
  return {
    padding: "8px 16px",
    fontSize: 13,
    fontFamily: "var(--font)",
    border: "1px solid var(--border)",
    background: primary ? "var(--text)" : "var(--bg-surface)",
    color: primary ? "var(--bg)" : "var(--text)",
    borderRadius: "var(--radius)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    minHeight: 44, // a11y target size (D29 GROUP-2 hint)
  };
}
