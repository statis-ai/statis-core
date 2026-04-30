"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, ShieldCheck } from "lucide-react";
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
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function deriveAgents(actions: ActionContract[]): AgentInfo[] {
  const map = new Map<
    string,
    { count: number; types: Set<string>; lastSeen: string }
  >();
  for (const action of actions) {
    const agent = action.proposed_by || "unknown";
    const entry = map.get(agent);
    if (!entry) {
      map.set(agent, {
        count: 1,
        types: new Set([action.action_type]),
        lastSeen: action.created_at,
      });
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
  agents.sort(
    (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  );
  return agents;
}

const inputCls =
  "w-full font-mono text-sm px-3 py-2 rounded border border-[#1a1a1a] bg-[#0a0a0a] text-white placeholder:text-[#444444] focus:outline-none focus:ring-1 focus:ring-white/20";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [registered, setRegistered] = useState<RegisteredAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    agent_id: "",
    name: "",
    allowed_action_types: "",
    rate_limit_per_hour: "",
  });

  const load = useCallback(async () => {
    try {
      const [actions, regs] = await Promise.all([
        fetchAllActions({ limit: 5000 }),
        fetchRegisteredAgents(),
      ]);
      setAgents(deriveAgents(actions));
      setRegistered(regs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  if (loading) {
    return (
      <div className="p-8 max-w-3xl">
        <p className="text-sm text-[#444444]">Loading...</p>
      </div>
    );
  }

  const registeredIds = new Set(registered.map((r) => r.agent_id));

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Agents</h1>
          <p className="text-xs text-[#444444] mt-0.5">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} observed —{" "}
            {registered.length} registered
          </p>
        </div>
        <button
          onClick={() => setShowPanel(true)}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors"
        >
          <Plus size={14} />
          Register Agent
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-mono">
          {error}
          <button onClick={() => setError(null)} className="ml-3 opacity-60 hover:opacity-100">
            dismiss
          </button>
        </div>
      )}

      {/* Registered agents */}
      {registered.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] mb-3">
            Registered
          </p>
          <div className="flex flex-col gap-3">
            {registered.map((r) => (
              <div
                key={r.agent_id}
                className="bg-[#111111] rounded border border-[#1a1a1a] p-4 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={13} className="text-[#555]" />
                    <span className="font-mono text-sm font-semibold text-white">
                      {r.agent_id}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                        r.is_active
                          ? "text-[#d4d4d4] bg-white/[0.06] border-[#1a1a1a]"
                          : "text-[#444444] bg-white/[0.02] border-[#1a1a1a]"
                      }`}
                    >
                      {r.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-[#555555] mb-2">{r.name}</p>
                  {r.allowed_action_types.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {r.allowed_action_types.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] text-[#888888] bg-white/[0.04] px-2 py-0.5 rounded border border-[#1a1a1a]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {r.rate_limit_per_hour !== null && (
                    <p className="text-[11px] text-[#444444] mt-1.5">
                      {r.rate_limit_per_hour} req/hr limit
                    </p>
                  )}
                </div>
                {r.is_active && (
                  <button
                    onClick={() => handleDeactivate(r.agent_id)}
                    className="text-xs text-[#444444] hover:text-red-400 transition-colors shrink-0"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observed agents */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] mb-3">
          Observed from Action History
        </p>
        {agents.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-[#444444]">
              No actions found. Agents appear here once actions are proposed.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {agents.map((agent) => (
              <div
                key={agent.agentId}
                className="bg-[#111111] rounded border border-[#1a1a1a] p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-sm font-semibold text-white">
                      {agent.agentId}
                    </h3>
                    {registeredIds.has(agent.agentId) && (
                      <ShieldCheck size={13} className="text-[#555]" aria-label="Registered" />
                    )}
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                        agent.active
                          ? "text-[#d4d4d4] bg-white/[0.06] border-[#1a1a1a]"
                          : "text-[#444444] bg-white/[0.02] border-[#1a1a1a]"
                      }`}
                    >
                      {agent.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-[#444444]">
                    {agent.actionsCount} action{agent.actionsCount !== 1 ? "s" : ""} — last seen{" "}
                    {timeAgo(agent.lastSeen)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {agent.actionTypes.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[11px] text-[#888888] bg-white/[0.04] px-2 py-0.5 rounded border border-[#1a1a1a]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration slide-in panel */}
      {showPanel && (
        <div className="fixed inset-y-0 right-0 w-[380px] bg-[#111111] border-l border-[#1a1a1a] shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
            <p className="text-sm font-semibold text-white">Register Agent</p>
            <button
              onClick={() => setShowPanel(false)}
              className="text-[#444444] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-6 flex-1 space-y-5 overflow-y-auto">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                Agent ID
              </label>
              <input
                placeholder="e.g. billing-agent-v2"
                value={form.agent_id}
                onChange={(e) => setForm((f) => ({ ...f, agent_id: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                Name
              </label>
              <input
                placeholder="e.g. Billing Agent"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                Allowed Action Types
              </label>
              <input
                placeholder="apply_discount, send_email"
                value={form.allowed_action_types}
                onChange={(e) =>
                  setForm((f) => ({ ...f, allowed_action_types: e.target.value }))
                }
                className={inputCls}
              />
              <p className="text-[10px] text-[#444444] mt-1">
                Comma-separated. Leave empty to allow all.
              </p>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] block mb-2">
                Rate Limit (req/hr)
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={form.rate_limit_per_hour}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rate_limit_per_hour: e.target.value }))
                }
                className={inputCls}
              />
              <p className="text-[10px] text-[#444444] mt-1">Leave empty for no limit.</p>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-[#1a1a1a] flex gap-3">
            <button
              onClick={handleRegister}
              disabled={saving || !form.agent_id || !form.name}
              className="flex-1 py-2 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Registering..." : "Register"}
            </button>
            <button
              onClick={() => setShowPanel(false)}
              className="px-4 py-2 rounded border border-[#1a1a1a] text-[#888888] text-sm hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
