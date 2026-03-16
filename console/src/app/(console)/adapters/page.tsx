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
  connected: { label: "Connected", pill: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  ready: { label: "Ready to connect", pill: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
  not_connected: { label: "Not connected", pill: "bg-gray-50 text-gray-500 border-gray-200", dot: "bg-gray-300" },
};

export default function AdaptersPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-gray-900">Adapters</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {ADAPTERS.filter((a) => a.status === "connected").length} connected ·{" "}
          {ADAPTERS.filter((a) => a.status === "ready").length} ready
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ADAPTERS.map((adapter) => {
          const meta = STATUS_META[adapter.status];
          return (
            <div key={adapter.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <Plug size={14} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{adapter.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{adapter.desc}</p>
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
                    <span key={a} className="font-mono text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {adapter.last_call && (
                <p className="text-[10px] text-gray-400 mb-3">
                  Last call: {new Date(adapter.last_call).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} UTC
                </p>
              )}

              {adapter.status !== "connected" && (
                <button className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-700">
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
