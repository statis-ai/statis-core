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
      className={`bg-white rounded-xl border p-6 ${
        esc.status === "approved"
          ? "border-green-200"
          : esc.status === "denied"
          ? "border-gray-200 opacity-60"
          : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-semibold text-gray-900">{esc.entity}</span>
            <span className="text-gray-300">·</span>
            <span className="font-mono text-sm text-gray-600">{esc.action}</span>
            <span className="font-mono text-sm font-semibold text-indigo-600">{esc.param}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="font-mono">{esc.action_id}</span>
            <span className="text-gray-200">·</span>
            <span className="font-mono">{esc.rule}</span>
            <span className="text-gray-200">·</span>
            <span>{new Date(esc.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} UTC</span>
          </div>
        </div>

        {esc.status === "pending" ? (
          <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
            <AlertTriangle size={10} />
            Pending review
          </span>
        ) : esc.status === "approved" ? (
          <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 size={10} />
            Approved
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
            <XCircle size={10} />
            Denied
          </span>
        )}
      </div>

      {/* Reason */}
      <div className="bg-violet-50 border border-violet-100 rounded-lg px-4 py-3 mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 mb-1">Escalation reason</p>
        <p className="text-xs text-violet-800 leading-relaxed">{esc.reason}</p>
      </div>

      {/* Approved receipt */}
      {esc.status === "approved" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 font-mono text-xs"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-green-500 mb-1">Override receipt</p>
          <div className="grid grid-cols-2 gap-1 text-green-800">
            <span>reviewer_id:</span><span>{esc.reviewer_id}</span>
            <span>decision:</span><span>APPROVED</span>
            <span>action_id:</span><span>{esc.action_id}</span>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      {esc.status === "pending" && (
        <div className="flex items-center gap-3">
          <button
            onClick={onApprove}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <CheckCircle2 size={14} />
            Approve
          </button>
          <button
            onClick={onDeny}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
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
          <h1 className="text-[20px] font-semibold text-gray-900">Escalations</h1>
          {pending > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {pending}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">{pending} awaiting review · {escalations.length} total</p>
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
        <div className="mt-8 text-center py-12 text-gray-400 text-sm">
          All escalations resolved.
        </div>
      )}
    </div>
  );
}
