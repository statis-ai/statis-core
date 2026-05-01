"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchReceiptById,
  fetchAction,
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

function SectionCard({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="bg-brand-paper border border-brand-rule" style={{ borderRadius: "var(--radius)" }}>
      <div className="px-5 py-3 border-b border-brand-rule">
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-2 border-b border-brand-rule-soft last:border-0">
      <span className="font-mono text-brand-muted shrink-0 w-36" style={{ fontSize: 11 }}>{label}</span>
      <div className="text-brand-ink-soft flex-1" style={{ fontSize: 13 }}>{value}</div>
    </div>
  );
}

export default function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ receipt_id: string }>;
}) {
  const { receipt_id } = use(params);

  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [action, setAction] = useState<ActionContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<ReceiptVerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetchReceiptById(receipt_id);
        if (cancelled) return;
        setReceipt(r);
        const a = await fetchAction(r.action_id);
        if (!cancelled) setAction(a);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [receipt_id]);

  async function handleVerify() {
    if (!receipt) return;
    setVerifying(true);
    try { setVerification(await verifyReceipt(receipt.receipt_id)); }
    catch { /* ignore */ }
    finally { setVerifying(false); }
  }

  if (loading) {
    return <div className="p-8"><p className="font-mono text-brand-muted" style={{ fontSize: 13 }}>Loading...</p></div>;
  }

  if (error || !receipt) {
    return <div className="p-8"><p className="font-mono text-brand-bad" style={{ fontSize: 13 }}>{error ?? "Receipt not found"}</p></div>;
  }

  return (
    <div className="p-6 max-w-4xl flex flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-brand-muted" style={{ fontSize: 12 }}>
        <Link href="/receipts" className="hover:text-brand-accent transition-colors">Receipts</Link>
        <span>/</span>
        <span className="text-brand-ink">{receipt_id.slice(0, 16)}…</span>
      </div>

      {/* Header */}
      <div className="bg-brand-paper border border-brand-rule p-5 flex items-start justify-between gap-4" style={{ borderRadius: "var(--radius)" }}>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-brand-muted" style={{ fontSize: 11 }}>Receipt</p>
          <p className="font-mono text-brand-ink" style={{ fontSize: 14, wordBreak: "break-all" }}>
            {receipt_id}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <StatusPill status={receipt.decision} />
            {verification && (
              <span className="font-mono" style={{ fontSize: 11, color: verification.hash_valid ? "var(--good)" : "var(--bad)" }}>
                {verification.hash_valid ? "✓ Verified" : "✗ Tampered"}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-mono text-brand-muted" style={{ fontSize: 11 }}>Executed</p>
          <p className="font-mono text-brand-ink-soft" style={{ fontSize: 13 }}>
            {receipt.executed_at ? formatAbsolute(receipt.executed_at) : "—"}
          </p>
        </div>
      </div>

      {/* Linked action */}
      {action && (
        <SectionCard eyebrow="Linked action">
          <FieldRow label="Action ID" value={
            <Link href={`/actions/${action.action_id}`} className="font-mono text-brand-accent hover:text-brand-accent-deep transition-colors" style={{ fontSize: 13 }}>
              {action.action_id}
            </Link>
          } />
          <FieldRow label="Type" value={<span className="font-mono text-brand-ink-soft" style={{ fontSize: 13 }}>{action.action_type}</span>} />
          <FieldRow label="Agent" value={<span className="font-mono text-brand-muted" style={{ fontSize: 13 }}>{action.proposed_by}</span>} />
          <FieldRow label="Status" value={<StatusPill status={action.status} />} />
        </SectionCard>
      )}

      {/* Decision detail */}
      <SectionCard eyebrow="Decision detail">
        <FieldRow label="Rule" value={
          receipt.rule_id ? (
            <Link href={`/policies/${receipt.rule_id}`} className="font-mono text-brand-accent hover:text-brand-accent-deep transition-colors" style={{ fontSize: 13 }}>
              {receipt.rule_id}
            </Link>
          ) : <span className="font-mono text-brand-subtle" style={{ fontSize: 13 }}>—</span>
        } />
        <FieldRow label="Rule version" value={<span className="font-mono text-brand-muted" style={{ fontSize: 13 }}>{receipt.rule_version ?? "—"}</span>} />
        <FieldRow label="Approved by" value={<span className="font-mono text-brand-muted" style={{ fontSize: 13 }}>{receipt.approved_by}</span>} />
        {receipt.conditions_evaluated && (
          <FieldRow label="Conditions" value={
            <div className="flex flex-col gap-1">
              {Object.entries(receipt.conditions_evaluated).map(([key, result]) => {
                const r = result as { passed?: boolean; label?: string };
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span style={{ color: r.passed ? "var(--good)" : "var(--bad)", fontSize: 12 }}>
                      {r.passed ? "✓" : "✗"}
                    </span>
                    <span className="font-mono text-brand-muted" style={{ fontSize: 12 }}>{r.label ?? key}</span>
                  </div>
                );
              })}
            </div>
          } />
        )}
        {receipt.entity_state_snapshot && (
          <div className="mt-3">
            <details>
              <summary className="font-mono text-brand-muted cursor-pointer" style={{ fontSize: 11 }}>
                Entity state snapshot
              </summary>
              <pre
                className="font-mono text-brand-muted bg-brand-deep border border-brand-rule p-3 mt-2 overflow-x-auto"
                style={{ fontSize: 11, lineHeight: 1.6, maxHeight: 240, borderRadius: "var(--radius-sm)" }}
              >
                {JSON.stringify(receipt.entity_state_snapshot, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </SectionCard>

      {/* Cryptographic proof */}
      <SectionCard eyebrow="Cryptographic proof">
        <FieldRow label="Hash (SHA-256)" value={
          <span className="font-mono text-brand-muted" style={{ fontSize: 11, wordBreak: "break-all" }}>
            {receipt.hash}
          </span>
        } />
        {receipt.signature && (
          <>
            <FieldRow label="Signature alg" value={
              <span className="font-mono text-brand-muted" style={{ fontSize: 12 }}>{receipt.signature_alg}</span>
            } />
            <FieldRow label="Public key ID" value={
              <span className="font-mono text-brand-muted" style={{ fontSize: 12 }}>{receipt.public_key_id}</span>
            } />
          </>
        )}
        <div className="pt-3 flex items-center gap-3">
          <button onClick={handleVerify} disabled={verifying} className="btn-primary py-2" style={{ fontSize: 11 }}>
            {verifying ? "Verifying…" : "Verify integrity"}
          </button>
          {verification && (
            <span className="font-mono" style={{ fontSize: 12, color: verification.hash_valid ? "var(--good)" : "var(--bad)" }}>
              {verification.hash_valid ? "✓ Hash valid" : "✗ Hash mismatch"}
              {verification.signature_valid !== null && (
                <> · {verification.signature_valid ? "✓ Sig valid" : "✗ Sig invalid"}</>
              )}
            </span>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
