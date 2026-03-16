"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Database } from "lucide-react";

const ENTITIES = [
  {
    id: "acct-42",
    type: "customer",
    rev: 14,
    updated: "2026-03-04T14:32:07Z",
    state: {
      churn_risk: "HIGH",
      ltv: "$1,200",
      plan: "growth",
      last_discount: "2026-03-04T14:32:07Z",
      last_action: "apply_discount",
      discount_applied: "10%",
    },
    events: [
      { time: "14:32:07", type: "action.completed", detail: "apply_discount 10% via churn_retention_v1" },
      { time: "14:21:44", type: "state.updated", detail: "churn_risk: MEDIUM → HIGH" },
      { time: "13:10:02", type: "action.completed", detail: "send_notification re: plan upgrade" },
    ],
  },
  {
    id: "cust-771",
    type: "customer",
    rev: 7,
    updated: "2026-03-04T14:28:11Z",
    state: {
      standing: "good",
      last_refund: "null",
      txn_age: "12d",
      plan: "pro",
      last_action: "issue_refund",
    },
    events: [
      { time: "14:28:11", type: "action.escalated", detail: "issue_refund $340 escalated for manual review" },
      { time: "12:00:44", type: "state.updated", detail: "standing: flagged → good" },
    ],
  },
  {
    id: "acct-88",
    type: "customer",
    rev: 5,
    updated: "2026-03-04T14:21:44Z",
    state: {
      churn_risk: "LOW",
      ltv: "$340",
      plan: "starter",
      last_action: "apply_discount",
      result: "DENIED",
    },
    events: [
      { time: "14:21:44", type: "action.denied", detail: "apply_discount denied: ltv < threshold" },
    ],
  },
  {
    id: "tenant-9",
    type: "tenant",
    rev: 3,
    updated: "2026-03-04T14:18:03Z",
    state: {
      tier: "enterprise",
      instances: "4",
      quota: "10",
      region: "us-east-1",
      last_action: "provision_instance",
    },
    events: [
      { time: "14:18:03", type: "action.completed", detail: "provision_instance t3.large" },
      { time: "11:30:00", type: "state.updated", detail: "instances: 3 → 4" },
    ],
  },
  {
    id: "acct-77",
    type: "customer",
    rev: 9,
    updated: "2026-03-04T14:28:11Z",
    state: {
      churn_risk: "HIGH",
      ltv: "$6,200",
      plan: "enterprise",
      last_action: "apply_discount",
      vip: "true",
    },
    events: [
      { time: "14:28:11", type: "action.escalated", detail: "apply_discount 25% escalated — VIP threshold" },
    ],
  },
];

const EVENT_TYPE_STYLES: Record<string, string> = {
  "action.completed": "bg-green-50 text-green-700 border-green-200",
  "action.escalated": "bg-violet-50 text-violet-700 border-violet-200",
  "action.denied": "bg-red-50 text-red-700 border-red-200",
  "state.updated": "bg-blue-50 text-blue-700 border-blue-200",
};

export default function EntitiesPage() {
  const [activeId, setActiveId] = useState("acct-42");
  const entity = ENTITIES.find((e) => e.id === activeId)!;

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* Entity list */}
      <div className="w-[200px] shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Entities</p>
        </div>
        <ul>
          {ENTITIES.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => setActiveId(e.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-gray-50 transition-colors",
                  activeId === e.id ? "bg-indigo-50" : "hover:bg-gray-50"
                )}
              >
                <p className={cn("font-mono text-xs font-semibold", activeId === e.id ? "text-indigo-700" : "text-gray-800")}>
                  {e.id}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{e.type} · rev {e.rev}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Database size={16} className="text-indigo-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base font-semibold text-gray-900">{entity.id}</h2>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{entity.type}</span>
              <span className="text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">rev {entity.rev}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Last updated: {new Date(entity.updated).toLocaleString()}
            </p>
          </div>
        </div>

        {/* State grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">State</p>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-4">
            {Object.entries(entity.state).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{k.replace(/_/g, " ")}</dt>
                <dd className="font-mono text-xs text-gray-800">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Events timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">Recent Events</p>
          <ol className="flex flex-col gap-3">
            {entity.events.map((ev, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-mono text-[11px] text-gray-400 shrink-0 mt-0.5">{ev.time}</span>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0", EVENT_TYPE_STYLES[ev.type] ?? "bg-gray-50 text-gray-500 border-gray-200")}>
                  {ev.type}
                </span>
                <span className="text-xs text-gray-600">{ev.detail}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
