"use client";

import { useEffect, useState } from "react";
import {
  approveEscalation,
  fetchEscalations,
  rejectEscalation,
  type EscalatedAction,
} from "@/lib/api";

export default function EscalationPanel() {
  const [items, setItems] = useState<EscalatedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EscalatedAction | null>(null);
  const [reviewerId, setReviewerId] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function reload() {
    setLoading(true);
    setError(null);
    fetchEscalations()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  async function handleDecision(decision: "approve" | "reject") {
    if (!selected || !reviewerId.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      if (decision === "approve") {
        await approveEscalation(selected.action_id, reviewerId.trim(), note || undefined);
      } else {
        await rejectEscalation(selected.action_id, reviewerId.trim(), note || undefined);
      }
      setSelected(null);
      setReviewerId("");
      setNote("");
      reload();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Queue list */}
      <div className="w-1/2 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Escalation Queue
          </h2>
          {items.length > 0 && (
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-semibold">
              {items.length} pending
            </span>
          )}
        </div>

        {loading && (
          <p className="text-[#888888] text-sm animate-pulse">Loading...</p>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#888888] text-sm">No escalated actions.</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const isSelected = selected?.action_id === item.action_id;
            return (
              <button
                key={item.action_id}
                onClick={() => { setSelected(item); setActionError(null); }}
                className={`text-left rounded border px-4 py-3 transition-colors ${
                  isSelected
                    ? "border-orange-500/40 bg-orange-500/10"
                    : "border-[#1a1a1a] bg-[#111111] hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-[#d4d4d4] truncate max-w-[14rem]">
                    {item.action_id}
                  </span>
                  <span className="text-xs text-orange-400 font-semibold">ESCALATED</span>
                </div>
                <div className="text-xs text-white font-medium">{item.action_type}</div>
                <div className="text-xs text-[#888888] mt-0.5">
                  {item.target_entity.entity_type} / {item.target_entity.entity_id}
                  {" · "}proposed by {item.proposed_by}
                </div>
                <div className="text-xs text-[#444444] mt-0.5">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review panel */}
      <div className="w-1/2 flex flex-col gap-4">
        {selected ? (
          <>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Review Action
            </h2>

            <div className="rounded border border-[#1a1a1a] bg-[#111111] p-4 space-y-2 text-xs">
              <Row label="Action ID" value={selected.action_id} mono />
              <Row label="Type" value={selected.action_type} />
              <Row label="Target" value={`${selected.target_entity.entity_type} / ${selected.target_entity.entity_id}`} />
              <Row label="System" value={selected.target_system} />
              <Row label="Proposed By" value={selected.proposed_by} />
              <Row label="Proposed At" value={new Date(selected.created_at).toLocaleString()} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#888888] font-medium">
                Reviewer ID <span className="text-red-400">*</span>
              </label>
              <input
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
                placeholder="your-name or user-id"
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded px-3 py-2 text-sm text-white placeholder:text-[#444444] focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#888888] font-medium">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Reason for approval or rejection..."
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded px-3 py-2 text-sm text-white placeholder:text-[#444444] focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 resize-none"
              />
            </div>

            {actionError && (
              <p className="text-red-400 text-xs">{actionError}</p>
            )}

            <div className="flex gap-3">
              <button
                disabled={submitting || !reviewerId.trim()}
                onClick={() => handleDecision("approve")}
                className="flex-1 py-2 rounded text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "..." : "Approve"}
              </button>
              <button
                disabled={submitting || !reviewerId.trim()}
                onClick={() => handleDecision("reject")}
                className="flex-1 py-2 rounded text-sm font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "..." : "Reject"}
              </button>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="text-xs text-[#888888] hover:text-white transition-colors"
            >
              ← Back to queue
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#888888] text-sm">Select an escalation to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#888888] w-24 shrink-0">{label}</span>
      <span className={`text-white break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
