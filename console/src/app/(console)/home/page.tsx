"use client";

import { Zap, FileText, AlertTriangle, CheckCircle2, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const METRICS = [
  {
    label: "Actions Today",
    value: "148",
    delta: "+12 vs yesterday",
    deltaColor: "text-green-600",
    icon: Zap,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
  },
  {
    label: "Execution Rate",
    value: "99.3%",
    delta: "of committed actions",
    deltaColor: "text-gray-400",
    icon: CheckCircle2,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
  {
    label: "Escalations",
    value: "2",
    delta: "2 awaiting review",
    deltaColor: "text-orange-500",
    icon: AlertTriangle,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-400",
  },
  {
    label: "Receipts Minted",
    value: "1,204",
    delta: "all time",
    deltaColor: "text-gray-400",
    icon: FileText,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
  },
];

const RECENT_ACTIONS = [
  { id: "act-0192", entity: "acct-42", action: "apply_discount", status: "COMPLETED", rule: "churn_retention_v1", time: "14:32 UTC" },
  { id: "act-0191", entity: "cust-771", action: "issue_refund", status: "ESCALATED", rule: "vip_escalation_v1", time: "14:28 UTC" },
  { id: "act-0190", entity: "acct-88", action: "apply_discount", status: "DENIED", rule: "churn_retention_v1", time: "14:21 UTC" },
  { id: "act-0189", entity: "tenant-9", action: "provision_instance", status: "COMPLETED", rule: "auto_provision_v1", time: "14:18 UTC" },
  { id: "act-0188", entity: "cust-330", action: "flag_for_review", status: "ESCALATED", rule: "vip_escalation_v1", time: "13:55 UTC" },
];

const STATUS_STYLES: Record<string, { pill: string }> = {
  COMPLETED: { pill: "bg-green-50 text-green-700 border-green-200" },
  ESCALATED: { pill: "bg-orange-50 text-orange-700 border-orange-200" },
  DENIED: { pill: "bg-red-50 text-red-700 border-red-200" },
  EXECUTING: { pill: "bg-blue-50 text-blue-700 border-blue-200" },
};

const SYSTEM_HEALTH = [
  "Policy Engine",
  "Execution Worker",
  "Broadcast Layer",
  "Stripe Adapter",
  "Webhook Delivery",
];

export default function HomePage() {
  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900">Home</h1>
          <p className="text-xs text-gray-400 mt-0.5">Last updated 30 seconds ago</p>
        </div>
        <Link
          href="/demo"
          className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:text-indigo-700"
        >
          View demo <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {m.label}
                </p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.iconBg}`}>
                  <Icon size={14} className={m.iconColor} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{m.value}</p>
              <p className={`text-xs mt-1 ${m.deltaColor}`}>{m.delta}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom row */}
      <div className="flex gap-5">
        {/* Recent Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex-[3]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Recent Actions
            </p>
            <Link href="/actions" className="text-xs text-indigo-500 hover:text-indigo-700">
              View all →
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-400">
                <th className="text-left pb-3 font-semibold">Act ID</th>
                <th className="text-left pb-3 font-semibold">Entity</th>
                <th className="text-left pb-3 font-semibold">Action</th>
                <th className="text-left pb-3 font-semibold">Status</th>
                <th className="text-left pb-3 font-semibold">Rule</th>
                <th className="text-left pb-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ACTIONS.map((row) => {
                const s = STATUS_STYLES[row.status] ?? STATUS_STYLES.COMPLETED;
                return (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="py-2.5 pr-4">
                      <span className="font-mono text-xs text-indigo-600">{row.id}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-gray-700">{row.entity}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">{row.action}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.pill}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="font-mono text-[11px] text-gray-400">{row.rule}</span>
                    </td>
                    <td className="py-2.5 text-xs text-gray-400">{row.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex-[1.5]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
            System Health
          </p>
          <div className="flex flex-col gap-3">
            {SYSTEM_HEALTH.map((service) => (
              <div key={service} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  <span className="text-sm text-gray-700">{service}</span>
                </div>
                <span className="text-[11px] font-medium text-green-600">Operational</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
