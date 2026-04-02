"use client";

import { useEffect, useState } from "react";
import { fetchAllActions } from "@/lib/api";
import type { ActionContract } from "@/lib/api";

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
      if (action.created_at > entry.lastSeen) {
        entry.lastSeen = action.created_at;
      }
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

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllActions({ limit: 200 })
      .then((actions) => {
        setAgents(deriveAgents(actions));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load data");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-3xl">
        <p className="text-sm text-[#444444]">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-3xl">
        <p className="text-sm text-[#888888]">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-white">Agents</h1>
        <p className="text-xs text-[#444444] mt-0.5">
          {agents.length} agent{agents.length !== 1 ? "s" : ""} derived from
          action history
        </p>
      </div>

      {agents.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-[#444444]">
            No actions found. Agents will appear here once actions are proposed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {agents.map((agent) => (
            <div
              key={agent.agentId}
              className="bg-[#111111] rounded border border-[#1a1a1a] p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-mono text-sm font-semibold text-white">
                      {agent.agentId}
                    </h3>
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
                    {agent.actionsCount} action
                    {agent.actionsCount !== 1 ? "s" : ""} -- last seen{" "}
                    {timeAgo(agent.lastSeen)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
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
  );
}
