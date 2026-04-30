"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Copy,
  Check,
  ArrowUpRight,
  RefreshCw,
  Activity,
  CircleCheck,
  CircleAlert,
  CircleX,
  Loader2,
} from "lucide-react";
import { fetchAllActions, type ActionContract } from "@/lib/api";
import { PageHeader } from "@/components/observe/PageHeader";
import { LiveBadge } from "@/components/observe/LiveBadge";
import { TimePicker, type TimeRange } from "@/components/observe/TimePicker";
import { StatTile, StatTileGrid } from "@/components/observe/StatTile";
import { FilterChip, FilterChipRow } from "@/components/observe/FilterChip";
import { StatusPill } from "@/components/observe/StatusPill";
import {
  DataTableShell,
  DataTableEmpty,
} from "@/components/observe/DataTableShell";
import { MiniHistogram } from "@/components/observe/MiniHistogram";

type FilterKey = "ALL" | "COMPLETED" | "ESCALATED" | "DENIED" | "EXECUTING";

const FILTER_LABELS: Record<FilterKey, string> = {
  ALL: "All",
  COMPLETED: "Completed",
  ESCALATED: "Escalated",
  DENIED: "Denied",
  EXECUTING: "Executing",
};

// How many minutes a TimeRange covers — used to slice the recent action set
// into histogram buckets. Keep in sync with TimePicker options.
const RANGE_MINUTES: Record<TimeRange, number> = {
  "15m": 15,
  "1h": 60,
  "4h": 240,
  "24h": 1440,
  "7d": 10080,
  "30d": 43200,
};

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function isShadow(action: ActionContract): boolean {
  return (
    action.status === "SHADOW" ||
    (action.context &&
      (action.context as Record<string, unknown>).shadow_mode === true)
  );
}

// Stable color per entity type so rows stay visually consistent
const ENTITY_COLORS = ["#A78BFA", "#34D399", "#60A5FA", "#FACC15", "#F472B6", "#22D3EE", "#FB923C"];
function entityColor(entityType: string): string {
  let hash = 0;
  for (let i = 0; i < entityType.length; i++) {
    hash = (hash << 5) - hash + entityType.charCodeAt(i);
    hash |= 0;
  }
  return ENTITY_COLORS[Math.abs(hash) % ENTITY_COLORS.length];
}

function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <span className="group inline-flex items-center gap-1.5 font-mono text-[11px]">
      <span style={{ color: "var(--text)" }}>{id}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "var(--text-muted)" }}
        title="Copy action ID"
      >
        {copied ? (
          <Check size={11} style={{ color: "#34D399" }} />
        ) : (
          <Copy size={11} />
        )}
      </button>
    </span>
  );
}

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>("24h");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = async (showSpinner = true) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await fetchAllActions({ limit: 5000 });
      setActions(data);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(false);
    const interval = setInterval(() => load(false), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Counts per status (for filter chips) ──────────────────
  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      ALL: actions.length,
      COMPLETED: 0,
      ESCALATED: 0,
      DENIED: 0,
      EXECUTING: 0,
    };
    for (const a of actions) {
      if (a.status === "COMPLETED") c.COMPLETED++;
      else if (a.status === "ESCALATED") c.ESCALATED++;
      else if (a.status === "DENIED") c.DENIED++;
      else if (a.status === "EXECUTING") c.EXECUTING++;
    }
    return c;
  }, [actions]);

  // ── Stat tiles ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = actions.length;
    const completed = counts.COMPLETED;
    const successRate =
      total > 0 ? ((completed / total) * 100).toFixed(2) : "0.00";
    const escalated = counts.ESCALATED;
    const executing = counts.EXECUTING;
    return { total, successRate, escalated, executing };
  }, [actions, counts]);

  // ── Histogram buckets over the selected range ──────────────
  const histogram = useMemo(() => {
    const minutes = RANGE_MINUTES[range];
    const buckets = 24;
    const bucketMs = (minutes * 60 * 1000) / buckets;
    const now = Date.now();
    const start = now - minutes * 60 * 1000;
    const out = new Array(buckets).fill(0);
    for (const a of actions) {
      const t = new Date(a.created_at).getTime();
      if (t < start || t > now) continue;
      const idx = Math.min(
        buckets - 1,
        Math.max(0, Math.floor((t - start) / bucketMs))
      );
      out[idx]++;
    }
    return out;
  }, [actions, range]);

  // ── Filter + search ────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return actions.filter((a) => {
      if (filter !== "ALL" && a.status !== filter) return false;
      if (!q) return true;
      return (
        a.action_id.toLowerCase().includes(q) ||
        `${a.target_entity.entity_type}/${a.target_entity.entity_id}`
          .toLowerCase()
          .includes(q) ||
        a.action_type.toLowerCase().includes(q) ||
        (a.proposed_by ?? "").toLowerCase().includes(q)
      );
    });
  }, [actions, filter, search]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 w-full">
      <PageHeader
        title="Actions"
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span>
              {loading
                ? "Loading actions…"
                : `${counts.ALL.toLocaleString()} total`}
            </span>
            {lastRefreshed && (
              <>
                <span style={{ color: "var(--text-muted)" }}>·</span>
                <span>Refreshed {formatRelative(lastRefreshed.toISOString())}</span>
              </>
            )}
          </span>
        }
        actions={
          <>
            <TimePicker value={range} onChange={setRange} />
            <LiveBadge refreshSeconds={10} />
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-60"
              style={{
                color: "var(--text-2)",
                background: "color-mix(in srgb, var(--text) 4%, transparent)",
                border: "1px solid var(--border)",
              }}
              title="Refresh now"
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

      {/* Error banner */}
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
          <button
            onClick={() => setError(null)}
            className="ml-auto underline opacity-70 hover:opacity-100"
          >
            dismiss
          </button>
        </div>
      )}

      {/* Stat tiles */}
      <div className="mb-5">
        <StatTileGrid>
          <StatTile
            label="Total actions"
            value={stats.total.toLocaleString()}
            delta={range}
            trend="neutral"
            hint="All statuses in range"
            icon={<Activity size={13} />}
          />
          <StatTile
            label="Success rate"
            value={`${stats.successRate}%`}
            trend={Number(stats.successRate) >= 99 ? "up" : "neutral"}
            hint={`${counts.COMPLETED.toLocaleString()} completed`}
            icon={<CircleCheck size={13} />}
          />
          <StatTile
            label="Escalated"
            value={stats.escalated.toLocaleString()}
            trend={stats.escalated > 0 ? "down" : "neutral"}
            hint="Awaiting review"
            icon={<CircleAlert size={13} />}
          />
          <StatTile
            label="Executing"
            value={stats.executing.toLocaleString()}
            hint="In flight"
            icon={<Loader2 size={13} />}
          />
        </StatTileGrid>
      </div>

      {/* Timeline histogram */}
      <div
        className="mb-5 rounded-xl px-5 py-4 flex items-center justify-between gap-5"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="min-w-0">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Volume · Last {range}
          </div>
          <div
            className="text-[13px]"
            style={{ color: "var(--text-2)" }}
          >
            {histogram.reduce((s, n) => s + n, 0).toLocaleString()} actions
            bucketed into 24 intervals
          </div>
        </div>
        <div className="shrink-0">
          <MiniHistogram data={histogram} width={360} height={48} />
        </div>
      </div>

      {/* Filter chips + search */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <FilterChipRow>
          {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
            <FilterChip
              key={key}
              label={FILTER_LABELS[key]}
              count={counts[key].toLocaleString()}
              active={filter === key}
              onClick={() => setFilter(key)}
            />
          ))}
        </FilterChipRow>
        <div className="ml-auto relative">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions…"
            className="pl-8 pr-3 py-1.5 text-[12px] rounded-full focus:outline-none w-64"
            style={{
              background: "color-mix(in srgb, var(--text) 4%, transparent)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
        </div>
      </div>

      {/* Data table */}
      <DataTableShell
        title={`Recent actions · ${filtered.length.toLocaleString()} rows`}
        actions={
          <span
            className="text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            Click a row to expand
          </span>
        }
        footer={
          loading
            ? "Loading…"
            : `Showing ${filtered.length.toLocaleString()} of ${counts.ALL.toLocaleString()} actions`
        }
      >
        {loading ? (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[180px_1fr_1fr_120px_160px_80px] items-center gap-6 px-5 py-3.5"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
              >
                <div
                  className="h-3 w-24 rounded animate-pulse"
                  style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)" }}
                />
                <div
                  className="h-3 w-32 rounded animate-pulse"
                  style={{ background: "color-mix(in srgb, var(--text) 4%, transparent)" }}
                />
                <div
                  className="h-3 w-28 rounded animate-pulse"
                  style={{ background: "color-mix(in srgb, var(--text) 4%, transparent)" }}
                />
                <div
                  className="h-4 w-20 rounded animate-pulse"
                  style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)" }}
                />
                <div
                  className="h-3 w-24 rounded animate-pulse"
                  style={{ background: "color-mix(in srgb, var(--text) 4%, transparent)" }}
                />
                <div
                  className="h-3 w-12 rounded animate-pulse"
                  style={{ background: "color-mix(in srgb, var(--text) 4%, transparent)" }}
                />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <DataTableEmpty
            icon={<Activity size={18} />}
            title="No actions match these filters"
            description={
              actions.length === 0
                ? "Once your agents propose actions they'll stream in here."
                : "Try clearing the search or switching to a broader status filter."
            }
          />
        ) : (
          <div>
            {/* Sticky header */}
            <div
              className="grid grid-cols-[180px_1fr_1fr_120px_160px_80px] gap-6 px-5 py-3 sticky top-0 z-10"
              style={{
                background: "color-mix(in srgb, var(--bg) 92%, transparent)",
                borderBottom: "1px solid var(--border)",
                backdropFilter: "blur(8px)",
              }}
            >
              {["Action ID", "Entity", "Action", "Status", "Proposed by", "Time"].map(
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

            <div>
              {filtered.map((row) => {
                const expanded = expandedId === row.action_id;
                return (
                  <div
                    key={row.action_id}
                    style={{
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expanded ? null : row.action_id)
                      }
                      className="w-full grid grid-cols-[180px_1fr_1fr_120px_160px_80px] items-center gap-6 px-5 py-3 text-left transition-colors group"
                      style={{
                        background: expanded
                          ? "color-mix(in srgb, var(--text) 3%, transparent)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!expanded)
                          (e.currentTarget as HTMLElement).style.background =
                            "color-mix(in srgb, var(--text) 2%, transparent)";
                      }}
                      onMouseLeave={(e) => {
                        if (!expanded)
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                      }}
                    >
                      <CopyableId id={row.action_id} />
                      <span className="inline-flex items-center gap-2 min-w-0">
                        <span
                          className="shrink-0 rounded-sm"
                          style={{
                            width: 8,
                            height: 8,
                            background: entityColor(row.target_entity.entity_type),
                          }}
                        />
                        <span
                          className="font-mono text-[11px] truncate"
                          style={{ color: "var(--text-2)" }}
                          title={`${row.target_entity.entity_type}/${row.target_entity.entity_id}`}
                        >
                          {row.target_entity.entity_type}/{row.target_entity.entity_id}
                        </span>
                      </span>
                      <span
                        className="font-mono text-[11px] truncate"
                        style={{ color: "var(--text-2)" }}
                        title={row.action_type}
                      >
                        {row.action_type}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <StatusPill status={row.status} />
                        {isShadow(row) && row.status !== "SHADOW" && (
                          <StatusPill status="SHADOW" size="xs" dot={false} />
                        )}
                      </span>
                      <span
                        className="font-mono text-[11px] truncate"
                        style={{ color: "var(--text-muted)" }}
                        title={row.proposed_by}
                      >
                        {row.proposed_by}
                      </span>
                      <span
                        className="text-[11px] whitespace-nowrap tabular-nums"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatRelative(row.created_at)}
                      </span>
                    </button>
                    {expanded && (
                      <div
                        className="px-5 pt-3 pb-4"
                        style={{
                          background: "color-mix(in srgb, var(--text) 2%, transparent)",
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        <div
                          className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Parameters
                        </div>
                        <pre
                          className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all rounded-lg p-3"
                          style={{
                            color: "var(--text-2)",
                            background: "color-mix(in srgb, var(--text) 3%, transparent)",
                            border: "1px solid var(--border)",
                            maxHeight: 280,
                            overflow: "auto",
                          }}
                        >
                          {JSON.stringify(row.parameters, null, 2)}
                        </pre>
                        {row.status === "COMPLETED" && (
                          <a
                            href={`/receipts?action_id=${row.action_id}`}
                            className="inline-flex items-center gap-1 mt-3 text-[11px] font-medium"
                            style={{ color: "#FB923C" }}
                          >
                            View receipt
                            <ArrowUpRight size={11} />
                          </a>
                        )}
                        {row.status === "DENIED" && (
                          <div
                            className="mt-3 inline-flex items-center gap-1.5 text-[11px]"
                            style={{ color: "#F87171" }}
                          >
                            <CircleX size={12} />
                            Denied by policy
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DataTableShell>
    </div>
  );
}
