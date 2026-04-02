"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  fetchAllActions,
  fetchAllEvents,
  fetchEscalations,
  fetchKillSwitchStatus,
  fetchPolicyRules,
  activateKillSwitch,
  deactivateKillSwitch,
} from "@/lib/api";
import type {
  ActionContract,
  EventRecord,
  EscalatedAction,
  KillSwitchStatus,
  PolicyRule,
} from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-white/[0.06] text-[#d4d4d4] border border-[#1a1a1a]",
  ESCALATED: "bg-white/[0.04] text-[#888888] border border-[#1a1a1a]",
  DENIED: "bg-white/[0.04] text-[#444444] border border-[#1a1a1a]",
  EXECUTING: "bg-white/[0.06] text-[#d4d4d4] border border-[#1a1a1a]",
  APPROVED: "bg-white/[0.06] text-[#d4d4d4] border border-[#1a1a1a]",
  PROPOSED: "bg-white/[0.04] text-[#888888] border border-[#1a1a1a]",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HomePage() {
  const [actions, setActions] = useState<ActionContract[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [escalations, setEscalations] = useState<EscalatedAction[]>([]);
  const [killSwitch, setKillSwitch] = useState<KillSwitchStatus | null>(null);
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [killSwitchLoading, setKillSwitchLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [actionsRes, eventsRes, escalationsRes, ksRes, rulesRes] =
        await Promise.all([
          fetchAllActions({ limit: 200 }),
          fetchAllEvents({ limit: 10 }),
          fetchEscalations(),
          fetchKillSwitchStatus(),
          fetchPolicyRules(),
        ]);
      setActions(actionsRes);
      setEvents(eventsRes);
      setEscalations(escalationsRes);
      setKillSwitch(ksRes);
      setPolicyRules(rulesRes);
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
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    if (!lastUpdated) return;
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  // Metrics
  const now = Date.now();
  const actions24h = actions.filter(
    (a) => now - new Date(a.created_at).getTime() < 86400000
  );
  const completed = actions24h.filter((a) => a.status === "COMPLETED").length;
  const denied = actions24h.filter((a) => a.status === "DENIED").length;
  const escalated = actions24h.filter((a) => a.status === "ESCALATED").length;
  const denominator = completed + denied + escalated;
  const executionRate =
    denominator > 0 ? ((completed / denominator) * 100).toFixed(1) : "--";
  const pendingEscalations = escalations.length;
  const activePolicies = policyRules.filter((r) => r.active).length;

  async function handleKillSwitchToggle() {
    if (!killSwitch) return;
    if (killSwitch.active) {
      setKillSwitchLoading(true);
      try {
        const res = await deactivateKillSwitch();
        setKillSwitch(res);
      } catch {
        /* ignore */
      } finally {
        setKillSwitchLoading(false);
      }
    } else {
      const confirmed = window.confirm(
        "Activate kill switch? This will deny ALL actions until deactivated."
      );
      if (!confirmed) return;
      setKillSwitchLoading(true);
      try {
        const res = await activateKillSwitch();
        setKillSwitch(res);
      } catch {
        /* ignore */
      } finally {
        setKillSwitchLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-6xl">
        <p className="text-sm text-[#444444]">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl">
        <p className="text-sm text-[#888888]">Error: {error}</p>
      </div>
    );
  }

  const recentActions = actions.slice(0, 10);
  const recentEvents = events.slice(0, 5);

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Home</h1>
          <p className="text-xs text-[#444444] mt-0.5">
            Last updated {secondsAgo}s ago
          </p>
        </div>
      </div>

      {/* Kill Switch Strip */}
      {killSwitch && (
        <div
          className={`rounded border p-3 mb-6 flex items-center justify-between ${
            killSwitch.active
              ? "bg-red-950/40 border-red-900/50"
              : "bg-[#111111] border-[#1a1a1a]"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${
                killSwitch.active ? "bg-red-500" : "bg-[#444444]"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                killSwitch.active ? "text-red-400" : "text-[#444444]"
              }`}
            >
              {killSwitch.active
                ? "KILL SWITCH ACTIVE -- all actions denied"
                : "Kill Switch: Off"}
            </span>
          </div>
          <button
            onClick={handleKillSwitchToggle}
            disabled={killSwitchLoading}
            className={`text-xs font-semibold px-4 py-1.5 rounded transition-colors disabled:opacity-40 ${
              killSwitch.active
                ? "bg-white/[0.06] text-[#d4d4d4] hover:bg-white/[0.1] border border-[#1a1a1a]"
                : "bg-[#d4d4d4] text-[#0a0a0a] hover:bg-white"
            }`}
          >
            {killSwitchLoading
              ? "..."
              : killSwitch.active
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Actions (24h)", value: String(actions24h.length) },
          { label: "Execution Rate", value: `${executionRate}%` },
          { label: "Pending Escalations", value: String(pendingEscalations) },
          { label: "Active Policies", value: String(activePolicies) },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-[#111111] rounded border border-[#1a1a1a] p-5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] mb-4">
              {m.label}
            </p>
            <p className="text-3xl font-bold text-white">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex gap-5">
        {/* Recent Actions */}
        <div className="bg-[#111111] rounded border border-[#1a1a1a] p-5 flex-[3]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444]">
              Recent Actions
            </p>
            <Link
              href="/actions"
              className="text-xs text-[#d4d4d4] hover:text-white"
            >
              View all
            </Link>
          </div>
          {recentActions.length === 0 ? (
            <p className="text-xs text-[#444444]">No actions yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-[#444444]">
                  <th className="text-left pb-3 font-semibold">Action ID</th>
                  <th className="text-left pb-3 font-semibold">Entity</th>
                  <th className="text-left pb-3 font-semibold">Action Type</th>
                  <th className="text-left pb-3 font-semibold">Status</th>
                  <th className="text-left pb-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActions.map((a) => {
                  const entity = a.target_entity
                    ? `${a.target_entity.entity_type || ""}/${a.target_entity.entity_id || ""}`
                    : "--";
                  const style =
                    STATUS_STYLES[a.status] ?? STATUS_STYLES.COMPLETED;
                  return (
                    <tr key={a.action_id} className="border-t border-[#1a1a1a]">
                      <td className="py-2.5 pr-4">
                        <span className="font-mono text-xs text-[#d4d4d4]">
                          {a.action_id.slice(0, 12)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-[#888888]">
                        {entity}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-[#888888]">
                        {a.action_type}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${style}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-[#444444]">
                        {timeAgo(a.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Events */}
        <div className="bg-[#111111] rounded border border-[#1a1a1a] p-5 flex-[1.5]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] mb-4">
            Recent Events
          </p>
          {recentEvents.length === 0 ? (
            <p className="text-xs text-[#444444]">No events yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentEvents.map((ev) => (
                <div key={ev.event_id} className="flex flex-col gap-0.5">
                  <span className="font-mono text-[11px] text-[#444444]">
                    {timeAgo(ev.occurred_at)}
                  </span>
                  <span className="text-xs text-[#888888]">
                    {ev.event_type}
                  </span>
                  <span className="text-[11px] text-[#444444]">
                    {ev.entity_type}/{ev.entity_id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
