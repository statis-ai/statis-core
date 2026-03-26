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
  "receipt.minted":   "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "adapter.ok":       "bg-sky-500/15 text-sky-400 border-sky-500/20",
  "policy.approved":  "bg-[#00ffc8]/10 text-[#00ffc8] border-[#00ffc8]/20",
  "policy.denied":    "bg-red-500/15 text-red-400 border-red-500/20",
  "action.received":  "bg-white/5 text-[#6a6a8a] border-white/8",
  "action.escalated": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "action.denied":    "bg-red-500/15 text-red-400 border-red-500/20",
  "action.completed": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

export default function EventsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-white">Events</h1>
        <p className="text-xs text-[#5a5a7a] mt-0.5">Raw event log · live stream</p>
      </div>

      <div className="bg-[#0d0d1a] rounded-xl border border-white/8 overflow-hidden">
        <div className="bg-[#0a0a14] border-b border-white/8 px-5 py-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          <span className="text-xs text-[#5a5a7a] font-mono">Live</span>
        </div>
        <div className="divide-y divide-white/5">
          {EVENTS.map((ev, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <span className="font-mono text-[11px] text-[#4a4a6a] shrink-0 mt-0.5 w-20">
                {new Date(ev.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 self-start mt-0.5", TYPE_STYLES[ev.type] ?? "bg-white/5 text-[#6a6a8a] border-white/8")}>
                {ev.type}
              </span>
              <span className="font-mono text-[11px] text-[#00ffc8]/70 shrink-0 mt-0.5">{ev.entity}</span>
              <span className="text-xs text-[#8a8a9a] mt-0.5">{ev.detail}</span>
              <span className="font-mono text-[10px] text-[#3a3a5a] ml-auto shrink-0 mt-0.5">{ev.action_id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
