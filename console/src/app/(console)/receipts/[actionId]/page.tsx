"use client";

import { use, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  fetchAction,
  fetchActions,
  fetchReceipt,
  verifyReceipt,
  type ActionContract,
  type ReceiptDetail,
  type ReceiptVerifyResult,
} from "@/lib/api";

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SectionHeader({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-bg border border-rule border-b-0 rounded-t-[3px]">
      <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted font-medium">
        {label}
      </span>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

type Tone = "ok" | "warn" | "err" | "muted";

const TONE_CLASS: Record<Tone, string> = {
  ok: "bg-[rgba(29,58,46,0.08)] text-seal border-seal/30",
  warn: "bg-[rgba(154,109,23,0.08)] text-amber border-amber/30",
  err: "bg-[rgba(184,68,46,0.08)] text-accent border-accent/30",
  muted: "bg-bg text-ink-muted border-rule",
};

const TONE_DOT: Record<Tone, string> = {
  ok: "rgb(29,58,46)",
  warn: "rgb(154,109,23)",
  err: "rgb(184,68,46)",
  muted: "rgb(153,142,130)",
};

function statusTone(status: string): Tone {
  const s = status.toUpperCase();
  if (s === "APPROVED" || s === "COMPLETED" || s === "SUCCESS" || s === "VERIFIED") return "ok";
  if (s === "ESCALATED" || s === "STEP_UP" || s === "PENDING" || s === "DEFERRED" || s === "PROPOSED") return "warn";
  if (s === "DENIED" || s === "FAILED" || s === "INVALID") return "err";
  return "muted";
}

function StatusChip({ status }: { status: string }) {
  const tone = statusTone(status);
  const s = status.toUpperCase();
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.12em] uppercase font-medium px-1.5 py-[3px] rounded-[2px] border " +
        TONE_CLASS[tone]
      }
    >
      <span
        className="w-1 h-1 rounded-full shrink-0"
        style={{ background: TONE_DOT[tone] }}
      />
      {s}
    </span>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted font-medium mb-1">
        {label}
      </p>
      <div>{value}</div>
    </div>
  );
}

export default function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ actionId: string }>;
}) {
  const { actionId } = use(params);

  const [action, setAction] = useState<ActionContract | null>(null);
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [chain, setChain] = useState<ActionContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [verification, setVerification] = useState<ReceiptVerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [a, r] = await Promise.all([
          fetchAction(actionId),
          fetchReceipt(actionId),
        ]);
        if (cancelled) return;
        setAction(a);
        setReceipt(r);

        const et = a.target_entity.entity_type;
        const eid = a.target_entity.entity_id;
        if (et && eid) {
          try {
            const related = await fetchActions(et, eid);
            if (!cancelled) setChain(related);
          } catch {
            /* chain is best-effort */
          }
        }
        setError(null);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [actionId]);

  function handleVerify() {
    if (!receipt || verifying) return;
    setVerifying(true);
    verifyReceipt(receipt.receipt_id)
      .then((r) => setVerification(r))
      .catch(() =>
        setVerification({
          receipt_id: receipt.receipt_id,
          hash_valid: false,
          stored_hash: receipt.hash,
          computed_hash: "",
        }),
      )
      .finally(() => setVerifying(false));
  }

  function copyHash() {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sortedChain = useMemo(() => {
    return [...chain].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, [chain]);

  const currentIdx = useMemo(
    () => sortedChain.findIndex((a) => a.action_id === actionId),
    [sortedChain, actionId],
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 w-full">
        <Link
          href="/receipts"
          className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-muted hover:text-accent mb-4"
        >
          ← Back to ledger
        </Link>
        <p className="text-[13px] text-ink-muted">Loading receipt…</p>
      </div>
    );
  }

  if (error || !receipt || !action) {
    return (
      <div className="p-6 lg:p-8 w-full">
        <Link
          href="/receipts"
          className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-muted hover:text-accent mb-4"
        >
          ← Back to ledger
        </Link>
        <div className="bg-[rgba(184,68,46,0.06)] border border-accent/30 border-l-2 border-l-accent rounded-[3px] px-3.5 py-2.5">
          <span className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-accent font-medium mb-1">
            ⚠ Could not load receipt
          </span>
          <p className="text-[12.5px] text-ink tracking-[-0.005em] font-mono break-all">
            {error ?? "Receipt not found for this action."}
          </p>
        </div>
      </div>
    );
  }

  const entity = `${action.target_entity.entity_type}/${action.target_entity.entity_id}`;

  return (
    <div className="p-6 lg:p-8 w-full max-w-[1100px]">
      {/* Breadcrumb */}
      <Link
        href="/receipts"
        className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-muted hover:text-accent mb-3"
      >
        ← Back to ledger
      </Link>

      {/* Header */}
      <header className="flex items-start justify-between gap-6 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <StatusChip status={receipt.decision} />
            <span className="font-mono text-[11px] text-ink-muted tracking-[0.02em]">
              {formatAbsolute(receipt.created_at)} · {formatRelative(receipt.created_at)}
            </span>
          </div>
          <h1 className="font-sans text-[22px] tracking-[-0.02em] leading-[1.2] text-ink font-medium font-mono break-all">
            {receipt.receipt_id}
          </h1>
          <p className="text-[12.5px] text-ink-soft tracking-[-0.005em] mt-1">
            Receipt for{" "}
            <Link
              href={`/actions/${action.action_id}`}
              className="font-mono text-ink border-b border-dotted border-ink-muted hover:text-accent hover:border-accent tracking-[0.01em]"
            >
              {action.action_id}
            </Link>
          </p>
        </div>
      </header>

      {/* Action context */}
      <div className="mb-5">
        <SectionHeader label="◆ Action context" />
        <div className="bg-paper border border-rule rounded-b-[3px] px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <Field
            label="Proposed by"
            value={
              <span className="font-mono text-[12px] text-ink tracking-[0.01em]">
                {action.proposed_by}
              </span>
            }
          />
          <Field
            label="Action type"
            value={
              <span className="font-mono text-[12px] text-ink-soft tracking-[0.01em]">
                {action.action_type}
              </span>
            }
          />
          <Field
            label="Target entity"
            value={
              <span className="font-mono text-[12px] text-ink-soft tracking-[0.01em] break-all">
                {entity}
              </span>
            }
          />
          <Field
            label="Target system"
            value={
              <span className="font-mono text-[12px] text-ink-soft tracking-[0.01em]">
                {action.target_system}
              </span>
            }
          />
          <Field
            label="Rule"
            value={
              <span className="font-mono text-[12px] text-ink-soft tracking-[0.01em]">
                {receipt.rule_id ?? "—"}
                {receipt.rule_version ? (
                  <span className="ml-1 text-ink-muted">v{receipt.rule_version}</span>
                ) : null}
              </span>
            }
          />
          <Field
            label="Approved by"
            value={
              <span className="font-mono text-[12px] text-ink-soft tracking-[0.01em]">
                {receipt.approved_by || "—"}
              </span>
            }
          />
          <Field
            label="Executed at"
            value={
              <span className="text-[12px] text-ink-soft tabular-nums tracking-[-0.005em]">
                {receipt.executed_at ? formatAbsolute(receipt.executed_at) : "—"}
              </span>
            }
          />
          <Field
            label="Status"
            value={<StatusChip status={action.status} />}
          />
        </div>
      </div>

      {/* Hash integrity */}
      <div className="mb-5">
        <SectionHeader
          label="◈ Tamper-evident hash"
          right={
            verification ? (
              <StatusChip status={verification.hash_valid ? "VERIFIED" : "INVALID"} />
            ) : (
              <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-ink-muted">
                SHA-256
              </span>
            )
          }
        />
        <div className="bg-paper border border-rule rounded-b-[3px] px-5 py-4 space-y-3">
          <div className="flex items-stretch gap-2">
            <code className="flex-1 font-mono text-[12px] px-3 py-2.5 rounded-[3px] break-all bg-bg border border-rule text-ink tracking-[0.01em]">
              {receipt.hash}
            </code>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={copyHash}
                className="inline-flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.12em] uppercase font-medium px-3 py-2 rounded-[3px] bg-paper border border-rule text-ink-soft hover:border-ink-muted transition-colors"
              >
                {copied ? "✓ Copied" : "⎘ Copy"}
              </button>
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="inline-flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.12em] uppercase font-medium px-3 py-2 rounded-[3px] bg-accent text-paper border border-accent hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {verifying ? "Verifying…" : "⌘ Verify hash"}
              </button>
            </div>
          </div>
          {verification ? (
            <div
              className={
                "border rounded-[3px] px-3 py-2 " +
                (verification.hash_valid
                  ? "bg-[rgba(29,58,46,0.05)] border-seal/30"
                  : "bg-[rgba(184,68,46,0.05)] border-accent/30")
              }
            >
              <p
                className={
                  "font-mono text-[9.5px] tracking-[0.14em] uppercase font-medium mb-1 " +
                  (verification.hash_valid ? "text-seal" : "text-accent")
                }
              >
                {verification.hash_valid ? "◆ Chain intact" : "⚠ Hash mismatch"}
              </p>
              <p className="text-[11.5px] text-ink-soft tracking-[-0.005em] leading-[1.5]">
                {verification.hash_valid
                  ? "Stored hash matches recomputed SHA-256 of the canonical receipt body."
                  : "Recomputed hash does not match stored hash — the receipt may have been tampered with."}
              </p>
              {!verification.hash_valid && verification.computed_hash ? (
                <p className="mt-2 font-mono text-[10.5px] text-ink-muted break-all tracking-[0.01em]">
                  computed: {verification.computed_hash}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Conditions evaluated */}
      {receipt.conditions_evaluated && Object.keys(receipt.conditions_evaluated).length > 0 ? (
        <div className="mb-5">
          <SectionHeader label="◇ Conditions evaluated" />
          <div className="bg-paper border border-rule rounded-b-[3px]">
            <ul className="divide-y divide-rule">
              {Object.entries(receipt.conditions_evaluated).map(([key, cond]) => (
                <li key={key} className="flex items-start gap-3 px-5 py-3">
                  <span
                    className={
                      "font-mono text-[13px] w-4 shrink-0 leading-none pt-[3px] " +
                      (cond.passed ? "text-seal" : "text-accent")
                    }
                  >
                    {cond.passed ? "✓" : "×"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] text-ink tracking-[-0.005em]">
                      {cond.label}
                    </p>
                    {cond.expected !== undefined || cond.actual !== undefined ? (
                      <p className="font-mono text-[10.5px] text-ink-muted tracking-[0.01em] mt-0.5 break-all">
                        {cond.expected !== undefined ? (
                          <>
                            expected <span className="text-ink-soft">{JSON.stringify(cond.expected)}</span>
                            {cond.actual !== undefined ? " · " : ""}
                          </>
                        ) : null}
                        {cond.actual !== undefined ? (
                          <>
                            actual <span className="text-ink-soft">{JSON.stringify(cond.actual)}</span>
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {/* Entity state snapshot */}
      {receipt.entity_state_snapshot && Object.keys(receipt.entity_state_snapshot).length > 0 ? (
        <div className="mb-5">
          <SectionHeader
            label="◎ Entity state snapshot"
            right={
              <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-ink-muted">
                at decision time
              </span>
            }
          />
          <div className="bg-paper border border-rule rounded-b-[3px] p-3">
            <pre
              className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all rounded-[3px] p-3 bg-bg border border-rule text-ink-soft tracking-[0.01em]"
              style={{ maxHeight: 320, overflow: "auto" }}
            >
              {JSON.stringify(receipt.entity_state_snapshot, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}

      {/* Execution result */}
      {receipt.execution_result ? (
        <div className="mb-5">
          <SectionHeader label="⊕ Execution result" />
          <div className="bg-paper border border-rule rounded-b-[3px] p-3">
            <pre
              className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all rounded-[3px] p-3 bg-bg border border-rule text-ink-soft tracking-[0.01em]"
              style={{ maxHeight: 320, overflow: "auto" }}
            >
              {JSON.stringify(receipt.execution_result, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}

      {/* Chain walk */}
      <div className="mb-5">
        <SectionHeader
          label={`◉ Chain on ${entity}`}
          right={
            <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-ink-muted">
              {sortedChain.length} {sortedChain.length === 1 ? "action" : "actions"}
            </span>
          }
        />
        <div className="bg-paper border border-rule rounded-b-[3px]">
          {sortedChain.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-[12.5px] text-ink-muted tracking-[-0.005em]">
                No related actions found on this entity.
              </p>
            </div>
          ) : (
            <ol className="divide-y divide-rule">
              {sortedChain.map((a, i) => {
                const isCurrent = a.action_id === actionId;
                const tone = statusTone(a.status);
                return (
                  <li key={a.action_id}>
                    <Link
                      href={`/receipts/${a.action_id}`}
                      className={
                        "flex items-center gap-3 px-5 py-3 transition-colors " +
                        (isCurrent
                          ? "bg-[rgba(184,68,46,0.04)] border-l-2 border-l-accent cursor-default pointer-events-none"
                          : "hover:bg-bg/60")
                      }
                    >
                      <span className="font-mono text-[10.5px] text-ink-muted tabular-nums w-8 shrink-0 tracking-[0.02em]">
                        #{String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: TONE_DOT[tone] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              "font-mono text-[11px] truncate tracking-[0.01em] " +
                              (isCurrent ? "text-ink font-medium" : "text-ink-soft")
                            }
                          >
                            {a.action_id}
                          </span>
                          {isCurrent ? (
                            <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-accent font-medium">
                              current
                            </span>
                          ) : null}
                        </div>
                        <div className="font-mono text-[10.5px] text-ink-muted tracking-[0.01em] mt-0.5 truncate">
                          {a.action_type} · by {a.proposed_by}
                        </div>
                      </div>
                      <StatusChip status={a.status} />
                      <span className="font-mono text-[10.5px] text-ink-muted tabular-nums shrink-0 w-20 text-right tracking-[0.01em]">
                        {formatRelative(a.created_at)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
          {currentIdx >= 0 && sortedChain.length > 1 ? (
            <div className="px-4 py-2 border-t border-rule bg-bg font-mono text-[10.5px] tracking-[0.02em] text-ink-muted">
              Position {currentIdx + 1} of {sortedChain.length} on this entity · each action hash
              chains into the next.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
