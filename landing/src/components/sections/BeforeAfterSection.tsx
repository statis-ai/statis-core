"use client";

import { motion } from "framer-motion";
import { Layers } from "lucide-react";

const PRIMITIVES = [
    {
        id: "P1",
        label: "Action Contract",
        subtitle: "Propose Before Execute",
        body: "Every agent action must be declared as a typed schema — who, what, to whom, under what context — before anything happens. Proposals are intentional. No silent side effects.",
        detail: "PROPOSED → EVALUATING → APPROVED / DENIED / ESCALATED → EXECUTING → COMPLETED / FAILED",
        detailMono: true,
        accent: "text-indigo-600",
        border: "border-indigo-200",
        bg: "bg-indigo-50",
        glow: "group-hover:shadow-[0_4px_20px_rgba(99,102,241,0.12)]",
    },
    {
        id: "P2",
        label: "Policy Engine",
        subtitle: "Deterministic Rules",
        body: "Pure function. Zero ML. evaluate(action, entity_state, event_history) → PolicyDecision. Rules are versioned. Receipts record exactly which rule version approved each action.",
        detail: `churn_retention_v1\nIF churn_risk = HIGH\nAND ltv > 1000\nAND no_discount_in_30_days\n→ APPROVED`,
        detailMono: true,
        accent: "text-violet-600",
        border: "border-violet-200",
        bg: "bg-violet-50",
        glow: "group-hover:shadow-[0_4px_20px_rgba(139,92,246,0.12)]",
    },
    {
        id: "P3",
        label: "Execution Guarantee",
        subtitle: "Exactly Once. No Exceptions.",
        body: "Distributed locking ensures no duplicate API calls. Ever. Separate execution worker from delivery worker. If an action already has a receipt — it's blocked, regardless of how many times the agent retries.",
        detail: null,
        detailMono: false,
        accent: "text-emerald-600",
        border: "border-emerald-200",
        bg: "bg-emerald-50",
        glow: "group-hover:shadow-[0_4px_20px_rgba(52,211,153,0.12)]",
    },
    {
        id: "P4",
        label: "Ledger",
        subtitle: "Proof, Not Just Logs",
        body: "Append-only audit log with SHA-256 tamper-evident receipts. Every action. Every decision. Every rule version. The difference between logs (you reconstruct) and receipts (you prove).",
        detail: null,
        detailMono: false,
        accent: "text-amber-600",
        border: "border-amber-200",
        bg: "bg-amber-50",
        glow: "group-hover:shadow-[0_4px_20px_rgba(251,191,36,0.12)]",
    },
];

export function BeforeAfterSection() {
    return (
        <section className="relative py-32 bg-gray-50 overflow-hidden border-t border-gray-100">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/50 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-100/40 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8" id="primitives">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto mb-20 text-center"
                >
                    <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 flex items-center justify-center gap-2">
                        <Layers className="w-4 h-4" />
                        Core Primitives
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-[3.5rem] font-serif mb-6 leading-[1.1] text-gradient">
                        Four primitives.
                        <br className="hidden sm:block" />
                        One complete layer.
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        Each primitive is independently useful. Together, they form the complete execution infrastructure for autonomous agents operating on production systems.
                    </p>
                </motion.div>

                {/* 2×2 grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PRIMITIVES.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className={`group flex flex-col p-8 sm:p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-sm ${p.glow}`}
                        >
                            {/* Label row */}
                            <div className="flex items-center gap-3 mb-5">
                                <span className={`text-[11px] font-mono font-bold tracking-[0.2em] uppercase ${p.accent}`}>
                                    {p.id}
                                </span>
                                <span className="text-gray-300 text-xs">—</span>
                                <span className="text-gray-900 font-bold text-lg">{p.label}</span>
                            </div>

                            <p className={`text-sm font-semibold uppercase tracking-[0.15em] mb-4 ${p.accent}`}>
                                {p.subtitle}
                            </p>

                            <p className="text-gray-600 text-[15px] leading-relaxed mb-6 flex-1">
                                {p.body}
                            </p>

                            {p.detail && (
                                <div className={`font-mono text-xs leading-relaxed p-4 rounded-xl border ${p.border} ${p.bg} whitespace-pre ${p.accent}`}>
                                    {p.detail}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
