"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";

const SCENARIOS = [
  {
    id: "fintech",
    name: "Churn retention",
    entity: { id: "acct-42", type: "customer", churn_risk: "HIGH", ltv: "$1,200", plan: "growth", last_discount: "2026-02-18" },
    rule: {
      name: "churn_retention_v1",
      version: "v1.0",
      action: "apply_discount",
      conditions: [
        { field: "churn_risk", op: "=", value: '"HIGH"' },
        { field: "ltv", op: ">", value: "$500" },
        { field: "plan", op: "!=", value: '"free"' },
      ],
      result: "APPROVED",
    },
    steps: [
      "Agent submits apply_discount for acct-42",
      "State read: churn_risk=HIGH, ltv=$1,200",
      "Evaluating churn_retention_v1 conditions",
      "Policy decision: APPROVED",
      "Stripe adapter: discount applied",
      "Receipt minted: rct-8821",
    ],
    logs: [
      "[14:32:07] action.received  act-0192  acct-42  apply_discount(10%)",
      "[14:32:07] state.read       acct-42   churn_risk=HIGH  ltv=$1,200  plan=growth",
      "[14:32:07] policy.eval      churn_retention_v1 v1.0  ->  APPROVED",
      "[14:32:08] adapter.exec     stripe  apply_coupon  PROMO10",
      "[14:32:08] adapter.ok       stripe  customer.discount.applied",
      "[14:32:08] receipt.minted   rct-8821  hash=3f8a9d2c...  idempotency=act-0192",
    ],
    receipt: {
      id: "rct-8821",
      action_id: "act-0192",
      entity_id: "acct-42",
      rule: "churn_retention_v1 v1.0",
      decision: "APPROVED",
      executed_at: "2026-03-04T14:32:08Z",
      hash: "3f8a9d2c1a8b4e7f",
    },
  },
  {
    id: "saas",
    name: "Refund gating",
    entity: { id: "cust-771", type: "customer", standing: "good", last_refund: "null", txn_age: "12d", plan: "pro" },
    rule: {
      name: "refund_eligibility_v1",
      version: "v1.0",
      action: "issue_refund",
      conditions: [
        { field: "standing", op: "=", value: '"good"' },
        { field: "txn_age", op: "<", value: "30d" },
        { field: "last_refund", op: "=", value: "null" },
      ],
      result: "APPROVED",
    },
    steps: [
      "Agent submits issue_refund for cust-771",
      "State read: standing=good, txn_age=12d",
      "Evaluating refund_eligibility_v1 conditions",
      "Policy decision: APPROVED",
      "Stripe adapter: refund issued",
      "Receipt minted: rct-8822",
    ],
    logs: [
      "[14:28:11] action.received  act-0191  cust-771  issue_refund($49.00)",
      "[14:28:11] state.read       cust-771  standing=good  last_refund=null  txn_age=12d",
      "[14:28:11] policy.eval      refund_eligibility_v1 v1.0  ->  APPROVED",
      "[14:28:12] adapter.exec     stripe  refunds.create  ch_xxxx",
      "[14:28:12] adapter.ok       stripe  refund.succeeded  re_xxxx",
      "[14:28:12] receipt.minted   rct-8822  hash=a1b2c3d4...  idempotency=act-0191",
    ],
    receipt: {
      id: "rct-8822",
      action_id: "act-0191",
      entity_id: "cust-771",
      rule: "refund_eligibility_v1 v1.0",
      decision: "APPROVED",
      executed_at: "2026-03-04T14:28:12Z",
      hash: "a1b2c3d4e5f67890",
    },
  },
  {
    id: "ops",
    name: "Auto-provision",
    entity: { id: "tenant-org-9", type: "tenant", tier: "enterprise", instances: "3", quota: "10", region: "us-east-1" },
    rule: {
      name: "auto_provision_v1",
      version: "v1.0",
      action: "provision_instance",
      conditions: [
        { field: "tier", op: "=", value: '"enterprise"' },
        { field: "instances", op: "<", value: "quota" },
      ],
      result: "APPROVED",
    },
    steps: [
      "Agent submits provision_instance for tenant-org-9",
      "State read: tier=enterprise, instances=3, quota=10",
      "Evaluating auto_provision_v1 conditions",
      "Policy decision: APPROVED",
      "AWS adapter: instance launched",
      "Receipt minted: rct-8823",
    ],
    logs: [
      "[14:18:03] action.received  act-0189  tenant-org-9  provision_instance(t3.large)",
      "[14:18:03] state.read       tenant-org-9  tier=enterprise  instances=3  quota=10",
      "[14:18:03] policy.eval      auto_provision_v1 v1.0  ->  APPROVED",
      "[14:18:04] adapter.exec     aws  ec2.run_instances  t3.large  us-east-1",
      "[14:18:06] adapter.ok       aws  instance.launched  i-0abc123def",
      "[14:18:06] receipt.minted   rct-8823  hash=7f3e1c9a...  idempotency=act-0189",
    ],
    receipt: {
      id: "rct-8823",
      action_id: "act-0189",
      entity_id: "tenant-org-9",
      rule: "auto_provision_v1 v1.0",
      decision: "APPROVED",
      executed_at: "2026-03-04T14:18:06Z",
      hash: "7f3e1c9a2b4d5e6f",
    },
  },
];

type Scenario = typeof SCENARIOS[0];

function EntityCard({ entity }: { entity: Scenario["entity"] }) {
  return (
    <div className="bg-[#111111] rounded border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] mb-4">Entity State</p>
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-sm font-semibold text-white">{entity.id}</span>
        <span className="text-[10px] text-[#444444] bg-white/5 px-2 py-0.5 rounded">{entity.type}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {Object.entries(entity)
          .filter(([k]) => k !== "id" && k !== "type")
          .map(([k, v]) => (
            <div key={k}>
              <dt className="text-[10px] text-[#444444] uppercase tracking-wider">{k.replace(/_/g, " ")}</dt>
              <dd className="font-mono text-xs text-[#d4d4d4] mt-0.5">{v}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

function RuleCard({ rule }: { rule: Scenario["rule"] }) {
  return (
    <div className="bg-[#111111] rounded border border-[#1a1a1a] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] mb-4">Rule</p>
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-sm font-semibold text-white">{rule.name}</span>
        <span className="text-[10px] font-mono text-[#d4d4d4] bg-white/[0.06] px-1.5 py-0.5 rounded">{rule.version}</span>
      </div>
      <div className="space-y-1 font-mono text-xs">
        {rule.conditions.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[#444444] w-6 text-right shrink-0">{i === 0 ? "IF" : "AND"}</span>
            <span className="text-[#888888]">{c.field}</span>
            <span className="text-[#d4d4d4]">{c.op}</span>
            <span className="text-[#d4d4d4]">{c.value}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-[#1a1a1a] mt-2">
          <span className="text-[#444444] w-6 text-right shrink-0">→</span>
          <span className="text-emerald-400 font-semibold">{rule.result}</span>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [activeId, setActiveId] = useState("fintech");
  const [step, setStep] = useState(0);
  const [retried, setRetried] = useState(false);
  const scenario = SCENARIOS.find((s) => s.id === activeId)!;

  function reset(id: string) {
    setActiveId(id);
    setStep(0);
    setRetried(false);
  }

  function advance() {
    if (step < scenario.steps.length) {
      setStep((s) => s + 1);
    }
  }

  const done = step >= scenario.steps.length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="bg-[#111111] border-b border-[#1a1a1a] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-[14px] tracking-tight text-white">
            statis
            <span className="inline-block ml-[1px] animate-pulse" style={{ width: "6px", height: "12px", background: "#ffffff" }} />
          </span>
          <span className="text-[#444444] text-sm ml-2">Interactive demo</span>
        </div>
        <Link
          href="/home"
          className="flex items-center gap-2 text-sm text-[#d4d4d4] font-medium hover:text-white"
        >
          Open console <ArrowRight size={14} />
        </Link>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto">
        {/* Scenario picker */}
        <div className="flex gap-3 mb-6">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => reset(s.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded border text-sm font-medium transition-all ${
                activeId === s.id
                  ? "bg-white/[0.08] border-white/[0.15] text-[#d4d4d4]"
                  : "bg-[#111111] border-[#1a1a1a] text-[#888888] hover:border-white/15"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[340px_1fr] gap-5">
          {/* Left — entity + rule */}
          <div className="flex flex-col gap-4">
            <EntityCard entity={scenario.entity} />
            <RuleCard rule={scenario.rule} />
          </div>

          {/* Right — stepper + terminal + receipt */}
          <div className="flex flex-col gap-4">
            {/* Stepper */}
            <div className="bg-[#111111] rounded border border-[#1a1a1a] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444] mb-4">
                Execution — {step}/{scenario.steps.length} steps
              </p>
              <ol className="flex flex-col gap-2.5 mb-5">
                {scenario.steps.map((s, i) => {
                  const isDone = i < step;
                  const active = i === step;
                  return (
                    <li key={i} className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        isDone ? "bg-emerald-500" : active ? "bg-white/[0.06] border border-[#d4d4d4]/50" : "bg-white/5"
                      }`}>
                        {isDone ? <CheckCircle2 size={12} className="text-white" /> : (
                          <span className={active ? "text-[#d4d4d4]" : "text-[#444444]"}>{i + 1}</span>
                        )}
                      </span>
                      <span className={`text-xs ${isDone ? "text-emerald-400" : active ? "text-white font-medium" : "text-[#444444]"}`}>
                        {s}
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className="flex items-center gap-3">
                {!done ? (
                  <button
                    onClick={advance}
                    className="px-4 py-2 rounded bg-[#d4d4d4] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors"
                  >
                    Run next step
                  </button>
                ) : !retried ? (
                  <button
                    onClick={() => setRetried(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded border border-[#1a1a1a] text-[#888888] text-sm font-medium hover:bg-white/[0.03] transition-colors"
                  >
                    <RotateCcw size={13} />
                    Try retry
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/30">
                    <span className="text-xs font-mono text-amber-400">409 · receipt found</span>
                  </div>
                )}
                <button
                  onClick={() => reset(activeId)}
                  className="text-xs text-[#444444] hover:text-[#888888] transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Terminal */}
            <div className="bg-[#0a0a0a] rounded overflow-hidden border border-[#1a1a1a]">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#1a1a1a]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#1f1f1f]" />
                <span className="ml-2 text-[11px] text-[#444444] font-mono">execution log</span>
              </div>
              <div className="p-4 font-mono text-[12px] space-y-1.5 min-h-[160px]">
                <AnimatePresence>
                  {scenario.logs.slice(0, step).map((line, i) => (
                    <motion.div
                      key={`${activeId}-${i}`}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[#888888]"
                    >
                      {line}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {retried && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-amber-400"
                  >
                    [retry] receipt found: {scenario.receipt.id} — adapter skipped (idempotent)
                  </motion.div>
                )}
              </div>
            </div>

            {/* Receipt card */}
            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-[#111111] rounded border border-emerald-500/20 p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#444444]">Receipt</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      APPROVED
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      ["Receipt ID", scenario.receipt.id],
                      ["Action ID", scenario.receipt.action_id],
                      ["Entity", scenario.receipt.entity_id],
                      ["Rule", scenario.receipt.rule],
                      ["Executed at", scenario.receipt.executed_at],
                      ["Hash", scenario.receipt.hash],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[10px] text-[#444444] uppercase tracking-wider">{k}</dt>
                        <dd className="font-mono text-xs text-[#d4d4d4] mt-0.5 truncate">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
