"use client";

import { Cpu } from "lucide-react";

const AGENTS = [
  { id: "agent-churn-monitor", name: "Churn Monitor", description: "Watches entity churn_risk and triggers retention actions", actions: ["apply_discount", "flag_for_review"], last_seen: "2026-03-04T14:32:07Z", status: "active" },
  { id: "agent-refund-processor", name: "Refund Processor", description: "Processes refund requests with eligibility gating", actions: ["issue_refund"], last_seen: "2026-03-04T14:28:11Z", status: "active" },
  { id: "agent-provisioner", name: "Auto Provisioner", description: "Provisions cloud instances based on tenant quota", actions: ["provision_instance"], last_seen: "2026-03-04T14:18:03Z", status: "active" },
];

export default function AgentsPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-gray-900">Agents</h1>
        <p className="text-xs text-gray-400 mt-0.5">{AGENTS.length} registered agents</p>
      </div>

      <div className="flex flex-col gap-4">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Cpu size={16} className="text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{agent.name}</h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                    Active
                  </span>
                </div>
                <p className="font-mono text-[11px] text-gray-400 mb-2">{agent.id}</p>
                <p className="text-xs text-gray-500 mb-3">{agent.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {agent.actions.map((a) => (
                    <span key={a} className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-gray-400 shrink-0">
                Last seen {new Date(agent.last_seen).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} UTC
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
