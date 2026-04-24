"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  fetchAllActions,
  type ActionContract,
} from "@/lib/api";

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

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SectionHeader({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-bg border border-rule border-b-0 rounded-t-[3px]">
      <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted font-medium">
        {label}
      </span>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

function KpiTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="bg-paper border border-rule rounded-[3px] px-3.5 py-3">
      <div className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted font-medium mb-1.5">
        {label}
      </div>
      <div className="font-sans text-[26px] leading-none tracking-[-0.02em] text-ink tabular-nums">
        {value}
      </div>
      {hint ? (
        <div className="text-[11px] text-ink-muted tracking-[-0.005em] mt-1.5">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export default function ReceiptsPage() {
  const [actions, setActions] = useState<ActionContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  async function load(showSpinner = false) {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await fetchAllActions({ status: "COMPLETED", limit: 200 });
      setActions(data);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = actions.length;
    const entities = new Set(
      actions.map(
        (a) => `${a.target_entity.entity_type}/${a.target_entity.entity_id}`,
      ),
    ).size;
    const agents = new Set(actions.map((a) => a.proposed_by)).size;
    const last = actions.length > 0 ? actions[0].created_at : null;
    return { total, entities, agents, last };
  }, [actions]);

  return (
    <div className="p-6 lg:p-8 w-full">
      {/* Header */}
      <header className="flex items-start justify-between gap-6 mb-6">
        <div className="min-w-0">
          <h1 className="font-sans text-[24px] tracking-[-0.025em] leading-none text-ink font-medium">
            Receipts
          </h1>
          <p className="text-[12.5px] text-ink-soft tracking-[-0.005em] mt-1.5">
            {loading ? (
              "Loading receipts…"
            ) : (
              <>
                <span className="tabular-nums">{stats.total.toLocaleString()}</span> completed
                actions
                {lastRefreshed ? (
                  <>
                    {" · "}
                    <span className="font-mono text-[11px] text-ink-muted tracking-[0.02em]">
                      synced {formatRelative(lastRefreshed.toISOString())} · auto-refresh 15s
                    </span>
                  </>
                ) : null}
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium px-3 py-2 bg-paper border border-rule rounded-[3px] text-ink-soft hover:border-ink-muted transition-colors disabled:opacity-60"
          title="Refresh now"
        >
          {refreshing ? "◎ Refreshing…" : "◎ Refresh"}
        </button>
      </header>

      {/* Error card */}
      {error ? (
        <div className="mb-5 bg-[rgba(184,68,46,0.06)] border border-accent/30 border-l-2 border-l-accent rounded-[3px] px-3.5 py-2.5 flex items-start gap-3">
          <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-accent font-medium shrink-0 pt-[1px]">
            ⚠ ERROR
          </span>
          <p className="flex-1 text-[12.5px] leading-[1.5] text-ink tracking-[-0.005em] font-mono break-all">
            {error}
          </p>
          <button
            onClick={() => setError(null)}
            className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-ink-muted hover:text-accent shrink-0"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* KPI tiles */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile
          label="◈ Total receipts"
          value={stats.total.toLocaleString()}
          hint="Completed actions, all time"
        />
        <KpiTile
          label="◎ Distinct entities"
          value={stats.entities.toLocaleString()}
          hint="Covered by this ledger"
        />
        <KpiTile
          label="◆ Agents writing"
          value={stats.agents.toLocaleString()}
          hint="Unique proposers"
        />
        <KpiTile
          label="◇ Last receipt"
          value={stats.last ? formatRelative(stats.last) : "—"}
          hint={stats.last ? formatAbsolute(stats.last) : "No receipts yet"}
        />
      </div>

      {/* Ledger */}
      <div>
        <SectionHeader
          label={`◈ Receipt ledger · ${stats.total.toLocaleString()} rows`}
          right={
            <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-ink-muted">
              click any row to inspect
            </span>
          }
        />
        <div className="bg-paper border border-rule rounded-b-[3px] overflow-hidden">
          {loading ? (
            <div>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={
                    "grid grid-cols-[180px_1fr_1fr_160px_120px] items-center gap-6 px-5 py-3.5 " +
                    (i === 0 ? "" : "border-t border-rule")
                  }
                >
                  {[120, 180, 140, 100, 80].map((w, j) => (
                    <div
                      key={j}
                      className="h-3 rounded-[2px] bg-bg animate-pulse"
                      style={{ width: w }}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : actions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-10 h-10 rounded-[4px] bg-bg border border-rule flex items-center justify-center mb-3 text-ink-muted text-[16px]">
                ◈
              </div>
              <p className="text-[14px] text-ink font-medium mb-1 tracking-[-0.01em]">
                No receipts yet
              </p>
              <p className="text-[12px] text-ink-soft max-w-sm tracking-[-0.005em] leading-[1.55]">
                When your agents complete actions, the ledger will grow here. Every receipt is
                SHA-256 hashed and verifiable.
              </p>
            </div>
          ) : (
            <div>
              {/* Sticky header row */}
              <div className="grid grid-cols-[180px_1fr_1fr_160px_120px] gap-6 px-5 py-2.5 sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-rule">
                {["Action ID", "Entity", "Action type", "Time", ""].map((h, i) => (
                  <div
                    key={i}
                    className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted font-medium"
                  >
                    {h}
                  </div>
                ))}
              </div>

              <ul>
                {actions.map((row) => (
                  <li key={row.action_id} className="border-t border-rule">
                    <Link
                      href={`/receipts/${row.action_id}`}
                      className="grid grid-cols-[180px_1fr_1fr_160px_120px] items-center gap-6 px-5 py-3 transition-colors hover:bg-bg/60"
                    >
                      <span className="font-mono text-[11px] text-ink truncate tracking-[0.01em]">
                        {row.action_id}
                      </span>
                      <span
                        className="font-mono text-[11px] text-ink-soft truncate tracking-[0.01em]"
                        title={`${row.target_entity.entity_type}/${row.target_entity.entity_id}`}
                      >
                        {row.target_entity.entity_type}/{row.target_entity.entity_id}
                      </span>
                      <span className="font-mono text-[11px] text-ink-soft truncate tracking-[0.01em]">
                        {row.action_type}
                      </span>
                      <span
                        className="text-[11px] tabular-nums text-ink-muted"
                        title={formatAbsolute(row.created_at)}
                      >
                        {formatRelative(row.created_at)}
                      </span>
                      <span className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-ink-muted text-right">
                        Inspect →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-rule bg-bg">
            <span className="font-mono text-[10.5px] tracking-[0.02em] text-ink-muted">
              {loading
                ? "Loading…"
                : `Showing ${stats.total.toLocaleString()} receipts from COMPLETED actions`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
