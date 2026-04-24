"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  fetchAllActions,
  fetchRegisteredAgents,
  registerAgent,
  deactivateAgent,
} from "@/lib/api";
import type { ActionContract, RegisteredAgent } from "@/lib/api";

interface AgentInfo {
  agentId: string;
  actionsCount: number;
  actionTypes: string[];
  lastSeen: string;
  active: boolean;
}

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

function deriveAgents(actions: ActionContract[]): AgentInfo[] {
  const map = new Map<string, { count: number; types: Set<string>; lastSeen: string }>();
  for (const action of actions) {
    const agent = action.proposed_by || "unknown";
    const entry = map.get(agent);
    if (!entry) {
      map.set(agent, { count: 1, types: new Set([action.action_type]), lastSeen: action.created_at });
    } else {
      entry.count++;
      entry.types.add(action.action_type);
      if (action.created_at > entry.lastSeen) entry.lastSeen = action.created_at;
    }
  }
  const now = Date.now();
  const agents: AgentInfo[] = [];
  for (const [agentId, data] of map) {
    agents.push({
      agentId,
      actionsCount: data.count,
      actionTypes: Array.from(data.types),
      lastSeen: data.lastSeen,
      active: now - new Date(data.lastSeen).getTime() < 86400000,
    });
  }
  agents.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
  return agents;
}

const inputCls =
  "w-full font-sans text-[13px] px-[11px] py-2 rounded-[3px] border border-rule bg-paper text-ink tracking-[-0.005em] placeholder:text-ink-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-[rgba(184,68,46,0.15)]";

const labelCls =
  "block font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted mb-[5px]";

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

function StateChip({ active }: { active: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] border font-mono text-[9.5px] tracking-[0.14em] uppercase " +
        (active
          ? "bg-[rgba(29,58,46,0.08)] text-seal border-seal"
          : "bg-bg text-ink-muted border-rule")
      }
    >
      <span
        className={
          "w-1.5 h-1.5 rounded-full " + (active ? "bg-seal" : "bg-ink-muted")
        }
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [registered, setRegistered] = useState<RegisteredAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailAgent, setDetailAgent] = useState<string | null>(null);
  const [allActions, setAllActions] = useState<ActionContract[]>([]);
  const [form, setForm] = useState({
    agent_id: "",
    name: "",
    allowed_action_types: "",
    rate_limit_per_hour: "",
  });

  const load = useCallback(async () => {
    try {
      const [actions, regs] = await Promise.all([
        fetchAllActions({ limit: 200 }),
        fetchRegisteredAgents(),
      ]);
      setAllActions(actions);
      setAgents(deriveAgents(actions));
      setRegistered(regs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRegister() {
    setSaving(true);
    try {
      const types = form.allowed_action_types
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const rateLimit = form.rate_limit_per_hour
        ? parseInt(form.rate_limit_per_hour, 10) || null
        : null;
      await registerAgent({
        agent_id: form.agent_id,
        name: form.name,
        allowed_action_types: types,
        rate_limit_per_hour: rateLimit,
      });
      setShowPanel(false);
      setForm({ agent_id: "", name: "", allowed_action_types: "", rate_limit_per_hour: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(agentId: string) {
    try {
      await deactivateAgent(agentId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deactivation failed");
    }
  }

  const registeredIds = useMemo(() => new Set(registered.map((r) => r.agent_id)), [registered]);
  const detailActions = useMemo(
    () => (detailAgent ? allActions.filter((a) => (a.proposed_by || "unknown") === detailAgent).slice(0, 25) : []),
    [allActions, detailAgent],
  );

  if (loading) {
    return (
      <div className="p-8 max-w-[1100px]">
        <p className="text-[12px] text-ink-muted tracking-[-0.005em]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-sans font-medium text-[22px] tracking-[-0.025em] text-ink leading-none">
            Agents
          </h1>
          <p className="text-[11.5px] text-ink-muted mt-1.5 tracking-[-0.005em] font-mono">
            {agents.length} observed · {registered.length} registered
          </p>
        </div>
        <button
          onClick={() => setShowPanel(true)}
          className="py-2 px-3 bg-accent text-paper border border-accent rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium hover:opacity-90 transition-opacity"
        >
          ⊕ Register agent
        </button>
      </div>

      {error ? (
        <div className="bg-[rgba(184,68,46,0.06)] border border-accent rounded-[3px] px-3 py-2 mb-4 text-[12px] leading-[1.5] text-accent tracking-[-0.005em] flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="font-mono text-[9.5px] tracking-[0.14em] uppercase opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {registered.length > 0 ? (
        <div className="mb-6">
          <SectionHeader label="◆ Registered" />
          <div className="bg-paper border border-rule rounded-b-[3px] divide-y divide-rule">
            {registered.map((r) => (
              <div key={r.agent_id} className="p-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[13px] font-medium text-ink">{r.agent_id}</span>
                    <StateChip active={r.is_active} />
                  </div>
                  <p className="text-[12px] text-ink-soft tracking-[-0.005em] mb-2">{r.name}</p>
                  {r.allowed_action_types.length > 0 ? (
                    <div className="flex gap-1.5 flex-wrap">
                      {r.allowed_action_types.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10.5px] text-ink-soft bg-bg border border-rule px-2 py-0.5 rounded-[2px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {r.rate_limit_per_hour !== null ? (
                    <p className="font-mono text-[10.5px] text-ink-muted mt-2 tracking-[0.02em]">
                      {r.rate_limit_per_hour} req/hr limit
                    </p>
                  ) : null}
                </div>
                {r.is_active ? (
                  <button
                    onClick={() => handleDeactivate(r.agent_id)}
                    className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-soft border-b border-dotted border-ink-muted hover:text-accent hover:border-accent shrink-0"
                  >
                    Deactivate
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <SectionHeader label="◈ Observed from action history" />
        <div className="bg-paper border border-rule rounded-b-[3px]">
          {agents.length === 0 ? (
            <p className="p-8 text-center text-[12px] text-ink-muted tracking-[-0.005em]">
              No actions yet. Agents appear here once they propose their first action.
            </p>
          ) : (
            <div className="divide-y divide-rule">
              {agents.map((agent) => (
                <button
                  key={agent.agentId}
                  onClick={() => setDetailAgent(agent.agentId)}
                  className="w-full text-left p-4 hover:bg-bg transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[13px] font-medium text-ink truncate">
                        {agent.agentId}
                      </span>
                      {registeredIds.has(agent.agentId) ? (
                        <span
                          className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-seal bg-[rgba(29,58,46,0.08)] border border-seal px-1.5 py-0.5 rounded-[2px]"
                          aria-label="Registered"
                        >
                          ◆ Registered
                        </span>
                      ) : null}
                      <StateChip active={agent.active} />
                    </div>
                    <p className="font-mono text-[10.5px] text-ink-muted tracking-[0.02em] shrink-0">
                      {agent.actionsCount} action{agent.actionsCount !== 1 ? "s" : ""} · {timeAgo(agent.lastSeen)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {agent.actionTypes.slice(0, 8).map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10.5px] text-ink-soft bg-bg border border-rule px-2 py-0.5 rounded-[2px]"
                      >
                        {t}
                      </span>
                    ))}
                    {agent.actionTypes.length > 8 ? (
                      <span className="font-mono text-[10.5px] text-ink-muted tracking-[0.02em]">
                        +{agent.actionTypes.length - 8} more
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPanel ? (
        <>
          <div
            className="fixed inset-0 bg-ink/20 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[400px] bg-paper border-l border-rule shadow-[0_0_32px_-8px_rgba(60,40,20,0.15)] z-50 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-rule">
              <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted font-medium">
                ⊕ Register agent
              </span>
              <button
                onClick={() => setShowPanel(false)}
                className="font-mono text-[12px] text-ink-muted hover:text-ink leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5 flex-1 space-y-4 overflow-y-auto">
              <div>
                <label className={labelCls}>Agent ID</label>
                <input
                  placeholder="billing-agent-v2"
                  value={form.agent_id}
                  onChange={(e) => setForm((f) => ({ ...f, agent_id: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Name</label>
                <input
                  placeholder="Billing Agent"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Allowed action types</label>
                <input
                  placeholder="apply_discount, send_email"
                  value={form.allowed_action_types}
                  onChange={(e) => setForm((f) => ({ ...f, allowed_action_types: e.target.value }))}
                  className={inputCls}
                />
                <p className="text-[11px] leading-[1.4] text-ink-muted mt-1 tracking-[-0.005em]">
                  Comma-separated. Leave empty to allow any action type.
                </p>
              </div>
              <div>
                <label className={labelCls}>Rate limit (req/hr)</label>
                <input
                  type="number"
                  placeholder="100"
                  value={form.rate_limit_per_hour}
                  onChange={(e) => setForm((f) => ({ ...f, rate_limit_per_hour: e.target.value }))}
                  className={inputCls}
                />
                <p className="text-[11px] leading-[1.4] text-ink-muted mt-1 tracking-[-0.005em]">
                  Leave empty for no limit.
                </p>
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-rule flex gap-2">
              <button
                onClick={handleRegister}
                disabled={saving || !form.agent_id || !form.name}
                className="flex-1 py-2 px-3 bg-accent text-paper border border-accent rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Registering…" : "Register"}
              </button>
              <button
                onClick={() => setShowPanel(false)}
                className="px-4 py-2 bg-paper text-ink border border-rule rounded-[3px] font-mono text-[10.5px] tracking-[0.1em] uppercase hover:border-ink-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      ) : null}

      {detailAgent ? (
        <>
          <div
            className="fixed inset-0 bg-ink/20 z-40"
            onClick={() => setDetailAgent(null)}
          />
          <div className="fixed inset-y-0 right-0 w-[460px] bg-paper border-l border-rule shadow-[0_0_32px_-8px_rgba(60,40,20,0.15)] z-50 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-rule">
              <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted font-medium">
                ◈ Agent detail
              </span>
              <button
                onClick={() => setDetailAgent(null)}
                className="font-mono text-[12px] text-ink-muted hover:text-ink leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5 border-b border-rule">
              <p className="font-mono text-[14px] text-ink mb-1">{detailAgent}</p>
              <p className="font-mono text-[10.5px] tracking-[0.02em] text-ink-muted">
                {detailActions.length} recent action{detailActions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {detailActions.length === 0 ? (
                <p className="p-5 text-[12px] text-ink-muted tracking-[-0.005em]">
                  No actions found for this agent.
                </p>
              ) : (
                <div className="divide-y divide-rule">
                  {detailActions.map((a) => (
                    <div key={a.action_id} className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[11.5px] text-ink">
                          {a.action_id.slice(0, 12)}
                        </span>
                        <span className="font-mono text-[10px] text-ink-muted tracking-[0.02em]">
                          {timeAgo(a.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10.5px] text-ink-soft">{a.action_type}</span>
                        <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted">
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
