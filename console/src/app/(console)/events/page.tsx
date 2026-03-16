"use client";

import { cn } from "@/lib/utils";

const EVENTS = [
  { time: "2026-03-04T14:32:08Z", type: "receipt.minted", entity: "acct-42", detail: "rct-8821 · hash 3f8a9d2c…", action_id: "act-0192" },
  { time: "2026-03-04T14:32:08Z", type: "adapter.ok", entity: "acct-42", detail: "stripe · customer.discount.applied", action_id: "act-0192" },
  { time: "2026-03-04T14:32:07Z", type: "policy.approved", entity: "acct-42", detail: "churn_retention_v1 v1.0 → APPROVED", action_id: "act-0192" },
  { time: "2026-03-04T14:32:07Z", type: "action.received", entity: "acct-42", detail: "apply_discount 10%", action_id: "act-0192" },
  { time: "2026-03-04T14:28:11Z", type: "action.escalated", entity: "cust-771", detail: "issue_refund $340 → vip_escalation_v1", action_id: "act-0191" },
  { time: "2026-03-04T14:21:44Z", type: "action.denied", entity: "acct-88", detail: "apply_discount denied: ltv < $500", action_id: "act-0190" },
  { time: "2026-03-04T14:18:06Z", type: "receipt.minted", entity: "tenant-9", detail: "rct-8823 · hash 7f3e1c9a…", action_id: "act-0189" },
  { time: "2026-03-04T14:18:04Z", type: "adapter.ok", entity: "tenant-9", detail: "aws · ec2.instance.launched", action_id: "act-0189" },
  { time: "2026-03-04T14:18:03Z", type: "policy.approved", entity: "tenant-9", detail: "auto_provision_v1 v1.0 → APPROVED", action_id: "act-0189" },
];

const TYPE_STYLES: Record<string, string> = {
  "receipt.minted": "bg-green-50 text-green-700 border-green-200",
  "adapter.ok": "bg-blue-50 text-blue-700 border-blue-200",
  "policy.approved": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "policy.denied": "bg-red-50 text-red-700 border-red-200",
  "action.received": "bg-gray-50 text-gray-600 border-gray-200",
  "action.escalated": "bg-violet-50 text-violet-700 border-violet-200",
  "action.denied": "bg-red-50 text-red-700 border-red-200",
  "action.completed": "bg-green-50 text-green-700 border-green-200",
};

export default function EventsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-gray-900">Events</h1>
        <p className="text-xs text-gray-400 mt-0.5">Raw event log · live stream</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
        <div className="divide-y divide-gray-100">
          {EVENTS.map((ev, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors">
              <span className="font-mono text-[11px] text-gray-400 shrink-0 mt-0.5 w-20">
                {new Date(ev.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 self-start mt-0.5", TYPE_STYLES[ev.type] ?? "bg-gray-50 text-gray-500 border-gray-200")}>
                {ev.type}
              </span>
              <span className="font-mono text-[11px] text-indigo-500 shrink-0 mt-0.5">{ev.entity}</span>
              <span className="text-xs text-gray-600 mt-0.5">{ev.detail}</span>
              <span className="font-mono text-[10px] text-gray-300 ml-auto shrink-0 mt-0.5">{ev.action_id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
