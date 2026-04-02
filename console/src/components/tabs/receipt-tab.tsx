"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ShieldCheck, Copy, Check } from "lucide-react";
import type { ReceiptDetail } from "@/lib/api";
import { fetchReceipt } from "@/lib/api";

interface Props {
  actionId: string | null;
}

const DECISION_STYLES: Record<string, { icon: string; bg: string; text: string; border: string }> = {
  APPROVED:  { icon: "✓", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-400/30" },
  DENIED:    { icon: "✗", bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-400/30" },
  ESCALATED: { icon: "⚠", bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-400/30" },
  COMPLETED: { icon: "✓", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-400/30" },
  FAILED:    { icon: "✗", bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-400/30" },
};

function HashDisplay({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-[#d4d4d4] bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 overflow-x-auto">
      <span className="flex-1 break-all">{hash}</span>
      <button
        onClick={copy}
        className="shrink-0 text-[#888888] hover:text-white transition-colors"
        title="Copy hash"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function ReceiptTab({ actionId }: Props) {
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!actionId) {
      setReceipt(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchReceipt(actionId)
      .then(setReceipt)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [actionId]);

  if (!actionId) {
    return (
      <div className="p-10 text-center">
        <ShieldCheck className="w-10 h-10 text-[#888888]/30 mx-auto mb-3" />
        <p className="text-[#888888] text-sm">Select an action from the Actions tab to view its receipt.</p>
      </div>
    );
  }

  if (loading) return <p className="text-[#888888] animate-pulse p-6">Loading receipt...</p>;

  if (error) {
    const isNotFound = error.includes("404");
    return (
      <div className="p-10 text-center">
        <p className={isNotFound ? "text-[#888888] text-sm" : "text-red-400 text-sm"}>
          {isNotFound
            ? "No receipt yet -- this action hasn't been evaluated or executed."
            : error}
        </p>
        <p className="text-[#888888]/50 text-xs mt-1 font-mono">{actionId}</p>
      </div>
    );
  }

  if (!receipt) return null;

  const decision = DECISION_STYLES[receipt.decision] ?? DECISION_STYLES["DENIED"];
  const conditions = receipt.conditions_evaluated
    ? Object.entries(receipt.conditions_evaluated)
    : [];

  return (
    <div className="p-6 space-y-6">

      {/* Decision banner */}
      <div className={`flex items-center gap-4 p-4 rounded border ${decision.bg} ${decision.border}`}>
        <span className={`text-3xl font-bold ${decision.text}`}>{decision.icon}</span>
        <div>
          <p className={`text-xl font-bold tracking-wide ${decision.text}`}>{receipt.decision}</p>
          <p className="text-xs text-[#888888] font-mono mt-0.5">receipt: {receipt.receipt_id}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-[#444444] uppercase tracking-widest">Evaluated at</p>
          <p className="text-xs text-white font-mono">
            {new Date(receipt.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Rule */}
      {receipt.rule_id && (
        <Section title="Policy Rule">
          <div className="grid grid-cols-2 gap-4">
            <KV label="Rule ID" value={receipt.rule_id} mono />
            <KV label="Version" value={receipt.rule_version ?? "—"} mono />
            <KV label="Approved By" value={receipt.approved_by} />
          </div>
        </Section>
      )}

      {/* Conditions evaluated */}
      {conditions.length > 0 && (
        <Section title="Conditions Evaluated">
          <div className="divide-y divide-[#1a1a1a] rounded border border-[#1a1a1a] overflow-hidden">
            {conditions.map(([key, cond]) => (
              <div key={key} className="flex items-center gap-4 px-4 py-3 bg-[#0a0a0a]">
                <div className="shrink-0">
                  {cond.passed
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{cond.label}</p>
                  <p className="text-xs font-mono text-[#888888] mt-0.5">{key}</p>
                </div>
                <div className="text-right shrink-0">
                  {"actual" in cond && (
                    <p className="text-xs text-[#888888]">
                      actual: <span className="text-white font-mono">{String(cond.actual ?? "null")}</span>
                    </p>
                  )}
                  {"threshold" in cond && (
                    <p className="text-xs text-[#888888]">
                      required: <span className="text-white font-mono">&ge; {cond.threshold}</span>
                      {" · "}actual: <span className="text-white font-mono">{String(cond.actual ?? "null")}</span>
                    </p>
                  )}
                  {"days" in cond && (
                    <p className="text-xs text-[#888888]">
                      last discount: <span className="text-white font-mono">{cond.actual_last_discount ?? "none"}</span>
                    </p>
                  )}
                </div>
                <span className={`shrink-0 text-xs font-bold ${cond.passed ? "text-emerald-400" : "text-red-400"}`}>
                  {cond.passed ? "PASS" : "FAIL"}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Entity state snapshot */}
      {receipt.entity_state_snapshot && Object.keys(receipt.entity_state_snapshot).length > 0 && (
        <Section title="Entity State at Evaluation">
          <div className="divide-y divide-[#1a1a1a] rounded border border-[#1a1a1a] overflow-hidden">
            {Object.entries(receipt.entity_state_snapshot).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center px-4 py-2.5 bg-[#0a0a0a]">
                <span className="font-mono text-xs text-[#888888]">{k}</span>
                <span className="font-mono text-xs text-[#d4d4d4]">{JSON.stringify(v)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Execution result */}
      <Section title="Execution">
        {receipt.executed_at ? (
          <div className="space-y-3">
            <KV label="Executed At" value={new Date(receipt.executed_at).toLocaleString()} />
            {receipt.execution_result && (
              <pre className="rounded border border-[#1a1a1a] bg-[#0a0a0a] p-3 text-xs font-mono text-[#d4d4d4] overflow-auto max-h-40">
                {JSON.stringify(receipt.execution_result, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#888888] italic">
            {receipt.decision === "DENIED"
              ? "Action was denied -- no execution occurred."
              : "Execution pending."}
          </p>
        )}
      </Section>

      {/* SHA-256 hash */}
      <Section title="Tamper-Evident Hash (SHA-256)">
        <HashDisplay hash={receipt.hash} />
        <p className="mt-2 text-xs text-[#888888]/60 leading-relaxed">
          This hash covers: receipt_id, action_id, decision, rule_id, rule_version, approved_by,
          executed_at, execution_result, and created_at. Any modification invalidates this hash.
        </p>
      </Section>

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-[#444444] uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded border border-[#1a1a1a] bg-[#0a0a0a] px-3 py-2">
      <p className="text-[#444444] text-xs uppercase tracking-wider">{label}</p>
      <p className={`mt-0.5 text-white text-sm truncate ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
