"use client";

import { Radio, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const WEBHOOKS = [
  { id: "wh-001", url: "https://api.example.com/statis/events", events: ["action.completed", "receipt.minted"], status: "active", last_delivery: "2026-03-04T14:32:08Z", success_rate: "100%" },
  { id: "wh-002", url: "https://hooks.zapier.com/hooks/catch/12345/abc", events: ["action.escalated"], status: "active", last_delivery: "2026-03-04T14:28:11Z", success_rate: "98%" },
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  paused: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

export default function WebhooksPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Webhooks</h1>
          <p className="text-xs text-[#5a5a7a] mt-0.5">{WEBHOOKS.length} subscriptions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ffc8] text-[#080810] text-sm font-semibold hover:bg-[#00ffc8]/90 transition-colors">
          <Plus size={14} />
          Add webhook
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {WEBHOOKS.map((wh) => (
          <div key={wh.id} className="bg-[#0d0d1a] rounded-xl border border-white/8 p-5 hover:border-white/12 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#00ffc8]/10 flex items-center justify-center shrink-0">
                <Radio size={14} className="text-[#00ffc8]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-xs text-[#c4c4d4] truncate">{wh.url}</p>
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0", STATUS_STYLES[wh.status])}>
                    {wh.status}
                  </span>
                </div>
                <p className="text-[10px] text-[#4a4a6a] font-mono mb-2">{wh.id}</p>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {wh.events.map((e) => (
                    <span key={e} className="font-mono text-[10px] text-[#00ffc8]/70 bg-[#00ffc8]/8 border border-[#00ffc8]/15 px-2 py-0.5 rounded">
                      {e}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#5a5a7a]">
                  Last delivery: {new Date(wh.last_delivery).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} UTC ·{" "}
                  <span className="text-emerald-400 font-medium">{wh.success_rate} success rate</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
