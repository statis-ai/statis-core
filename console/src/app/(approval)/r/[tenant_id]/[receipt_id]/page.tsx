"use client";

/**
 * Public receipts page — `/r/{tenant_id}/{receipt_id}`
 *
 * No authentication. The receipt_id itself is unguessable; signature is
 * what makes the page trustworthy. Renders:
 *
 *   1. SIGNATURE banner (D17 ok / D21 fail / warn for unsigned legacy)
 *      v1 ships "SIGNATURE VERIFIED · ED25519" only — NO chain badge per
 *      OV-T3. Chain badge re-enters with Receipt v2 in Week 2.
 *
 *   2. Decision summary — what was decided, by whom, when
 *
 *   3. Execution result — the adapter's response payload
 *
 *   4. ROADMAP footer (OV-T3) — "Receipt v2 lands {date} with chain
 *      verification. Verify offline today: `statis verify ...`"
 */
import * as React from "react";
import { useParams } from "next/navigation";
import { PublicPageChrome } from "@/components/PublicPageChrome";
import { StateBanner } from "@/components/StateBanner";
import { ArgsPanel } from "@/components/ArgsPanel";
import type {
  PublicReceiptResponse,
  ReceiptVerification,
} from "@/lib/approval-types";

const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";


export default function ReceiptsPage(): React.ReactElement {
  const params = useParams<{ tenant_id: string; receipt_id: string }>();
  const tenantId = params?.tenant_id || "";
  const receiptId = params?.receipt_id || "";

  const [state, setState] = React.useState<
    | { kind: "loading" }
    | { kind: "loaded"; data: PublicReceiptResponse }
    | { kind: "error"; detail: string }
  >({ kind: "loading" });

  React.useEffect(() => {
    if (!tenantId || !receiptId) {
      setState({ kind: "error", detail: "missing tenant_id or receipt_id" });
      return;
    }
    let cancelled = false;
    fetch(
      `${API_BASE}/r/${encodeURIComponent(tenantId)}/${encodeURIComponent(receiptId)}`,
    )
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const body = (await r.json()) as PublicReceiptResponse;
        if (!cancelled) setState({ kind: "loaded", data: body });
      })
      .catch((e) => {
        if (!cancelled)
          setState({ kind: "error", detail: String(e?.message ?? e) });
      });
    return () => {
      cancelled = true;
    };
  }, [tenantId, receiptId]);

  if (state.kind === "loading") {
    return (
      <PublicPageChrome eyebrow="receipt" showLinkBearerWarning={false}>
        <p data-testid="loading">Loading…</p>
      </PublicPageChrome>
    );
  }
  if (state.kind === "error") {
    return (
      <PublicPageChrome eyebrow="receipt" showLinkBearerWarning={false}>
        <StateBanner
          variant="fail"
          title="RECEIPT NOT FOUND"
          caption={state.detail}
        />
      </PublicPageChrome>
    );
  }

  const { receipt, verification } = state.data;
  const banner = renderBanner(verification);

  return (
    <PublicPageChrome
      eyebrow="receipt"
      showLinkBearerWarning={false}
      footer={<ReceiptsFooter receiptId={receipt.receipt_id} />}
    >
      {banner}

      <div style={{ height: 16 }} />

      <DecisionSummary receipt={receipt} />

      {receipt.execution_result ? (
        <>
          <h2
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              margin: "20px 0 8px",
            }}
          >
            execution result
          </h2>
          <ArgsPanel parameters={receipt.execution_result} />
        </>
      ) : null}
    </PublicPageChrome>
  );
}


function renderBanner(v: ReceiptVerification): React.ReactElement {
  // D17: v1 banner = SIGNATURE VERIFIED · ED25519 only. NO "CHAIN INTACT".
  if (v.state === "VERIFIED") {
    return (
      <StateBanner
        variant="ok"
        title="SIGNATURE VERIFIED · ED25519"
        caption={`crypto: ${v.signature_alg} · key ${shortKid(v.public_key_id)}`}
      />
    );
  }
  if (v.state === "FAILED") {
    return (
      <StateBanner
        variant="fail"
        title="SIGNATURE FAILED"
        caption={`${v.check} · key ${shortKid(v.public_key_id)}`}
      />
    );
  }
  // UNSIGNED — legacy receipt that predates PR-AARM-02.
  return (
    <StateBanner
      variant="warn"
      title="UNSIGNED RECEIPT"
      caption="predates AARM R5 — no signature available"
    />
  );
}


function DecisionSummary({
  receipt,
}: {
  receipt: PublicReceiptResponse["receipt"];
}): React.ReactElement {
  return (
    <div className="args-panel">
      <div className="args-panel__row">
        <div className="args-panel__key">action</div>
        <div className="args-panel__value">{receipt.action_id}</div>
      </div>
      <div className="args-panel__row">
        <div className="args-panel__key">decision</div>
        <div className="args-panel__value">{receipt.decision}</div>
      </div>
      {receipt.rule_id ? (
        <div className="args-panel__row">
          <div className="args-panel__key">rule</div>
          <div className="args-panel__value">
            {receipt.rule_id}
            {receipt.rule_version ? ` · v${receipt.rule_version}` : ""}
          </div>
        </div>
      ) : null}
      <div className="args-panel__row">
        <div className="args-panel__key">decided by</div>
        <div className="args-panel__value">{receipt.approved_by}</div>
      </div>
      {receipt.executed_at ? (
        <div className="args-panel__row">
          <div className="args-panel__key">executed</div>
          <div className="args-panel__value">{formatTime(receipt.executed_at)}</div>
        </div>
      ) : null}
      <div className="args-panel__row">
        <div className="args-panel__key">written</div>
        <div className="args-panel__value">{formatTime(receipt.created_at)}</div>
      </div>
      <div className="args-panel__row">
        <div className="args-panel__key">hash</div>
        <div className="args-panel__value">
          <code style={{ wordBreak: "break-all" }}>{receipt.hash}</code>
        </div>
      </div>
    </div>
  );
}


function ReceiptsFooter({ receiptId }: { receiptId: string }): React.ReactElement {
  // OV-T3 ROADMAP footer.
  return (
    <>
      <span>
        receipt <code>{receiptId}</code>
      </span>
      <span data-testid="roadmap-footer">
        Receipt v2 (chain verification) ships Week 2 · verify offline today:{" "}
        <code>statis verify --receipt {receiptId}</code>
      </span>
    </>
  );
}


function shortKid(kid: string): string {
  if (kid.length <= 16) return kid;
  return `${kid.slice(0, 6)}…${kid.slice(-6)}`;
}


function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}
