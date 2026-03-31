"use client";

import { motion } from "framer-motion";

const PRIMITIVES = [
    {
        id: "P1",
        label: "Action Contract",
        subtitle: "Propose before execute",
        body: "Every agent action is declared as a typed proposal before anything touches production. No silent side effects.",
        code: `# Agent proposes — nothing executes yet
client.propose(
  action_type="apply_discount",
  target="acct-8821",
  params={"pct": 10},
  context={"churn_risk": "HIGH"}
)
# → PROPOSED  act-f93a`,
        lang: "python",
        accent: "text-[#00ffc8]",
        border: "border-[#00ffc8]/18",
        bg: "bg-[#00ffc8]/4",
        codeBorder: "border-[#00ffc8]/12",
        glow: "hover:shadow-[0_8px_40px_rgba(0,255,200,0.08)]",
        span: "md:col-span-2",
    },
    {
        id: "P2",
        label: "Policy Engine",
        subtitle: "Deterministic. No ML. Versioned.",
        body: "Pure function. evaluate(action, state, history) → decision. Every rule version is recorded in the receipt.",
        code: `churn_retention_v1:
  IF churn_risk = HIGH
  AND ltv > 1000
  AND no_discount_in_30_days
  → APPROVED`,
        lang: "yaml",
        accent: "text-violet-400",
        border: "border-violet-500/18",
        bg: "bg-violet-500/4",
        codeBorder: "border-violet-500/12",
        glow: "hover:shadow-[0_8px_40px_rgba(139,92,246,0.08)]",
        span: "md:col-span-1",
    },
    {
        id: "P3",
        label: "Execution Guarantee",
        subtitle: "Exactly once. Always.",
        body: "Distributed lock on the action ID. If the agent retries — receipt found — the adapter is never called again.",
        code: `→ lock: act-f93a acquired
→ stripe.apply_discount(10%)
→ COMPLETED

# agent retries 4s later:
→ 409 receipt exists — BLOCKED
# Stripe never charged twice`,
        lang: "terminal",
        accent: "text-emerald-400",
        border: "border-emerald-500/18",
        bg: "bg-emerald-500/4",
        codeBorder: "border-emerald-500/12",
        glow: "hover:shadow-[0_8px_40px_rgba(52,211,153,0.08)]",
        span: "md:col-span-1",
    },
    {
        id: "P4",
        label: "Ledger",
        subtitle: "Proof, not logs.",
        body: "SHA-256 tamper-evident receipt written atomically at execution. Rule version, approver, timestamp, result. Immutable.",
        code: `{
  "receipt_id": "rct-8821",
  "rule_id": "churn_retention_v1",
  "rule_version": "1.0",
  "approved_by": "policy_engine",
  "executed_at": "2026-03-24T…",
  "hash": "sha256:3f9a8b2c…"
}`,
        lang: "json",
        accent: "text-amber-400",
        border: "border-amber-500/18",
        bg: "bg-amber-500/4",
        codeBorder: "border-amber-500/12",
        glow: "hover:shadow-[0_8px_40px_rgba(251,191,36,0.08)]",
        span: "md:col-span-2",
    },
];

export function BeforeAfterSection() {
    return (
        <section className="relative py-32 bg-[#080810] overflow-hidden section-divider" id="primitives">
            <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-[#00ffc8]/4 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[500px] bg-violet-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl mx-auto mb-16 text-center"
                >
                    <p className="mb-4 text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#00ffc8]">
                        Core Primitives
                    </p>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
                        Four primitives.
                        <br />
                        <span className="text-gradient">One complete layer.</span>
                    </h2>
                    <p className="text-[#7a7a8a] text-lg leading-relaxed">
                        Each primitive is independently useful. Together they form the execution infrastructure that makes agents production-safe.
                    </p>
                </motion.div>

                {/* Bento grid — P1 wide, P2+P3 narrow, P4 wide */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PRIMITIVES.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className={`group flex flex-col rounded-3xl border ${p.border} ${p.bg} p-7 transition-all duration-300 ${p.glow} cursor-default ${p.span}`}
                        >
                            {/* Header row */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`font-mono text-[10px] font-bold tracking-[0.2em] ${p.accent}`}>{p.id}</span>
                                <span className="text-white/15 text-xs">—</span>
                                <span className="text-white font-bold">{p.label}</span>
                            </div>

                            <p className={`text-[10px] font-mono font-semibold uppercase tracking-[0.15em] mb-3 ${p.accent}`}>
                                {p.subtitle}
                            </p>

                            <p className="text-[#7a7a8a] text-sm leading-relaxed mb-5">
                                {p.body}
                            </p>

                            {/* Code block */}
                            <div className={`mt-auto rounded-xl border ${p.codeBorder} bg-[#06070e] overflow-hidden flex-1`}>
                                <div className="flex items-center px-3 py-1.5 border-b border-white/6 bg-white/[0.02] rounded-t-xl">
                                    <span className="text-[10px] font-mono text-[#3a3a4a]">{p.lang}</span>
                                </div>
                                <div className={`font-mono text-[11px] leading-[1.85] p-4 whitespace-pre overflow-x-auto ${p.accent}`}>
                                    {p.code}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
