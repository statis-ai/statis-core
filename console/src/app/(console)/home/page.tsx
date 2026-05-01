"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  fetchAllActions,
  fetchEscalations,
  fetchKillSwitchStatus,
  fetchPolicyRules,
  fetchAnalyticsSummary,
  activateKillSwitch,
  deactivateKillSwitch,
} from "@/lib/api";
import type {
  ActionContract,
  EscalatedAction,
  KillSwitchStatus,
  PolicyRule,
  AnalyticsSummary,
} from "@/lib/api";
import { KPITile } from "@/components/observe/KPITile";
import { ActivityChart } from "@/components/observe/ActivityChart";
import { HBarList } from "@/components/observe/HBarList";
import { SystemHealth } from "@/components/observe/SystemHealth";
import { QuickActions } from "@/components/observe/QuickActions";
import { EmptyHome } from "@/components/observe/EmptyHome";

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "var(--good)",
  APPROVED:  "var(--good)",
  ESCALATED: "var(--warn)",
  DENIED:    "var(--bad)",
  EXECUTING: "var(--accent)",
  PROPOSED:  "var(--ink-muted)",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HomePage() {
  const [actions, setActions] = useState<ActionContract[]>([]);
  const [escalations, setEscalations] = useState<EscalatedAction[]>([]);
  const [killSwitch, setKillSwitch] = useState<KillSwitchStatus | null>(null);
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [killSwitchLoading, setKillSwitchLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("statis_user_email");
    if (stored) setEmail(stored);
  }, []);

  const loadData = useCallback(async (days = 7) => {
    try {
      const [actionsRes, escalationsRes, ksRes, rulesRes, analyticsRes] =
        await Promise.all([
          fetchAllActions({ limit: 100 }),
          fetchEscalations(),
          fetchKillSwitchStatus(),
          fetchPolicyRules(),
          fetchAnalyticsSummary(days),
        ]);
      setActions(actionsRes);
      setEscalations(escalationsRes);
      setKillSwitch(ksRes);
      setPolicyRules(rulesRes);
      setAnalytics(analyticsRes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(analyticsDays);
    const interval = setInterval(() => loadData(analyticsDays), 15_000);
    return () => clearInterval(interval);
  }, [loadData, analyticsDays]);

  function handleRangeChange(days: number) {
    setAnalyticsDays(days);
    loadData(days);
  }

  async function handleKillSwitchToggle() {
    if (!killSwitch) return;
    if (killSwitch.active) {
      setKillSwitchLoading(true);
      try { setKillSwitch(await deactivateKillSwitch()); } catch { /* ignore */ }
      finally { setKillSwitchLoading(false); }
    } else {
      if (!window.confirm("Activate kill switch? This will deny ALL actions until deactivated.")) return;
      setKillSwitchLoading(true);
      try { setKillSwitch(await activateKillSwitch()); } catch { /* ignore */ }
      finally { setKillSwitchLoading(false); }
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="font-mono text-brand-muted" style={{ fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="font-mono text-brand-bad" style={{ fontSize: 13 }}>Error: {error}</p>
      </div>
    );
  }

  const isNewTenant = actions.length === 0 && (!analytics || analytics.actions_total === 0);
  if (isNewTenant) return <EmptyHome />;

  // Derived data
  const activePolicies = policyRules.filter((r) => r.active).length;
  const approvalRatePct = analytics ? (analytics.approval_rate * 100).toFixed(1) + "%" : "--";
  const recentActions = actions.slice(0, 10);

  const topPoliciesItems = (analytics?.top_rules ?? []).map((r) => ({
    label: r.rule_id,
    count: r.fires,
    href: `/policies/${r.rule_id}`,
  }));

  const topAgentsItems = (analytics?.top_agents ?? []).map((a) => ({
    label: a.agent_id,
    count: a.actions,
    href: `/actions?proposed_by=${encodeURIComponent(a.agent_id)}`,
  }));

  const sparkApproval = analytics?.daily_trend.map((d) =>
    d.approved + d.denied > 0 ? (d.approved / (d.approved + d.denied)) * 100 : 0
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = email ? email.split("@")[0] : null;

  return (
    <div className="p-6 max-w-6xl flex flex-col gap-6">

      {/* Hero strip */}
      <div
        className="halftone-bg relative border border-brand-rule bg-brand-paper px-6 py-5 overflow-hidden"
        style={{ borderRadius: "var(--radius)" }}
      >
        <span className="eyebrow mb-2 block">
          Workspace · {analyticsDays === 1 ? "24h" : `${analyticsDays}d`} view
        </span>
        <h1
          className="text-brand-ink"
          style={{ fontSize: 26, fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.2 }}
        >
          {greeting}{firstName ? `, ${firstName}` : ""}.{" "}
          {analytics && analytics.actions_approved > 0 && (
            <span style={{ color: "var(--accent)" }}>
              {analytics.actions_approved.toLocaleString()} action{analytics.actions_approved !== 1 ? "s" : ""}
            </span>
          )}{" "}
          {analytics?.actions_approved ? "approved this period." : ""}
        </h1>

        {/* Kill switch banner */}
        {killSwitch?.active && (
          <div
            className="mt-4 flex items-center justify-between px-4 py-2.5 border"
            style={{
              background: "rgba(185,28,28,0.08)",
              borderColor: "var(--bad)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <span className="flex items-center gap-2 font-mono text-brand-bad" style={{ fontSize: 12 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-bad animate-pulse" />
              KILL SWITCH ACTIVE — all actions denied
            </span>
            <button
              onClick={handleKillSwitchToggle}
              disabled={killSwitchLoading}
              className="font-mono text-brand-muted hover:text-brand-ink transition-colors disabled:opacity-40"
              style={{ fontSize: 11 }}
            >
              {killSwitchLoading ? "..." : "Deactivate"}
            </button>
          </div>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KPITile
          label={`Actions ${analyticsDays}d`}
          value={analytics ? String(analytics.actions_total) : "--"}
          sparkline={analytics?.daily_trend.map((d) => d.approved + d.denied + d.escalated)}
        />
        <KPITile
          label="Approval rate"
          value={approvalRatePct}
          sparkline={sparkApproval}
        />
        <KPITile
          label="Pending escalations"
          value={String(escalations.length)}
          deltaPositive={escalations.length === 0}
        />
        <KPITile
          label="Active rules"
          value={String(activePolicies)}
        />
      </div>

      {/* Activity timeline */}
      {analytics && (
        <ActivityChart
          data={analytics.daily_trend}
          onRangeChange={handleRangeChange}
          currentDays={analyticsDays}
        />
      )}

      {/* 2-col grid */}
      <div className="grid grid-cols-3 gap-4">

        {/* LEFT — 2/3 */}
        <div className="col-span-2 flex flex-col gap-4">

          {/* Recent actions */}
          <div
            className="bg-brand-paper border border-brand-rule p-5"
            style={{ borderRadius: "var(--radius)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="eyebrow">Recent actions</span>
              <Link
                href="/actions"
                className="font-mono text-brand-muted hover:text-brand-accent transition-colors"
                style={{ fontSize: 11 }}
              >
                View all →
              </Link>
            </div>

            {recentActions.length === 0 ? (
              <p className="font-mono text-brand-muted" style={{ fontSize: 12 }}>No actions yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    {["Action ID", "Type", "Status", "Agent", "Time"].map((h) => (
                      <th
                        key={h}
                        className="text-left pb-3 font-mono uppercase text-brand-muted"
                        style={{ fontSize: 10, letterSpacing: "0.12em" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentActions.map((a) => (
                    <tr
                      key={a.action_id}
                      className="border-t border-brand-rule-soft hover:bg-brand-deep transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/actions/${a.action_id}`}
                          className="font-mono text-brand-ink hover:text-brand-accent transition-colors"
                          style={{ fontSize: 12 }}
                        >
                          {a.action_id.slice(0, 14)}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-brand-muted" style={{ fontSize: 12 }}>
                        {a.action_type}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.08em",
                            color: STATUS_COLOR[a.status] ?? "var(--ink-muted)",
                          }}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-brand-muted truncate max-w-[120px]" style={{ fontSize: 11 }}>
                        {a.proposed_by}
                      </td>
                      <td className="py-2.5 font-mono text-brand-subtle" style={{ fontSize: 11 }}>
                        {timeAgo(a.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Top policies */}
          {topPoliciesItems.length > 0 && (
            <div
              className="bg-brand-paper border border-brand-rule p-5"
              style={{ borderRadius: "var(--radius)" }}
            >
              <span className="eyebrow block mb-4">Top policies (fires {analyticsDays}d)</span>
              <HBarList items={topPoliciesItems} />
            </div>
          )}

          {/* Top agents */}
          {topAgentsItems.length > 0 && (
            <div
              className="bg-brand-paper border border-brand-rule p-5"
              style={{ borderRadius: "var(--radius)" }}
            >
              <span className="eyebrow block mb-4">Top agents ({analyticsDays}d)</span>
              <HBarList items={topAgentsItems} />
            </div>
          )}
        </div>

        {/* RIGHT — 1/3 */}
        <div className="flex flex-col gap-4">
          <SystemHealth killSwitch={killSwitch} />

          {/* Kill switch control (when inactive) */}
          {killSwitch && !killSwitch.active && (
            <div
              className="bg-brand-paper border border-brand-rule p-4"
              style={{ borderRadius: "var(--radius)" }}
            >
              <p className="eyebrow mb-3">Kill switch</p>
              <p className="text-brand-muted mb-3" style={{ fontSize: 12 }}>
                Emergency halt — denies all actions immediately.
              </p>
              <button
                onClick={handleKillSwitchToggle}
                disabled={killSwitchLoading}
                className="w-full font-mono text-brand-bad border border-brand-bad hover:bg-brand-bad hover:text-brand-paper transition-colors disabled:opacity-40 py-2"
                style={{ fontSize: 12, borderRadius: "var(--radius-sm)" }}
              >
                {killSwitchLoading ? "..." : "Activate kill switch"}
              </button>
            </div>
          )}

          <QuickActions />
        </div>
      </div>
    </div>
  );
}
