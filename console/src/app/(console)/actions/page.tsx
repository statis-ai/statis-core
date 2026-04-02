"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAllActions, type ActionContract } from "@/lib/api";

const FILTERS = ["All", "COMPLETED", "ESCALATED", "DENIED", "EXECUTING"];

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  ESCALATED: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  DENIED: "bg-red-500/15 text-red-400 border-red-500/20",
  EXECUTING: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  SHADOW: "bg-white/5 text-[#444444] border-[#1a1a1a]",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function isShadow(action: ActionContract): boolean {
  return (
    action.status === "SHADOW" ||
    (action.context && (action.context as Record<string, unknown>).shadow_mode === true)
  );
}

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    fetchAllActions({ limit: 100 })
      .then((data) => {
        setActions(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = actions.filter((a) => {
    const matchFilter = filter === "All" || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.action_id.toLowerCase().includes(q) ||
      `${a.target_entity.entity_type}/${a.target_entity.entity_id}`.toLowerCase().includes(q) ||
      a.action_type.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-white">Actions</h1>
        <p className="text-xs text-[#444444] mt-0.5">
          {loading ? "Loading..." : `${actions.length} total`}
        </p>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                filter === f
                  ? "bg-white/[0.08] text-[#d4d4d4] border border-white/[0.12]"
                  : "bg-transparent border border-[#1a1a1a] text-[#444444] hover:text-white hover:border-white/20"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444444]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 text-xs rounded border border-[#1a1a1a] bg-[#111111] text-white placeholder:text-[#444444] focus:outline-none focus:ring-1 focus:ring-white/20 w-48"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-[#888888] text-sm">Loading...</p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-[#444444] text-sm">No data</p>
      ) : (
        <div className="bg-[#111111] rounded border border-[#1a1a1a] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0a0a0a] border-b border-[#1a1a1a]">
              <tr className="text-[10px] uppercase tracking-widest text-[#444444]">
                <th className="text-left px-5 py-3 font-semibold">Action ID</th>
                <th className="text-left px-5 py-3 font-semibold">Entity</th>
                <th className="text-left px-5 py-3 font-semibold">Action Type</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold">Proposed By</th>
                <th className="text-left px-5 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.action_id}>
                  <td colSpan={6} className="p-0">
                    <div
                      className="grid grid-cols-[1fr_1fr_1fr_auto_1fr_auto] items-center hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === row.action_id ? null : row.action_id)
                      }
                    >
                      <span className="px-5 py-3 font-mono text-xs text-[#d4d4d4]">
                        {row.action_id}
                      </span>
                      <span className="px-5 py-3 font-mono text-xs text-[#888888]">
                        {row.target_entity.entity_type}/{row.target_entity.entity_id}
                      </span>
                      <span className="px-5 py-3 font-mono text-xs text-[#888888]">
                        {row.action_type}
                      </span>
                      <span className="px-5 py-3 flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded border",
                            STATUS_STYLES[row.status] ?? "bg-white/5 text-[#888888] border-[#1a1a1a]"
                          )}
                        >
                          {row.status}
                        </span>
                        {isShadow(row) && row.status !== "SHADOW" && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-white/5 text-[#444444] border-[#1a1a1a]">
                            SHADOW
                          </span>
                        )}
                      </span>
                      <span className="px-5 py-3 font-mono text-xs text-[#888888]">
                        {row.proposed_by}
                      </span>
                      <span className="px-5 py-3 text-[11px] text-[#444444] whitespace-nowrap">
                        {formatTime(row.created_at)}
                      </span>
                    </div>
                    {expandedId === row.action_id && (
                      <div className="px-5 pb-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
                        <div className="pt-3">
                          <p className="text-[10px] uppercase tracking-widest text-[#444444] mb-1">
                            Parameters
                          </p>
                          <pre className="text-xs text-[#888888] whitespace-pre-wrap break-all">
                            {JSON.stringify(row.parameters, null, 2)}
                          </pre>
                        </div>
                        {row.status === "COMPLETED" && (
                          <div className="mt-3">
                            <a
                              href={`/receipts?action_id=${row.action_id}`}
                              className="text-xs text-[#d4d4d4] hover:text-white transition-colors underline underline-offset-2"
                            >
                              View receipt
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
