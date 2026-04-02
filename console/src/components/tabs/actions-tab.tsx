"use client";

import { useEffect, useState } from "react";
import type { ActionContract } from "@/lib/api";
import { fetchActions } from "@/lib/api";

interface Props {
  entityType: string;
  entityId: string;
  selectedActionId: string | null;
  onSelectAction: (actionId: string) => void;
}

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> = {
  PROPOSED:   { dot: "bg-orange-400",    text: "text-orange-400",    bg: "bg-orange-500/10" },
  EVALUATING: { dot: "bg-blue-400",      text: "text-blue-400",      bg: "bg-blue-400/10" },
  APPROVED:   { dot: "bg-emerald-400",   text: "text-emerald-400",   bg: "bg-emerald-500/10" },
  DENIED:     { dot: "bg-red-400",       text: "text-red-400",       bg: "bg-red-500/10" },
  ESCALATED:  { dot: "bg-orange-400",    text: "text-orange-400",    bg: "bg-orange-500/10" },
  EXECUTING:  { dot: "bg-blue-400 animate-pulse", text: "text-blue-400", bg: "bg-blue-400/10" },
  COMPLETED:  { dot: "bg-emerald-400",   text: "text-emerald-400",   bg: "bg-emerald-500/10" },
  FAILED:     { dot: "bg-red-400",       text: "text-red-400",       bg: "bg-red-500/10" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { dot: "bg-gray-400", text: "text-gray-400", bg: "bg-gray-400/10" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${s.text} ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export default function ActionsTab({ entityType, entityId, selectedActionId, onSelectAction }: Props) {
  const [actions, setActions] = useState<ActionContract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchActions(entityType, entityId)
      .then(setActions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  if (loading) return <p className="text-[#888888] animate-pulse p-6">Loading actions...</p>;
  if (error) return <p className="text-red-400 p-6">{error}</p>;
  if (actions.length === 0) return (
    <div className="p-10 text-center">
      <p className="text-[#888888]">No action contracts found for this entity.</p>
      <p className="text-[#888888]/50 text-xs mt-1">Run the demo script to create one.</p>
    </div>
  );

  return (
    <div className="overflow-auto">
      <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
        <p className="text-xs text-[#888888]">
          {actions.length} action{actions.length !== 1 ? "s" : ""} — click a row to view its receipt
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1a1a1a] text-left text-xs font-medium text-[#444444] uppercase tracking-wider">
            <th className="px-4 py-2.5">Action ID</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Proposed By</th>
            <th className="px-4 py-2.5">System</th>
            <th className="px-4 py-2.5">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a1a1a]">
          {actions.map((a) => {
            const isSelected = a.action_id === selectedActionId;
            return (
              <tr
                key={a.action_id}
                onClick={() => onSelectAction(a.action_id)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#d4d4d4]/10 border-l-2 border-[#d4d4d4]"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                <td className="px-4 py-3 font-mono text-xs text-[#d4d4d4] truncate max-w-[12rem]">
                  {a.action_id}
                </td>
                <td className="px-4 py-3 text-white text-xs font-medium">{a.action_type}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3 text-xs text-[#888888]">{a.proposed_by}</td>
                <td className="px-4 py-3 text-xs text-[#888888]">{a.target_system}</td>
                <td className="px-4 py-3 text-xs text-[#888888] whitespace-nowrap">
                  {new Date(a.created_at).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
