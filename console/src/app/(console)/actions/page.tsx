"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { id: "act-0192", entity: "acct-42", action: "apply_discount", param: "10%", status: "COMPLETED", rule: "churn_retention_v1", receipt: "rct-8821", time: "2026-03-04T14:32:07Z" },
  { id: "act-0191", entity: "cust-771", action: "issue_refund", param: "$49.00", status: "ESCALATED", rule: "vip_escalation_v1", receipt: null, time: "2026-03-04T14:28:11Z" },
  { id: "act-0190", entity: "acct-88", action: "apply_discount", param: "10%", status: "DENIED", rule: "churn_retention_v1", receipt: null, time: "2026-03-04T14:21:44Z" },
  { id: "act-0189", entity: "tenant-9", action: "provision_instance", param: "t3.large", status: "COMPLETED", rule: "auto_provision_v1", receipt: "rct-8823", time: "2026-03-04T14:18:03Z" },
  { id: "act-0188", entity: "cust-330", action: "flag_for_review", param: "", status: "ESCALATED", rule: "vip_escalation_v1", receipt: null, time: "2026-03-04T13:55:03Z" },
];

const FILTERS = ["All", "COMPLETED", "ESCALATED", "DENIED", "EXECUTING"];

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  ESCALATED: "bg-orange-50 text-orange-700 border-orange-200",
  DENIED: "bg-red-50 text-red-700 border-red-200",
  EXECUTING: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function ActionsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ACTIONS.filter((a) => {
    const matchFilter = filter === "All" || a.status === filter;
    const matchSearch =
      !search ||
      a.id.includes(search) ||
      a.entity.includes(search) ||
      a.action.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-gray-900">Actions</h1>
        <p className="text-xs text-gray-400 mt-0.5">{ACTIONS.length} total</p>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-[10px] uppercase tracking-widest text-gray-400">
              <th className="text-left px-5 py-3 font-semibold">Act ID</th>
              <th className="text-left px-5 py-3 font-semibold">Entity</th>
              <th className="text-left px-5 py-3 font-semibold">Action</th>
              <th className="text-left px-5 py-3 font-semibold">Param</th>
              <th className="text-left px-5 py-3 font-semibold">Status</th>
              <th className="text-left px-5 py-3 font-semibold">Rule</th>
              <th className="text-left px-5 py-3 font-semibold">Receipt</th>
              <th className="text-left px-5 py-3 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id} className={cn("border-b border-gray-100", i % 2 === 1 ? "bg-gray-50/30" : "bg-white")}>
                <td className="px-5 py-3 font-mono text-xs text-indigo-600">{row.id}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-700">{row.entity}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-600">{row.action}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{row.param || "—"}</td>
                <td className="px-5 py-3">
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", STATUS_STYLES[row.status])}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-[11px] text-gray-400">{row.rule}</td>
                <td className="px-5 py-3">
                  {row.receipt ? (
                    <span className="font-mono text-[11px] text-indigo-500">{row.receipt}</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-[11px] text-gray-400">
                  {new Date(row.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} UTC
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
