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
  COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  ESCALATED: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  DENIED: "bg-red-500/15 text-red-400 border-red-500/20",
  EXECUTING: "bg-sky-500/15 text-sky-400 border-sky-500/20",
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
        <h1 className="text-[20px] font-semibold text-white">Actions</h1>
        <p className="text-xs text-[#5a5a7a] mt-0.5">{ACTIONS.length} total</p>
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
                  ? "bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30"
                  : "bg-transparent border border-white/8 text-[#6a6a8a] hover:text-white hover:border-white/20"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a6a]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-white/8 bg-[#0a0a14] text-white placeholder:text-[#4a4a6a] focus:outline-none focus:ring-1 focus:ring-[#00ffc8]/40 w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d0d1a] rounded-xl border border-white/8 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0a0a14] border-b border-white/8">
            <tr className="text-[10px] uppercase tracking-widest text-[#5a5a7a]">
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
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-[#00ffc8]">{row.id}</td>
                <td className="px-5 py-3 font-mono text-xs text-[#c4c4d4]">{row.entity}</td>
                <td className="px-5 py-3 font-mono text-xs text-[#8a8a9a]">{row.action}</td>
                <td className="px-5 py-3 font-mono text-xs text-[#6a6a8a]">{row.param || "—"}</td>
                <td className="px-5 py-3">
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", STATUS_STYLES[row.status])}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-[11px] text-[#5a5a7a]">{row.rule}</td>
                <td className="px-5 py-3">
                  {row.receipt ? (
                    <span className="font-mono text-[11px] text-[#00ffc8]/70">{row.receipt}</span>
                  ) : (
                    <span className="text-[#3a3a5a] text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-[11px] text-[#5a5a7a]">
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
