"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Inbox,
  Clock,
  User,
} from "lucide-react";
import {
  fetchEscalations,
  approveEscalation,
  rejectEscalation,
  type EscalatedAction,
} from "@/lib/api";
import { PageHeader } from "@/components/observe/PageHeader";
import { LiveBadge } from "@/components/observe/LiveBadge";
import { StatTile, StatTileGrid } from "@/components/observe/StatTile";
import { StatusPill } from "@/components/observe/StatusPill";
import { DataTableShell, DataTableEmpty } from "@/components/observe/DataTableShell";

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatTimeAbsolute(iso: string): string {
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
    return (
      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        --
      </span>
    );
  }
  return (
    <div className="space-y-1.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-2 font-mono text-[11px]">
          <span className="shrink-0" style={{ color: "var(--text-muted)" }}>
            {key}:
          </span>
          <span className="break-all" style={{ color: "var(--text-2)" }}>
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
    "w-full font-mono text-[12px] px-3 py-2 rounded-lg focus:outline-none transition-colors";
  const inputStyle: React.CSSProperties = {
    background: "color-mix(in srgb, var(--text) 3%, transparent)",
    border: "1px solid var(--border)",
    color: "var(--text)",
  };

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{
        background: "var(--bg-surface)",
        border:
          result === "approved"
            ? "1px solid rgba(52,211,153,0.35)"
            : result === "denied"
              ? "1px solid var(--border)"
              : "1px solid var(--border)",
        opacity: result === "denied" ? 0.55 : 1,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="font-mono text-[13px] font-semibold"
              style={{ color: "var(--text)" }}
            >
              {entityLabel}
            </span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span
              className="font-mono text-[13px]"
              style={{ color: "var(--text-2)" }}
            >
              {esc.action_type}
            </span>
          </div>
          <div
            className="flex items-center gap-2 text-[11px] flex-wrap"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="font-mono">{esc.action_id}</span>
            <span>·</span>
            <span className="font-mono inline-flex items-center gap-1">
              <User size={10} />
              {esc.proposed_by}
            </span>
            <span>·</span>
            <span
              className="inline-flex items-center gap-1"
              title={formatTimeAbsolute(esc.created_at)}
            >
              <Clock size={10} />
              {formatTime(esc.created_at)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="font-mono text-[10px] px-2 py-1 rounded-md"
            style={{
              color: "var(--text-muted)",
              background: "color-mix(in srgb, var(--text) 4%, transparent)",
              border: "1px solid var(--border)",
            }}
          >
            {esc.target_system}
          </span>
          {result === "approved" ? (
            <StatusPill status="APPROVED">
              <CheckCircle2 size={10} />
              Approved
            </StatusPill>
          ) : result === "denied" ? (
            <StatusPill status="DENIED">
              <XCircle size={10} />
              Denied
            </StatusPill>
          ) : (
            <StatusPill status="ESCALATED">
              <AlertTriangle size={10} />
              Pending
            </StatusPill>
          )}
        </div>
      </div>

      {/* Parameters */}
      {Object.keys(esc.parameters).length > 0 && (
        <div
          className="rounded-lg p-3.5 mb-3"
          style={{
            background: "color-mix(in srgb, var(--text) 3%, transparent)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Parameters
          </p>
          <KeyValuePairs data={esc.parameters} />
        </div>
      )}

      {/* Context */}
      {Object.keys(esc.context).length > 0 && (
        <div
          className="rounded-lg p-3.5 mb-4"
          style={{
            background: "rgba(250,204,21,0.06)",
            border: "1px solid rgba(250,204,21,0.20)",
          }}
        >
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-2"
            style={{ color: "#FACC15" }}
          >
            Context
          </p>
          <KeyValuePairs data={esc.context} />
        </div>
      )}

      {/* Result message */}
      {result === "approved" && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-[12px] font-medium"
          style={{
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.25)",
            color: "#34D399",
          }}
        >
          Escalation approved successfully.
        </div>
      )}
      {result === "denied" && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-[12px]"
          style={{
            background: "color-mix(in srgb, var(--text) 3%, transparent)",
            border: "1px solid var(--border)",
            color: "var(--text-2)",
          }}
        >
          Escalation denied.
        </div>
      )}

      {/* Review panel */}
      {!result && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[12px] font-medium transition-colors mb-3"
            style={{ color: "var(--text-2)" }}
          >
            {expanded ? "Collapse review" : "Review this escalation →"}
          </button>

          {expanded && (
            <div
              className="pt-4 space-y-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <div>
                <label
                  className="text-[9px] font-semibold uppercase tracking-[0.14em] block mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Reviewer ID
                </label>
                <input
                  placeholder="e.g. reviewer-aniket"
                  value={reviewerId}
                  onChange={(e) => setReviewerId(e.target.value)}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  className="text-[9px] font-semibold uppercase tracking-[0.14em] block mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Note (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Add a review note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputCls + " resize-y"}
                  style={inputStyle}
                />
              </div>

              {error && (
                <p className="text-[11px] font-mono" style={{ color: "#F87171" }}>
                  {error}
                </p>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApprove}
                  disabled={submitting || !reviewerId.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "rgba(52,211,153,0.12)",
                    border: "1px solid rgba(52,211,153,0.35)",
                    color: "#34D399",
                  }}
                >
                  <CheckCircle2 size={12} />
                  {submitting ? "..." : "Approve"}
                </button>
                <button
                  onClick={handleDeny}
                  disabled={submitting || !reviewerId.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "color-mix(in srgb, var(--text) 4%, transparent)",
                    border: "1px solid var(--border)",
                    color: "var(--text-2)",
                  }}
                >
                  <XCircle size={12} />
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      setError(null);
      const data = await fetchEscalations();
      setEscalations(data);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load escalations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 10000);
    return () => clearInterval(interval);
  }, [load]);

  // ── Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const pending = escalations.length;
    const now = Date.now();
    let totalWaitMs = 0;
    let oldest: number | null = null;
    for (const e of escalations) {
      const t = new Date(e.created_at).getTime();
      const wait = now - t;
      totalWaitMs += wait;
      if (oldest === null || t < oldest) oldest = t;
    }
    const avgWaitMin =
      pending > 0 ? Math.round(totalWaitMs / pending / 60000) : 0;
    const oldestLabel = oldest ? formatTime(new Date(oldest).toISOString()) : "—";
    return { pending, avgWaitMin, oldestLabel };
  }, [escalations]);

  return (
    <div className="p-6 lg:p-8 w-full">
      <PageHeader
        title="Escalations"
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span>
              {loading
                ? "Loading escalations…"
                : `${stats.pending.toLocaleString()} pending${stats.pending !== 1 ? "" : ""}`}
            </span>
            {lastRefreshed && (
              <>
                <span style={{ color: "var(--text-muted)" }}>·</span>
                <span>Refreshed {formatTime(lastRefreshed.toISOString())}</span>
              </>
            )}
          </span>
        }
        actions={
          <>
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
          <AlertTriangle size={14} />
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
      <div className="mb-6">
        <StatTileGrid>
          <StatTile
            label="Pending review"
            value={stats.pending.toLocaleString()}
            trend={stats.pending > 0 ? "down" : "neutral"}
            hint="Awaiting a human decision"
            icon={<AlertTriangle size={13} />}
          />
          <StatTile
            label="Avg wait time"
            value={stats.avgWaitMin > 0 ? `${stats.avgWaitMin}m` : "—"}
            hint="Across pending queue"
            icon={<Clock size={13} />}
          />
          <StatTile
            label="Oldest pending"
            value={stats.oldestLabel}
            hint="Time since created"
            icon={<Clock size={13} />}
          />
          <StatTile
            label="Status"
            value={stats.pending === 0 ? "Clear" : "Review"}
            trend={stats.pending === 0 ? "up" : "neutral"}
            hint={stats.pending === 0 ? "No backlog" : "Action required"}
            icon={<CheckCircle2 size={13} />}
          />
        </StatTileGrid>
      </div>

      {/* Escalations list */}
      <DataTableShell
        title={`Pending queue · ${stats.pending.toLocaleString()}`}
        actions={
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Oldest first
          </span>
        }
      >
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-5 animate-pulse"
                style={{
                  background: "color-mix(in srgb, var(--text) 3%, transparent)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="h-4 w-64 rounded mb-2"
                  style={{
                    background: "color-mix(in srgb, var(--text) 6%, transparent)",
                  }}
                />
                <div
                  className="h-3 w-40 rounded mb-4"
                  style={{
                    background: "color-mix(in srgb, var(--text) 4%, transparent)",
                  }}
                />
                <div
                  className="h-16 w-full rounded"
                  style={{
                    background: "color-mix(in srgb, var(--text) 3%, transparent)",
                  }}
                />
              </div>
            ))}
          </div>
        ) : escalations.length === 0 ? (
          <DataTableEmpty
            icon={<Inbox size={18} />}
            title="No escalations pending"
            description="When the policy engine routes a decision to a human reviewer, it will appear here. Clear queues are a good sign."
          />
        ) : (
          <div className="p-4 space-y-3">
            {escalations.map((esc) => (
              <EscalationCard
                key={esc.action_id}
                esc={esc}
                onResolved={() => load(false)}
              />
            ))}
          </div>
        )}
      </DataTableShell>
    </div>
  );
}
