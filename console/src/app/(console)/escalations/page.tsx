"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchEscalations,
  approveEscalation,
  rejectEscalation,
  type EscalatedAction,
} from "@/lib/api";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function KeyValuePairs({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <span className="text-[#444444] text-xs">--</span>;
  }
  return (
    <div className="space-y-1">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-2 font-mono text-xs">
          <span className="text-[#444444] shrink-0">{key}:</span>
          <span className="text-[#888888] break-all">
            {typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function EscalationCard({
  esc,
  onResolved,
}: {
  esc: EscalatedAction;
  onResolved: () => void;
}) {
  const [reviewerId, setReviewerId] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"approved" | "denied" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const entityLabel = esc.target_entity
    ? Object.entries(esc.target_entity)
        .map(([k, v]) => `${k}/${v}`)
        .join(", ")
    : "--";

  async function handleApprove() {
    if (!reviewerId.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await approveEscalation(
        esc.action_id,
        reviewerId.trim(),
        note.trim() || undefined
      );
      setResult("approved");
      setTimeout(onResolved, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeny() {
    if (!reviewerId.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await rejectEscalation(
        esc.action_id,
        reviewerId.trim(),
        note.trim() || undefined
      );
      setResult("denied");
      setTimeout(onResolved, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deny failed");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full font-mono text-sm px-3 py-2 rounded border border-[#1a1a1a] bg-[#0a0a0a] text-white placeholder:text-[#444444] focus:outline-none focus:ring-1 focus:ring-white/20";

  return (
    <div
      className={cn(
        "bg-[#111111] rounded border p-6 transition-colors",
        result === "approved"
          ? "border-emerald-500/25"
          : result === "denied"
          ? "border-[#1a1a1a] opacity-50"
          : "border-[#1a1a1a]"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-semibold text-white">
              {entityLabel}
            </span>
            <span className="text-[#444444]">--</span>
            <span className="font-mono text-sm text-[#888888]">
              {esc.action_type}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#444444]">
            <span className="font-mono">{esc.action_id}</span>
            <span className="text-[#333]">--</span>
            <span className="font-mono">by {esc.proposed_by}</span>
            <span className="text-[#333]">--</span>
            <span>{formatTime(esc.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#444444] bg-white/[0.04] border border-[#1a1a1a] px-2 py-0.5 rounded">
            {esc.target_system}
          </span>
          {result === "approved" ? (
            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={10} />
              Approved
            </span>
          ) : result === "denied" ? (
            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-[#444444] border border-[#1a1a1a]">
              <XCircle size={10} />
              Denied
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
              <AlertTriangle size={10} />
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Parameters */}
      {Object.keys(esc.parameters).length > 0 && (
        <div className="bg-[#0a0a0a] rounded p-4 border border-[#1a1a1a] mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] mb-2">
            Parameters
          </p>
          <KeyValuePairs data={esc.parameters} />
        </div>
      )}

      {/* Context */}
      {Object.keys(esc.context).length > 0 && (
        <div className="bg-orange-500/[0.06] border border-orange-500/15 rounded px-4 py-3 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-400 mb-2">
            Context
          </p>
          <KeyValuePairs data={esc.context} />
        </div>
      )}

      {/* Result message */}
      {result === "approved" && (
        <div className="bg-emerald-500/[0.08] border border-emerald-500/15 rounded px-4 py-3 mb-4 text-xs text-emerald-400 font-medium">
          Escalation approved successfully.
        </div>
      )}
      {result === "denied" && (
        <div className="bg-white/[0.04] border border-[#1a1a1a] rounded px-4 py-3 mb-4 text-xs text-[#888888]">
          Escalation denied.
        </div>
      )}

      {/* Review panel */}
      {!result && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#d4d4d4] font-medium hover:text-white transition-colors mb-3"
          >
            {expanded ? "Collapse review" : "Review this escalation"}
          </button>

          {expanded && (
            <div className="border-t border-[#1a1a1a] pt-4 space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-1.5">
                  Reviewer ID
                </label>
                <input
                  placeholder="e.g. reviewer-aniket"
                  value={reviewerId}
                  onChange={(e) => setReviewerId(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-1.5">
                  Note (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Add a review note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={cn(inputCls, "resize-y")}
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 font-mono">{error}</p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleApprove}
                  disabled={submitting || !reviewerId.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 border border-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={14} />
                  {submitting ? "..." : "Approve"}
                </button>
                <button
                  onClick={handleDeny}
                  disabled={submitting || !reviewerId.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded border border-[#1a1a1a] text-[#888888] text-sm font-medium hover:text-white hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <XCircle size={14} />
                  {submitting ? "..." : "Deny"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<EscalatedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchEscalations();
      setEscalations(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load escalations"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = escalations.length;

  if (loading) {
    return (
      <div className="p-8 max-w-3xl">
        <p className="text-sm text-[#888888]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[20px] font-semibold text-white">Escalations</h1>
          {pending > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20">
              {pending}
            </span>
          )}
        </div>
        <p className="text-xs text-[#444444]">
          {pending} pending escalation{pending !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-mono">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-3 text-red-400/60 hover:text-red-400"
          >
            dismiss
          </button>
        </div>
      )}

      {escalations.length === 0 ? (
        <div className="text-center py-16 text-[#444444] text-sm">
          No pending escalations
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {escalations.map((esc) => (
            <EscalationCard key={esc.action_id} esc={esc} onResolved={load} />
          ))}
        </div>
      )}
    </div>
  );
}
