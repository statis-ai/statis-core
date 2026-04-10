"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  AlertOctagon,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  CircleAlert,
} from "lucide-react";
import { fetchThreatLogs } from "@/lib/api";
import type { ThreatLog } from "@/lib/api";
import { PageHeader } from "@/components/observe/PageHeader";
import { LiveBadge } from "@/components/observe/LiveBadge";
import { StatTile, StatTileGrid } from "@/components/observe/StatTile";
import { FilterChip, FilterChipRow } from "@/components/observe/FilterChip";
import {
  DataTableShell,
  DataTableEmpty,
} from "@/components/observe/DataTableShell";

const PAGE_SIZE = 100;

const LEVEL_PALETTE: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  critical: {
    color: "#F87171",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.35)",
  },
  high: {
    color: "#FB923C",
    bg: "rgba(251,146,60,0.12)",
    border: "rgba(251,146,60,0.35)",
  },
  medium: {
    color: "#FACC15",
    bg: "rgba(250,204,21,0.12)",
    border: "rgba(250,204,21,0.32)",
  },
  low: {
    color: "#A1A1AA",
    bg: "rgba(161,161,170,0.10)",
    border: "rgba(161,161,170,0.25)",
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
        setError(null);
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

  const stats = useMemo(() => {
    const total = logs.length;
    const critical = logs.filter((l) => l.threat_level === "critical").length;
    const high = logs.filter((l) => l.threat_level === "high").length;
    const low = logs.filter(
      (l) => l.threat_level === "low" || l.threat_level === "medium"
    ).length;
    return { total, critical, high, low };
  }, [logs]);

  return (
    <div className="p-6 lg:p-8 w-full">
      <PageHeader
        title="Threat Logs"
        subtitle="Security scans run on every proposed action before policy evaluation."
        actions={
          <>
            <LiveBadge refreshSeconds={30} />
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-60"
              style={{
                color: "var(--text-2)",
                background: "color-mix(in srgb, var(--text) 4%, transparent)",
                border: "1px solid var(--border)",
              }}
            >
              <RefreshCw
                size={12}
                className={refreshing ? "animate-spin" : undefined}
              />
              Refresh
            </button>
          </>
        }
      />

      {error && (
        <div
          className="mb-5 rounded-xl px-4 py-3 text-[12px] font-mono flex items-center gap-3"
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.25)",
            color: "#F87171",
          }}
        >
          <CircleAlert size={14} />
          {error}
        </div>
      )}

      <div className="mb-6">
        <StatTileGrid>
          <StatTile
            label="Total scans"
            value={stats.total.toLocaleString()}
            hint="Loaded in current view"
            icon={<ShieldCheck size={13} />}
          />
          <StatTile
            label="Critical"
            value={stats.critical.toLocaleString()}
            trend={stats.critical > 0 ? "down" : "up"}
            hint="Auto-blocked by scanner"
            icon={<AlertOctagon size={13} />}
          />
          <StatTile
            label="High severity"
            value={stats.high.toLocaleString()}
            trend={stats.high > 0 ? "down" : "neutral"}
            hint="Needs review"
            icon={<ShieldAlert size={13} />}
          />
          <StatTile
            label="Low/medium"
            value={stats.low.toLocaleString()}
            hint="Informational"
            icon={<ShieldCheck size={13} />}
          />
        </StatTileGrid>
      </div>

      <div className="mb-4">
        <FilterChipRow>
          {FILTER_LEVELS.map((level) => (
            <FilterChip
              key={level}
              label={level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
              active={filter === level}
              onClick={() => setFilter(level)}
            />
          ))}
        </FilterChipRow>
      </div>

      <DataTableShell
        title={`Scan log · ${logs.length.toLocaleString()} rows`}
        actions={
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Critical + high should always be zero
          </span>
        }
        footer={
          loading
            ? "Loading…"
            : hasMore
              ? `Showing ${logs.length} · more available`
              : `Showing all ${logs.length} entries`
        }
      >
        {loading ? (
          <div>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_2fr_120px_2fr_160px] gap-4 px-5 py-3"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                {[90, 100, 140, 70, 180, 120].map((w, j) => (
                  <div
                    key={j}
                    className="h-3 rounded animate-pulse"
                    style={{
                      width: w,
                      background:
                        "color-mix(in srgb, var(--text) 5%, transparent)",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <DataTableEmpty
            icon={<ShieldCheck size={18} />}
            title="No threat events"
            description="No matching scans for this filter. An empty log is a healthy signal — every proposed action has been clean."
          />
        ) : (
          <div>
            <div
              className="grid grid-cols-[1fr_1fr_2fr_120px_2fr_160px] gap-4 px-5 py-3 sticky top-0 z-10"
              style={{
                background: "color-mix(in srgb, var(--bg) 92%, transparent)",
                borderBottom: "1px solid var(--border)",
                backdropFilter: "blur(8px)",
              }}
            >
              {["ID", "Action ID", "Threat types", "Level", "Details", "Scanned at"].map(
                (h) => (
                  <div
                    key={h}
                    className="text-[9px] font-semibold tracking-[0.14em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </div>
                )
              )}
            </div>
            {logs.map((log) => {
              const level =
                log.threat_level in LEVEL_PALETTE ? log.threat_level : "low";
              const palette = LEVEL_PALETTE[level];
              return (
                <div
                  key={log.id}
                  className="grid grid-cols-[1fr_1fr_2fr_120px_2fr_160px] gap-4 px-5 py-3 items-center transition-colors"
                  style={{
                    borderTop: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "color-mix(in srgb, var(--text) 2%, transparent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }}
                >
                  <span
                    className="font-mono text-[11px] truncate"
                    style={{ color: "var(--text-muted)" }}
                    title={log.id}
                  >
                    {log.id.slice(0, 8)}…
                  </span>
                  <span
                    className="font-mono text-[11px] truncate"
                    style={{ color: "var(--text-2)" }}
                    title={log.action_id}
                  >
                    {log.action_id.slice(0, 14)}…
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(log.threat_types ?? []).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                        style={{
                          background:
                            "color-mix(in srgb, var(--text) 4%, transparent)",
                          border: "1px solid var(--border)",
                          color: "var(--text-2)",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide w-fit"
                    style={{
                      color: palette.color,
                      background: palette.bg,
                      border: `1px solid ${palette.border}`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: palette.color }}
                    />
                    {level}
                  </span>
                  <span
                    className="text-[11px] truncate"
                    style={{ color: "var(--text-2)" }}
                    title={log.details ?? ""}
                  >
                    {log.details ?? "—"}
                  </span>
                  <span
                    className="text-[11px] whitespace-nowrap tabular-nums"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {formatDateTime(log.scanned_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </DataTableShell>

      {hasMore && !loading && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 rounded-full text-[12px] font-semibold transition-colors disabled:opacity-50"
            style={{
              color: "var(--text-2)",
              background: "color-mix(in srgb, var(--text) 4%, transparent)",
              border: "1px solid var(--border)",
            }}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
