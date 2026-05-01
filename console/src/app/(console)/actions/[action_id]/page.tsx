"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchAction,
  fetchReceipt,
  verifyReceipt,
  type ActionContract,
  type ReceiptDetail,
  type ReceiptVerifyResult,
} from "@/lib/api";
import { StatusPill } from "@/components/observe/StatusPill";

function formatAbsolute(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function SectionCard({ eyebrow, children, right }: {
  eyebrow: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="bg-brand-paper border border-brand-rule" style={{ borderRadius: "var(--radius)" }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-brand-rule">
        <span className="eyebrow">{eyebrow}</span>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-2 border-b border-brand-rule-soft last:border-0">
      <span
        className="font-mono text-brand-muted shrink-0 w-36"
        style={{ fontSize: 11, letterSpacing: "0.06em" }}
      >
        {label}
      </span>
      <div className="text-brand-ink-soft flex-1" style={{ fontSize: 13 }}>{value}</div>
    </div>
  );
}

export default function ActionDetailPage({
  params,
}: {
  params: Promise<{ action_id: string }>;
}) {
  const { action_id } = use(params);

  const [action, setAction] = useState<ActionContract | null>(null);
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<ReceiptVerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [a, r] = await Promise.allSettled([
          fetchAction(action_id),
          fetchReceipt(action_id),
        ]);
        if (cancelled) return;
        if (a.status === "fulfilled") setAction(a.value);
        if (r.status === "fulfilled") setReceipt(r.value);
        if (a.status === "rejected") throw new Error(String(a.reason));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [action_id]);

  async function handleVerify() {
    if (!receipt) return;
    setVerifying(true);
    try {
      setVerification(await verifyReceipt(receipt.receipt_id));
    } catch {
      /* ignore */
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="font-mono text-brand-muted" style={{ fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  if (error || !action) {
    return (
      <div className="p-8">
        <p className="font-mono text-brand-bad" style={{ fontSize: 13 }}>
          {error ?? "Action not found"}
        </p>
      </div>
    );
  }

  const entity = action.target_entity
    ? Object.values(action.target_entity).join("/")
    : "—";

  return (
    <div className="p-6 max-w-4xl flex flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-brand-muted" style={{ fontSize: 12 }}>
        <Link href="/actions" className="hover:text-brand-accent transition-colors">Actions</Link>
        <span>/</span>
        <span className="text-brand-ink">{action_id.slice(0, 16)}…</span>
      </div>

      {/* Header card */}
      <div
        className="bg-brand-paper border border-brand-rule p-5 flex items-start justify-between gap-4"
        style={{ borderRadius: "var(--radius)" }}
      >
        <div className="flex flex-col gap-2">
          <p
            className="font-mono text-brand-ink"
            style={{ fontSize: 18, letterSpacing: "-0.01em", fontWeight: 500 }}
          >
            {action.action_type}
          </p>
          <p
            className="font-mono text-brand-muted"
            style={{ fontSize: 12 }}
          >
            {action_id}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <StatusPill status={action.status} />
            <span className="font-mono text-brand-subtle" style={{ fontSize: 11 }}>
              {formatAbsolute(action.updated_at)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-brand-muted" style={{ fontSize: 11 }}>Proposed by</p>
          <p className="font-mono text-brand-ink-soft" style={{ fontSize: 13 }}>{action.proposed_by}</p>
          <p className="font-mono text-brand-muted mt-2" style={{ fontSize: 11 }}>Target</p>
          <p className="font-mono text-brand-ink-soft" style={{ fontSize: 13 }}>{entity}</p>
        </div>
      </div>

      {/* Decision section */}
      <SectionCard eyebrow="Decision">
        <FieldRow
          label="Rule"
          value={
            receipt?.rule_id ? (
              <Link
                href={`/policies/${receipt.rule_id}`}
                className="font-mono text-brand-accent hover:text-brand-accent-deep transition-colors"
                style={{ fontSize: 13 }}
              >
                {receipt.rule_id}
              </Link>
            ) : (
              <span className="text-brand-subtle font-mono" style={{ fontSize: 13 }}>—</span>
            )
          }
        />
        <FieldRow
          label="Decision"
          value={receipt ? <StatusPill status={receipt.decision} /> : <StatusPill status={action.status} />}
        />
        {receipt?.conditions_evaluated && (
          <FieldRow
            label="Conditions"
            value={
              <div className="flex flex-col gap-1">
                {Object.entries(receipt.conditions_evaluated).map(([key, result]) => {
                  const r = result as { passed?: boolean; label?: string };
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span style={{ color: r.passed ? "var(--good)" : "var(--bad)", fontSize: 12 }}>
                        {r.passed ? "✓" : "✗"}
                      </span>
                      <span className="font-mono text-brand-muted" style={{ fontSize: 12 }}>
                        {r.label ?? key}
                      </span>
                    </div>
                  );
                })}
              </div>
            }
          />
        )}
      </SectionCard>

      {/* Parameters */}
      <SectionCard eyebrow="Parameters">
        <pre
          className="font-mono text-brand-ink-soft bg-brand-deep border border-brand-rule p-4 overflow-x-auto"
          style={{ fontSize: 12, lineHeight: 1.6, maxHeight: 320, borderRadius: "var(--radius-sm)" }}
        >
          {JSON.stringify(action.parameters, null, 2)}
        </pre>
      </SectionCard>

      {/* Receipt */}
      {receipt && (
        <SectionCard
          eyebrow="Receipt"
          right={
            <div className="flex items-center gap-2">
              <Link
                href={`/receipts/${receipt.receipt_id}`}
                className="font-mono text-brand-muted hover:text-brand-accent transition-colors"
                style={{ fontSize: 11 }}
              >
                Open receipt →
              </Link>
            </div>
          }
        >
          <FieldRow label="Receipt ID" value={
            <span className="font-mono text-brand-ink-soft" style={{ fontSize: 12 }}>{receipt.receipt_id}</span>
          } />
          <FieldRow label="Hash" value={
            <span className="font-mono text-brand-muted" style={{ fontSize: 11, wordBreak: "break-all" }}>
              {receipt.hash}
            </span>
          } />
          {receipt.signature && (
            <FieldRow label="Signature" value={
              <span className="font-mono text-brand-muted" style={{ fontSize: 11, wordBreak: "break-all" }}>
                {receipt.signature.slice(0, 48)}…
              </span>
            } />
          )}
          <div className="pt-3 flex items-center gap-3">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="btn-primary py-2"
              style={{ fontSize: 11 }}
            >
              {verifying ? "Verifying…" : "Verify integrity"}
            </button>
            {verification && (
              <span
                className="font-mono"
                style={{
                  fontSize: 12,
                  color: verification.hash_valid ? "var(--good)" : "var(--bad)",
                }}
              >
                {verification.hash_valid ? "✓ Hash valid" : "✗ Hash mismatch"}
                {verification.signature_valid !== null && (
                  <> · {verification.signature_valid ? "✓ Sig valid" : "✗ Sig invalid"}</>
                )}
              </span>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
