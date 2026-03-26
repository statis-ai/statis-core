"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface Escalation {
  id: string;
  entity: string;
  action: string;
  param: string;
  action_id: string;
  rule: string;
  timestamp: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  reviewer_id?: string;
}

const INITIAL_ESCALATIONS: Escalation[] = [
  {
    id: "esc-001",
    entity: "acct-77",
    action: "apply_discount",
    param: "25%",
    action_id: "act-0191",
    rule: "vip_escalation_v1",
    timestamp: "2026-03-04T14:28:11Z",
    reason: "Discount threshold exceeded: 25% > max_auto_discount(15%). Customer LTV $6,200 qualifies for VIP review. Manual override required.",
    status: "pending",
  },
  {
    id: "esc-002",
    entity: "cust-330",
    action: "issue_refund",
    param: "$340.00",
    action_id: "act-0188",
    rule: "refund_eligibility_v1",
    timestamp: "2026-03-04T13:55:03Z",
    reason: "Refund amount $340 exceeds auto-approve limit ($200). Last refund was 8 days ago — within cooldown window. Escalated for manual review.",
    status: "pending",
  },
];

function EscalationCard({
  esc,
  onApprove,
  onDeny,
}: {
  esc: Escalation;
  onApprove: () => void;
  onDeny: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className={`bg-[#0d0d1a] rounded-xl border p-6 transition-colors ${
        esc.status === "approved"
          ? "border-emerald-500/25"
          : esc.status === "denied"
          ? "border-white/5 opacity-50"
          : "border-white/8"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-semibold text-white">{esc.entity}</span>
            <span className="text-[#3a3a5a]">·</span>
            <span className="font-mono text-sm text-[#8a8a9a]">{esc.action}</span>
            <span className="font-mono text-sm font-semibold text-[#00ffc8]">{esc.param}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#4a4a6a]">
            <span className="font-mono">{esc.action_id}</span>
            <span className="text-[#2a2a4a]">·</span>
            <span className="font-mono">{esc.rule}</span>
            <span className="text-[#2a2a4a]">·</span>
            <span>{new Date(esc.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} UTC</span>
          </div>
        </div>

        {esc.status === "pending" ? (
          <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
            <AlertTriangle size={10} />
            Pending review
          </span>
        ) : esc.status === "approved" ? (
          <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={10} />
            Approved
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-[#5a5a7a] border border-white/8">
            <XCircle size={10} />
            Denied
          </span>
        )}
      </div>

      {/* Reason */}
      <div className="bg-orange-500/8 border border-orange-500/15 rounded-lg px-4 py-3 mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-400 mb-1">Escalation reason</p>
        <p className="text-xs text-[#c4c4d4] leading-relaxed">{esc.reason}</p>
      </div>

      {/* Approved receipt */}
      {esc.status === "approved" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-4 py-3 mb-4 font-mono text-xs"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 mb-1">Override receipt</p>
          <div className="grid grid-cols-2 gap-1 text-[#8a8a9a]">
            <span>reviewer_id:</span><span className="text-emerald-400">{esc.reviewer_id}</span>
            <span>decision:</span><span className="text-emerald-400">APPROVED</span>
            <span>action_id:</span><span className="text-emerald-400">{esc.action_id}</span>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      {esc.status === "pending" && (
        <div className="flex items-center gap-3">
          <button
            onClick={onApprove}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 border border-emerald-500/20 transition-colors"
          >
            <CheckCircle2 size={14} />
            Approve
          </button>
          <button
            onClick={onDeny}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/8 text-[#6a6a8a] text-sm font-medium hover:text-white hover:border-white/20 transition-colors"
          >
            <XCircle size={14} />
            Deny
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>(INITIAL_ESCALATIONS);

  function approve(id: string) {
    setEscalations((escs) =>
      escs.map((e) =>
        e.id === id
          ? { ...e, status: "approved", reviewer_id: "reviewer-aniket" }
          : e
      )
    );
  }

  function deny(id: string) {
    setEscalations((escs) =>
      escs.map((e) => (e.id === id ? { ...e, status: "denied" } : e))
    );
  }

  const pending = escalations.filter((e) => e.status === "pending").length;

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[20px] font-semibold text-white">Escalations</h1>
          {pending > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20">
              {pending}
            </span>
          )}
        </div>
        <p className="text-xs text-[#5a5a7a]">{pending} awaiting review · {escalations.length} total</p>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="flex flex-col gap-4">
          {escalations.map((esc) => (
            <EscalationCard
              key={esc.id}
              esc={esc}
              onApprove={() => approve(esc.id)}
              onDeny={() => deny(esc.id)}
            />
          ))}
        </div>
      </AnimatePresence>

      {escalations.every((e) => e.status !== "pending") && (
        <div className="mt-8 text-center py-12 text-[#3a3a5a] text-sm">
          All escalations resolved.
        </div>
      )}
    </div>
  );
}
