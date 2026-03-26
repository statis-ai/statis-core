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
  "action.completed": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "action.escalated": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "action.denied":    "bg-red-500/15 text-red-400 border-red-500/20",
  "state.updated":    "bg-sky-500/15 text-sky-400 border-sky-500/20",
};

export default function EntitiesPage() {
  const [activeId, setActiveId] = useState("acct-42");
  const entity = ENTITIES.find((e) => e.id === activeId)!;

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      {/* Entity list */}
      <div className="w-[200px] shrink-0 border-r border-white/6 overflow-y-auto bg-[#08080f]">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a4a6a]">Entities</p>
        </div>
        <ul>
          {ENTITIES.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => setActiveId(e.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-white/[0.03] transition-colors",
                  activeId === e.id
                    ? "bg-[#00ffc8]/8 border-l-2 border-l-[#00ffc8]"
                    : "hover:bg-white/[0.03]"
                )}
              >
                <p className={cn("font-mono text-xs font-semibold", activeId === e.id ? "text-[#00ffc8]" : "text-[#c4c4d4]")}>
                  {e.id}
                </p>
                <p className="text-[10px] text-[#4a4a6a] mt-0.5">{e.type} · rev {e.rev}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#00ffc8]/10 flex items-center justify-center">
            <Database size={16} className="text-[#00ffc8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-base font-semibold text-white">{entity.id}</h2>
              <span className="text-[10px] bg-white/5 text-[#5a5a7a] px-2 py-0.5 rounded border border-white/8">{entity.type}</span>
              <span className="text-[10px] font-mono text-[#4a4a6a] bg-white/4 border border-white/8 px-2 py-0.5 rounded">rev {entity.rev}</span>
            </div>
            <p className="text-[11px] text-[#4a4a6a] mt-0.5">
              Last updated: {new Date(entity.updated).toLocaleString()}
            </p>
          </div>
        </div>

        {/* State grid */}
        <div className="bg-[#0d0d1a] rounded-xl border border-white/8 p-5 mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] mb-4">State</p>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-4">
            {Object.entries(entity.state).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] text-[#4a4a6a] uppercase tracking-wider mb-0.5">{k.replace(/_/g, " ")}</dt>
                <dd className="font-mono text-xs text-[#c4c4d4]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Events timeline */}
        <div className="bg-[#0d0d1a] rounded-xl border border-white/8 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a5a7a] mb-4">Recent Events</p>
          <ol className="flex flex-col gap-3">
            {entity.events.map((ev, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-mono text-[11px] text-[#4a4a6a] shrink-0 mt-0.5">{ev.time}</span>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0", EVENT_TYPE_STYLES[ev.type] ?? "bg-white/5 text-[#5a5a7a] border-white/8")}>
                  {ev.type}
                </span>
                <span className="text-xs text-[#8a8a9a]">{ev.detail}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
