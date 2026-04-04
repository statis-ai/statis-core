"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { fetchThreatLogs } from "@/lib/api";
import type { ThreatLog } from "@/lib/api";

const PAGE_SIZE = 100;

const LEVEL_STYLES: Record<string, { badge: string; dot: string }> = {
  critical: {
    badge: "bg-red-500/20 text-red-400 border border-red-500/30",
    dot: "bg-red-500",
  },
  high: {
    badge: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    dot: "bg-orange-500",
  },
  medium: {
    badge: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    dot: "bg-yellow-500",
  },
  low: {
    badge: "bg-[#1a1a1a] text-[#888888] border border-[#222]",
    dot: "bg-[#555]",
  },
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const FILTER_LEVELS = ["all", "critical", "high", "medium", "low"] as const;
type FilterLevel = (typeof FILTER_LEVELS)[number];

export default function ThreatLogsPage() {
  const [logs, setLogs] = useState<ThreatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterLevel>("all");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(
    async (level: FilterLevel, currentOffset: number, append = false) => {
      try {
        const data = await fetchThreatLogs({
          limit: PAGE_SIZE,
          offset: currentOffset,
          threat_level: level === "all" ? undefined : level,
        });
        setLogs((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === PAGE_SIZE);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load threat logs");
      }
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    setOffset(0);
    loadLogs(filter, 0, false).finally(() => setLoading(false));
  }, [filter, loadLogs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (offset === 0) {
        await loadLogs(filter, 0, false);
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [filter, offset, loadLogs]);

  async function handleRefresh() {
    setRefreshing(true);
    setOffset(0);
    await loadLogs(filter, 0, false);
    setRefreshing(false);
  }

  async function handleLoadMore() {
    const next = offset + PAGE_SIZE;
    setLoadingMore(true);
    await loadLogs(filter, next, true);
    setOffset(next);
    setLoadingMore(false);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#d4d4d4] mb-1">Threat Logs</h1>
          <p className="text-sm text-[#444444]">
            Security scans run on every proposed action before policy evaluation.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#1a1a1a] text-[#444444] text-xs hover:text-[#888888] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6">
        {FILTER_LEVELS.map((level) => {
          const styles = level !== "all" ? LEVEL_STYLES[level] : null;
          return (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize ${
                filter === level
                  ? level === "all"
                    ? "bg-white/[0.08] text-[#d4d4d4] border border-[#333]"
                    : styles!.badge
                  : "text-[#444444] hover:text-[#888888]"
              }`}
            >
              {level !== "all" && (
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${styles!.dot}`}
                />
              )}
              {level}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-[#1a1a1a] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_2fr_2fr_1fr_2fr_1fr] gap-4 px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0a0a0a]">
          {["ID", "Action ID", "Threat Types", "Level", "Details", "Scanned At"].map((h) => (
            <span key={h} className="text-[10px] font-semibold tracking-widest text-[#444444] uppercase">
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#444444]">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-[#444444]">
            <AlertOctagon size={28} />
            <p className="text-sm">No threat logs found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#111]">
            {logs.map((log) => {
              const level = log.threat_level in LEVEL_STYLES ? log.threat_level : "low";
              const styles = LEVEL_STYLES[level];
              return (
                <div
                  key={log.id}
                  className="grid grid-cols-[2fr_2fr_2fr_1fr_2fr_1fr] gap-4 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors"
                >
                  {/* ID */}
                  <span className="font-mono text-xs text-[#555555] truncate" title={log.id}>
                    {log.id.slice(0, 8)}…
                  </span>

                  {/* Action ID */}
                  <span className="font-mono text-xs text-[#888888] truncate" title={log.action_id}>
                    {log.action_id.slice(0, 12)}…
                  </span>

                  {/* Threat types */}
                  <div className="flex flex-wrap gap-1">
                    {(log.threat_types ?? []).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-[#1a1a1a] text-[#888888] border border-[#222] font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Threat level */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase w-fit ${styles.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                    {level}
                  </span>

                  {/* Details */}
                  <span className="text-xs text-[#555555] truncate" title={log.details ?? ""}>
                    {log.details ?? "—"}
                  </span>

                  {/* Scanned at */}
                  <span className="text-xs text-[#444444] whitespace-nowrap">
                    {formatDateTime(log.scanned_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 rounded border border-[#1a1a1a] text-[#444444] text-sm hover:text-[#888888] transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
