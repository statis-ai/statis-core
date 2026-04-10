"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShieldOff,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  User,
  Power,
} from "lucide-react";
import {
  fetchKillSwitchStatus,
  activateKillSwitch,
  deactivateKillSwitch,
} from "@/lib/api";
import type { KillSwitchStatus } from "@/lib/api";
import { PageHeader } from "@/components/observe/PageHeader";
import { LiveBadge } from "@/components/observe/LiveBadge";
import { StatTile, StatTileGrid } from "@/components/observe/StatTile";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function KillSwitchPage() {
  const [status, setStatus] = useState<KillSwitchStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acting, setActing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const s = await fetchKillSwitchStatus();
      setStatus(s);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(() => loadStatus(), 10_000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  async function handleActivate() {
    setConfirmOpen(false);
    setActing(true);
    setError(null);
    try {
      const s = await activateKillSwitch();
      setStatus(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to activate");
    } finally {
      setActing(false);
    }
  }

  async function handleDeactivate() {
    setActing(true);
    setError(null);
    try {
      const s = await deactivateKillSwitch();
      setStatus(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to deactivate");
    } finally {
      setActing(false);
    }
  }

  const isActive = status?.active ?? false;

  return (
    <div className="p-6 lg:p-8 w-full">
      <PageHeader
        title="Kill Switch"
        subtitle="Emergency halt control. When active, every action evaluation is denied regardless of policy."
        actions={
          <>
            <LiveBadge refreshSeconds={10} />
            <button
              type="button"
              onClick={() => loadStatus(true)}
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
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* Stat tiles */}
      <div className="mb-6">
        <StatTileGrid>
          <StatTile
            label="Current state"
            value={loading ? "…" : isActive ? "HALTED" : "NORMAL"}
            trend={isActive ? "down" : "up"}
            hint={
              isActive
                ? "All actions denied"
                : "Policy engine running"
            }
            icon={
              isActive ? (
                <ShieldOff size={13} />
              ) : (
                <ShieldCheck size={13} />
              )
            }
          />
          <StatTile
            label="Activated"
            value={
              loading
                ? "…"
                : isActive && status?.activated_at
                  ? formatRelative(status.activated_at)
                  : "—"
            }
            hint="Time since halt"
            icon={<Clock size={13} />}
          />
          <StatTile
            label="Activated by"
            value={
              loading
                ? "…"
                : isActive && status?.activated_by
                  ? status.activated_by
                  : "—"
            }
            hint="Operator on record"
            icon={<User size={13} />}
          />
          <StatTile
            label="Refresh"
            value={status ? "Live" : "—"}
            hint="Polled every 10s"
            icon={<Power size={13} />}
          />
        </StatTileGrid>
      </div>

      {/* Status card */}
      <div
        className="rounded-xl p-6 mb-5"
        style={{
          background: "var(--bg-surface)",
          border: isActive
            ? "1px solid rgba(248,113,113,0.35)"
            : "1px solid var(--border)",
          boxShadow: isActive
            ? "inset 0 0 60px -20px rgba(248,113,113,0.15)"
            : undefined,
        }}
      >
        {loading ? (
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl animate-pulse"
              style={{
                background: "color-mix(in srgb, var(--text) 6%, transparent)",
              }}
            />
            <div className="space-y-2">
              <div
                className="h-4 w-28 rounded animate-pulse"
                style={{
                  background: "color-mix(in srgb, var(--text) 6%, transparent)",
                }}
              />
              <div
                className="h-3 w-40 rounded animate-pulse"
                style={{
                  background: "color-mix(in srgb, var(--text) 4%, transparent)",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: isActive
                  ? "rgba(248,113,113,0.12)"
                  : "color-mix(in srgb, var(--text) 4%, transparent)",
                border: isActive
                  ? "1px solid rgba(248,113,113,0.35)"
                  : "1px solid var(--border)",
                color: isActive ? "#F87171" : "var(--text-muted)",
              }}
            >
              {isActive ? <ShieldOff size={22} /> : <ShieldCheck size={22} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <span
                  className="text-[18px] font-bold tracking-tight"
                  style={{ color: isActive ? "#F87171" : "var(--text)" }}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full"
                  style={{
                    color: isActive ? "#F87171" : "#34D399",
                    background: isActive
                      ? "rgba(248,113,113,0.10)"
                      : "rgba(52,211,153,0.10)",
                    border: isActive
                      ? "1px solid rgba(248,113,113,0.28)"
                      : "1px solid rgba(52,211,153,0.28)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: isActive ? "#F87171" : "#34D399" }}
                  />
                  {isActive ? "ALL ACTIONS DENIED" : "NORMAL OPERATION"}
                </span>
              </div>

              {isActive && status?.activated_at && (
                <p className="text-[12px]" style={{ color: "var(--text-2)" }}>
                  Activated {formatDateTime(status.activated_at)}
                  {status.activated_by && (
                    <span
                      className="ml-2 font-mono"
                      style={{ color: "var(--text-muted)" }}
                    >
                      by {status.activated_by}
                    </span>
                  )}
                </p>
              )}

              {!isActive && (
                <p className="text-[12px]" style={{ color: "var(--text-2)" }}>
                  Policy engine running normally. All actions are evaluated against
                  policy rules.
                </p>
              )}
            </div>

            {!loading && (
              <div className="shrink-0">
                {isActive ? (
                  <button
                    onClick={handleDeactivate}
                    disabled={acting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold transition-colors disabled:opacity-60"
                    style={{
                      color: "var(--text-2)",
                      background: "color-mix(in srgb, var(--text) 5%, transparent)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <ShieldCheck size={13} />
                    {acting ? "Deactivating…" : "Deactivate kill switch"}
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={acting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold transition-colors disabled:opacity-60"
                    style={{
                      color: "#F87171",
                      background: "rgba(248,113,113,0.10)",
                      border: "1px solid rgba(248,113,113,0.35)",
                    }}
                  >
                    <ShieldOff size={13} />
                    {acting ? "Activating…" : "Activate kill switch"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guidance card */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "color-mix(in srgb, var(--text) 2%, transparent)",
          border: "1px solid var(--border)",
        }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          When to use this
        </p>
        <ul
          className="space-y-1.5 text-[12px] leading-relaxed"
          style={{ color: "var(--text-2)" }}
        >
          <li>
            <strong style={{ color: "var(--text)" }}>Incident response.</strong> A
            misbehaving agent is firing unexpected actions.
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>Deployment freeze.</strong>{" "}
            Pause all execution while rolling out a new policy pack.
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>
              Vendor or dependency outage.
            </strong>{" "}
            Halt until the downstream system is healthy again.
          </li>
        </ul>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div
            className="rounded-xl p-6 max-w-md w-full"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(248,113,113,0.10)",
                  border: "1px solid rgba(248,113,113,0.30)",
                  color: "#F87171",
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <h2
                className="text-[14px] font-semibold"
                style={{ color: "var(--text)" }}
              >
                Activate kill switch?
              </h2>
            </div>
            <p
              className="text-[12px] mb-6 leading-relaxed"
              style={{ color: "var(--text-2)" }}
            >
              This will immediately deny{" "}
              <strong style={{ color: "var(--text)" }}>all</strong> action evaluations
              for this tenant until you deactivate it. Agent workflows will be blocked.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-full text-[12px] font-semibold transition-colors"
                style={{
                  color: "var(--text-2)",
                  background: "color-mix(in srgb, var(--text) 4%, transparent)",
                  border: "1px solid var(--border)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold transition-colors"
                style={{
                  color: "#F87171",
                  background: "rgba(248,113,113,0.12)",
                  border: "1px solid rgba(248,113,113,0.40)",
                }}
              >
                <ShieldOff size={12} />
                Yes, activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
