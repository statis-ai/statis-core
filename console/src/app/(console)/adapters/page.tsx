"use client";

import { Plug, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const ADAPTERS = [
  { id: "stripe", name: "Stripe", desc: "Payments, refunds & billing", actions: ["issue_refund", "apply_discount"], status: "connected", last_call: "2026-03-04T14:32:08Z" },
  { id: "salesforce", name: "Salesforce", desc: "CRM & account management", actions: ["update_account", "create_ticket"], status: "ready", last_call: null },
  { id: "zendesk", name: "Zendesk", desc: "Support ticket creation", actions: ["create_ticket"], status: "not_connected", last_call: null },
  { id: "hubspot", name: "HubSpot", desc: "Marketing & deal pipeline", actions: ["send_notification"], status: "not_connected", last_call: null },
  { id: "aws", name: "AWS", desc: "Cloud infrastructure provisioning", actions: ["provision_instance"], status: "ready", last_call: null },
  { id: "custom", name: "Custom API", desc: "Bring your own REST adapter", actions: [], status: "not_connected", last_call: null },
];

const STATUS_META: Record<string, { label: string; pill: string; dot: string }> = {
  connected:     { label: "Connected",        pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500" },
  ready:         { label: "Ready to connect", pill: "bg-sky-500/15 text-sky-400 border-sky-500/20",            dot: "bg-sky-400" },
  not_connected: { label: "Not connected",    pill: "bg-white/5 text-[#444444] border-[#1a1a1a]",             dot: "bg-[#444444]" },
};

export default function AdaptersPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-white">Adapters</h1>
        <p className="text-xs text-[#444444] mt-0.5">
          {ADAPTERS.filter((a) => a.status === "connected").length} connected ·{" "}
          {ADAPTERS.filter((a) => a.status === "ready").length} ready
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ADAPTERS.map((adapter) => {
          const meta = STATUS_META[adapter.status];
          return (
            <div key={adapter.id} className="bg-[#111111] rounded border border-[#1a1a1a] p-5 hover:border-white/[0.1] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white/[0.04] border border-[#1a1a1a] flex items-center justify-center">
                    <Plug size={14} className="text-[#444444]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{adapter.name}</h3>
                    <p className="text-xs text-[#444444] mt-0.5">{adapter.desc}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-3">
                <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", meta.pill)}>
                  {meta.label}
                </span>
              </div>

              {adapter.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {adapter.actions.map((a) => (
                    <span key={a} className="font-mono text-[10px] text-[#888888] bg-white/[0.04] border border-[#1a1a1a] px-2 py-0.5 rounded">
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {adapter.last_call && (
                <p className="text-[10px] text-[#444444] mb-3">
                  Last call: {new Date(adapter.last_call).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} UTC
                </p>
              )}

              {adapter.status !== "connected" && (
                <button className="flex items-center gap-1.5 text-xs text-[#d4d4d4] font-medium hover:text-white transition-colors">
                  {adapter.status === "ready" ? "Connect" : "Configure"}
                  <ExternalLink size={11} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
