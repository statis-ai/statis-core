"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  fetchAllActions,
  fetchAllEvents,
  fetchEscalations,
  fetchKillSwitchStatus,
  fetchPolicyRules,
  fetchAnalyticsSummary,
  activateKillSwitch,
  deactivateKillSwitch,
} from "@/lib/api";
import type {
  ActionContract,
  EventRecord,
  EscalatedAction,
  KillSwitchStatus,
  PolicyRule,
  AnalyticsSummary,
} from "@/lib/api";

type StatusTone = "ok" | "warn" | "muted";

const STATUS_TONE: Record<string, StatusTone> = {
  COMPLETED: "ok",
  APPROVED: "ok",
  EXECUTING: "ok",
  ESCALATED: "warn",
  PROPOSED: "muted",
  DENIED: "muted",
};

const STATUS_CLASS: Record<StatusTone, string> = {
  ok: "bg-[rgba(29,58,46,0.08)] text-seal border-seal",
  warn: "bg-[rgba(201,138,43,0.1)] text-amber border-amber",
  muted: "bg-bg text-ink-muted border-rule",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function SectionHeader({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between bg-bg border border-rule border-b-0 rounded-t-[3px] px-3.5 py-2">
      <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted font-medium">
        {label}
      </span>
      {right}
    </div>
  );
}

function KpiTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-paper border border-rule rounded-[3px] p-4">
      <p className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted mb-2">
        {label}
      </p>
      <p className="font-sans text-[26px] tracking-[-0.025em] text-ink leading-none">{value}</p>
      {hint ? (
        <p className="text-[11px] leading-[1.4] text-ink-muted mt-2 tracking-[-0.005em]">{hint}</p>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const [actions, setActions] = useState<ActionContract[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [escalations, setEscalations] = useState<EscalatedAction[]>([]);
  const [killSwitch, setKillSwitch] = useState<KillSwitchStatus | null>(null);
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [ksBusy, setKsBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [actionsRes, eventsRes, escalationsRes, ksRes, rulesRes, analyticsRes] =
        await Promise.all([
          fetchAllActions({ limit: 200 }),
          fetchAllEvents({ limit: 10 }),
          fetchEscalations(),
          fetchKillSwitchStatus(),
          fetchPolicyRules(),
          fetchAnalyticsSummary(7),
        ]);
      setActions(actionsRes);
      setEvents(eventsRes);
      setEscalations(escalationsRes);
      setKillSwitch(ksRes);
      setPolicyRules(rulesRes);
      setAnalytics(analyticsRes);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 15000);
    return () => clearInterval(id);
  }, [loadData]);

  useEffect(() => {
    if (!lastUpdated) return;
    const id = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  async function handleKillSwitchToggle() {
    if (!killSwitch) return;
    if (killSwitch.active) {
      setKsBusy(true);
      try {
        setKillSwitch(await deactivateKillSwitch());
      } catch {
        /* ignore */
      } finally {
        setKsBusy(false);
      }
      return;
    }
    if (!window.confirm("Activate kill switch? This will deny ALL actions until deactivated.")) return;
    setKsBusy(true);
    try {
      setKillSwitch(await activateKillSwitch());
    } catch {
      /* ignore */
    } finally {
      setKsBusy(false);
    }
  }

  const pendingEscalations = escalations.length;
  const activePolicies = policyRules.filter((r) => r.active).length;
  const approvalRate = analytics ? `${(analytics.approval_rate * 100).toFixed(1)}%` : "--";
  const actionsTotal = analytics ? String(analytics.actions_total) : "--";

  if (loading) {
    return (
      <div className="p-8 max-w-[1100px]">
        <p className="text-[12px] text-ink-muted tracking-[-0.005em]">Loading…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 max-w-[1100px]">
        <div className="bg-[rgba(184,68,46,0.06)] border border-accent rounded-[3px] px-3 py-2 text-[12px] leading-[1.5] text-accent tracking-[-0.005em]">
          {error}
        </div>
      </div>
    );
  }

  const recentActions = actions.slice(0, 8);
  const recentEvents = events.slice(0, 5);
  const ksActive = killSwitch?.active ?? false;

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-sans font-medium text-[22px] tracking-[-0.025em] text-ink leading-none">
            Home
          </h1>
          <p className="text-[11.5px] text-ink-muted mt-1.5 tracking-[-0.005em] font-mono">
            {lastUpdated ? `Synced ${secondsAgo}s ago · auto-refresh 15s` : "Warming up…"}
          </p>
        </div>
        <Link
          href="/receipts"
          className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent"
        >
          View receipt chain →
        </Link>
      </div>

      {killSwitch ? (
        <div
          className={
            "rounded-[3px] border px-4 py-3 mb-5 flex items-center justify-between " +
            (ksActive
              ? "bg-[rgba(184,68,46,0.06)] border-accent"
              : "bg-paper border-rule")
          }
        >
          <div className="flex items-center gap-3">
            <span
              className={
                "w-2 h-2 rounded-full " +
                (ksActive ? "bg-accent animate-[pulse-dot_2s_ease-out_infinite]" : "bg-seal")
              }
            />
            <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium">
              <span className={ksActive ? "text-accent" : "text-seal"}>
                {ksActive ? "Kill switch active" : "Systems nominal"}
              </span>
              <span className="text-ink-muted"> · </span>
              <span className="text-ink-soft">
                {ksActive
                  ? "all actions being denied"
                  : `${pendingEscalations} awaiting approval`}
              </span>
            </span>
          </div>
          <button
            onClick={handleKillSwitchToggle}
            disabled={ksBusy}
            className={
              "font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium px-3 py-1.5 rounded-[3px] border transition-colors disabled:opacity-40 " +
              (ksActive
                ? "bg-paper text-ink border-ink hover:bg-bg"
                : "bg-transparent text-accent border-accent hover:bg-[rgba(184,68,46,0.06)]")
            }
          >
            {ksBusy ? "…" : ksActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-3 mb-6">
        <KpiTile label="Actions · 7d" value={actionsTotal} hint="proposals through the ledger" />
        <KpiTile
          label="Approval rate"
          value={approvalRate}
          hint={analytics ? `${analytics.actions_approved} approved` : undefined}
        />
        <KpiTile
          label="Pending approvals"
          value={String(pendingEscalations)}
          hint={pendingEscalations > 0 ? "review in Approvals" : "queue empty"}
        />
        <KpiTile
          label="Active policies"
          value={String(activePolicies)}
          hint={`${policyRules.length} total rules`}
        />
      </div>

      {analytics ? (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div>
            <SectionHeader label="◇ 7-day trend" />
            <div className="bg-paper border border-rule rounded-b-[3px] p-4">
              {analytics.daily_trend.length > 0 ? (() => {
                const W = 260, H = 60;
                const days = analytics.daily_trend;
                const totals = days.map((d) => d.approved + d.denied + d.escalated);
                const approveds = days.map((d) => d.approved);
                const maxTotal = Math.max(...totals, 1);
                const pts = (vals: number[]) =>
                  vals
                    .map((v, i) => {
                      const x = (i / Math.max(vals.length - 1, 1)) * W;
                      const y = H - (v / maxTotal) * H;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(" ");
                return (
                  <svg width={W} height={H} className="overflow-visible" aria-label="7-day action trend">
                    <polyline points={pts(totals)} fill="none" stroke="var(--rule)" strokeWidth="1.25" />
                    <polyline points={pts(approveds)} fill="none" stroke="var(--seal)" strokeWidth="1.5" />
                  </svg>
                );
              })() : (
                <p className="text-[12px] text-ink-muted tracking-[-0.005em]">No data yet.</p>
              )}
              <div className="flex gap-4 mt-3">
                <span className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted">
                  <span className="w-3 h-px bg-rule inline-block" /> Total
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted">
                  <span className="w-3 h-px bg-seal inline-block" /> Approved
                </span>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader label="◆ Top rules · 7d" />
            <div className="bg-paper border border-rule rounded-b-[3px] p-4 min-h-[108px]">
              {analytics.top_rules.length === 0 ? (
                <p className="text-[12px] text-ink-muted tracking-[-0.005em]">No rule activity.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {analytics.top_rules.slice(0, 4).map((r) => (
                    <div key={r.rule_id} className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11.5px] text-ink-soft truncate" title={r.rule_id}>
                        {r.rule_id.length > 22 ? `${r.rule_id.slice(0, 22)}…` : r.rule_id}
                      </span>
                      <span className="font-mono text-[11px] text-ink-muted shrink-0">{r.fires}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionHeader label="◈ Top agents · 7d" />
            <div className="bg-paper border border-rule rounded-b-[3px] p-4 min-h-[108px]">
              {analytics.top_agents.length === 0 ? (
                <p className="text-[12px] text-ink-muted tracking-[-0.005em]">No agent activity.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {analytics.top_agents.slice(0, 4).map((a) => (
                    <div key={a.agent_id} className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11.5px] text-ink-soft truncate" title={a.agent_id}>
                        {a.agent_id.length > 22 ? `${a.agent_id.slice(0, 22)}…` : a.agent_id}
                      </span>
                      <span className="font-mono text-[11px] text-ink-muted shrink-0">{a.actions}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <SectionHeader
            label="▤ Recent actions"
            right={
              <Link
                href="/actions"
                className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent"
              >
                View all →
              </Link>
            }
          />
          <div className="bg-paper border border-rule rounded-b-[3px]">
            {recentActions.length === 0 ? (
              <p className="p-4 text-[12px] text-ink-muted tracking-[-0.005em]">No actions yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted">
                    <th className="text-left px-4 pt-3 pb-2 font-medium">Action</th>
                    <th className="text-left px-2 pt-3 pb-2 font-medium">Entity</th>
                    <th className="text-left px-2 pt-3 pb-2 font-medium">Type</th>
                    <th className="text-left px-2 pt-3 pb-2 font-medium">Status</th>
                    <th className="text-left px-4 pt-3 pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActions.map((a) => {
                    const entity = a.target_entity
                      ? `${a.target_entity.entity_type || ""}/${a.target_entity.entity_id || ""}`
                      : "--";
                    const tone = STATUS_TONE[a.status] ?? "muted";
                    const cls = STATUS_CLASS[tone];
                    return (
                      <tr key={a.action_id} className="border-t border-rule">
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/receipts/${a.action_id}`}
                            className="font-mono text-[11.5px] text-ink hover:text-accent"
                          >
                            {a.action_id.slice(0, 12)}
                          </Link>
                        </td>
                        <td className="px-2 py-2.5 text-[12px] text-ink-soft tracking-[-0.005em]">
                          {entity}
                        </td>
                        <td className="px-2 py-2.5 font-mono text-[11.5px] text-ink-soft">
                          {a.action_type}
                        </td>
                        <td className="px-2 py-2.5">
                          <span
                            className={
                              "inline-flex items-center px-1.5 py-0.5 rounded-[2px] border font-mono text-[9.5px] tracking-[0.14em] uppercase " +
                              cls
                            }
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-ink-muted">
                          {timeAgo(a.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <SectionHeader label="◎ Recent events" />
          <div className="bg-paper border border-rule rounded-b-[3px] p-4">
            {recentEvents.length === 0 ? (
              <p className="text-[12px] text-ink-muted tracking-[-0.005em]">No events yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentEvents.map((ev) => (
                  <div key={ev.event_id} className="flex flex-col gap-0.5">
                    <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-muted">
                      {timeAgo(ev.occurred_at)}
                    </span>
                    <span className="text-[12.5px] text-ink tracking-[-0.005em]">
                      {ev.event_type}
                    </span>
                    <span className="font-mono text-[11px] text-ink-soft">
                      {ev.entity_type}/{ev.entity_id}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
