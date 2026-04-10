"use client";

import { useState, useEffect, useMemo } from "react";
import { Activity, RefreshCw, CircleAlert } from "lucide-react";
import { fetchAllEvents, type EventRecord } from "@/lib/api";
import { PageHeader } from "@/components/observe/PageHeader";
import { LiveBadge } from "@/components/observe/LiveBadge";
import { StatTile, StatTileGrid } from "@/components/observe/StatTile";
import { FilterChip, FilterChipRow } from "@/components/observe/FilterChip";
import {
  DataTableShell,
  DataTableEmpty,
} from "@/components/observe/DataTableShell";

// Color palette per event type category
const TYPE_PALETTE: Record<string, { color: string; bg: string; border: string }> = {
  "receipt.minted":   { color: "#34D399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.28)" },
  "action.completed": { color: "#34D399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.28)" },
  "adapter.ok":       { color: "#60A5FA", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.28)" },
  "state.updated":    { color: "#60A5FA", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.28)" },
  "policy.approved":  { color: "#A1A1AA", bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.22)" },
  "action.received":  { color: "#A1A1AA", bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.22)" },
  "action.escalated": { color: "#FACC15", bg: "rgba(250,204,21,0.10)", border: "rgba(250,204,21,0.28)" },
  "policy.denied":    { color: "#F87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.28)" },
  "action.denied":    { color: "#F87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.28)" },
};

const NEUTRAL_PALETTE = {
  color: "#A1A1AA",
  bg: "rgba(161,161,170,0.08)",
  border: "rgba(161,161,170,0.22)",
};

function formatTimeHMS(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function payloadPreview(payload: Record<string, unknown>): string {
  const str = JSON.stringify(payload);
  if (str.length <= 100) return str;
  return str.slice(0, 97) + "…";
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await fetchAllEvents({ limit: 200 });
      setEvents(data);
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
    load();
    const interval = setInterval(() => load(), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventTypes = useMemo(() => {
    const types = Array.from(new Set(events.map((e) => e.event_type)));
    return ["All", ...types];
  }, [events]);

  const filtered = useMemo(
    () =>
      typeFilter === "All"
        ? events
        : events.filter((e) => e.event_type === typeFilter),
    [events, typeFilter]
  );

  const stats = useMemo(() => {
    const total = events.length;
    const receipts = events.filter((e) => e.event_type === "receipt.minted").length;
    const denials = events.filter(
      (e) => e.event_type === "policy.denied" || e.event_type === "action.denied"
    ).length;
    const uniqueTypes = new Set(events.map((e) => e.event_type)).size;
    return { total, receipts, denials, uniqueTypes };
  }, [events]);

  return (
    <div className="p-6 lg:p-8 w-full">
      <PageHeader
        title="Events"
        subtitle={
          lastRefreshed
            ? `Raw event log · refreshed ${Math.max(
                1,
                Math.floor((Date.now() - lastRefreshed.getTime()) / 1000)
              )}s ago`
            : "Raw event log"
        }
        actions={
          <>
            <LiveBadge refreshSeconds={5} />
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
            label="Total events"
            value={stats.total.toLocaleString()}
            hint="In the most recent 200"
            icon={<Activity size={13} />}
          />
          <StatTile
            label="Receipts minted"
            value={stats.receipts.toLocaleString()}
            trend={stats.receipts > 0 ? "up" : "neutral"}
            hint="Completed actions"
          />
          <StatTile
            label="Denials"
            value={stats.denials.toLocaleString()}
            trend={stats.denials > 0 ? "down" : "neutral"}
            hint="Policy + action denials"
          />
          <StatTile
            label="Unique types"
            value={stats.uniqueTypes.toLocaleString()}
            hint="Distinct event_type values"
          />
        </StatTileGrid>
      </div>

      {/* Type filter chips */}
      {!loading && events.length > 0 && (
        <div className="mb-4">
          <FilterChipRow>
            {eventTypes.map((t) => (
              <FilterChip
                key={t}
                label={t}
                count={
                  t === "All"
                    ? events.length
                    : events.filter((e) => e.event_type === t).length
                }
                active={typeFilter === t}
                onClick={() => setTypeFilter(t)}
              />
            ))}
          </FilterChipRow>
        </div>
      )}

      <DataTableShell
        title={`Event stream · ${filtered.length.toLocaleString()} rows`}
        actions={
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Click a row to inspect the payload
          </span>
        }
        footer={
          loading
            ? "Loading…"
            : `Showing ${filtered.length.toLocaleString()} of ${events.length.toLocaleString()} events`
        }
      >
        {loading ? (
          <div>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-3"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                <div
                  className="h-3 w-16 rounded animate-pulse"
                  style={{
                    background: "color-mix(in srgb, var(--text) 5%, transparent)",
                  }}
                />
                <div
                  className="h-4 w-28 rounded animate-pulse"
                  style={{
                    background: "color-mix(in srgb, var(--text) 6%, transparent)",
                  }}
                />
                <div
                  className="h-3 w-32 rounded animate-pulse"
                  style={{
                    background: "color-mix(in srgb, var(--text) 4%, transparent)",
                  }}
                />
                <div
                  className="h-3 w-48 rounded animate-pulse flex-1"
                  style={{
                    background: "color-mix(in srgb, var(--text) 4%, transparent)",
                  }}
                />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <DataTableEmpty
            icon={<Activity size={18} />}
            title="No events match this filter"
            description={
              events.length === 0
                ? "As your agents and the policy engine produce events, they'll stream in here live."
                : "Try switching to a different event type or 'All'."
            }
          />
        ) : (
          <div>
            {filtered.map((ev, i) => {
              const expanded = expandedIdx === i;
              const palette = TYPE_PALETTE[ev.event_type] ?? NEUTRAL_PALETTE;
              return (
                <div
                  key={ev.event_id ?? i}
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedIdx(expanded ? null : i)}
                    className="w-full flex items-start gap-4 px-5 py-3 text-left transition-colors"
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
                    <span
                      className="font-mono text-[11px] shrink-0 w-20 tabular-nums mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatTimeHMS(ev.occurred_at)}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                      style={{
                        color: palette.color,
                        background: palette.bg,
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: palette.color }}
                      />
                      {ev.event_type}
                    </span>
                    <span
                      className="font-mono text-[11px] shrink-0 mt-0.5"
                      style={{ color: "var(--text-2)" }}
                    >
                      {ev.entity_type}/{ev.entity_id}
                    </span>
                    <span
                      className="font-mono text-[11px] shrink-0 mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {ev.producer}
                    </span>
                    <span
                      className="text-[11px] font-mono truncate mt-0.5 min-w-0"
                      style={{ color: "var(--text-2)" }}
                    >
                      {payloadPreview(ev.payload)}
                    </span>
                  </button>
                  {expanded && (
                    <div
                      className="px-5 pt-3 pb-4"
                      style={{
                        background:
                          "color-mix(in srgb, var(--text) 2%, transparent)",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <p
                        className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Full payload
                      </p>
                      <pre
                        className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all rounded-lg p-3"
                        style={{
                          color: "var(--text-2)",
                          background:
                            "color-mix(in srgb, var(--text) 3%, transparent)",
                          border: "1px solid var(--border)",
                          maxHeight: 280,
                          overflow: "auto",
                        }}
                      >
                        {JSON.stringify(ev.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DataTableShell>
    </div>
  );
}
