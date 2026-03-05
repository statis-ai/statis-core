"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

const TERMINAL_LINES = [
    { text: "# 1. Agent proposes", type: "comment" },
    { text: 'POST /actions { action_id: "act-001", action_type: "apply_discount", target: "acct-42" }', type: "code" },
    { text: "→ 201 PROPOSED", type: "success" },
    { text: "", type: "spacer" },
    { text: "# 2. Policy evaluates", type: "comment" },
    { text: "POST /actions/act-001/evaluate", type: "code" },
    { text: "→ rule: churn_retention_v1", type: "info" },
    { text: "→ churn_risk=HIGH ✓  ltv=1200 ✓  no_discount ✓", type: "info" },
    { text: "→ APPROVED", type: "success" },
    { text: "", type: "spacer" },
    { text: "# 3. Execution — exactly once", type: "comment" },
    { text: "→ lock acquired: act-001", type: "info" },
    { text: "→ stripe.apply_discount(10%) called", type: "info" },
    { text: "→ charge_id: ch_mock_x9f2", type: "info" },
    { text: "→ COMPLETED", type: "success" },
    { text: "", type: "spacer" },
    { text: "# 4. Receipt written", type: "comment" },
    { text: '{ receipt_id: "rct-8821", rule_id: "churn_retention_v1",', type: "code" },
    { text: '  rule_version: "1.0", hash: "sha256:3f9a..." }', type: "code" },
    { text: "", type: "spacer" },
    { text: "# 5. Agent retries — blocked", type: "comment" },
    { text: 'POST /actions { action_id: "act-001" }', type: "code" },
    { text: "→ 409 receipt exists — BLOCKED", type: "blocked" },
    { text: "# Stripe never called again", type: "comment" },
];

const LINE_COLORS: Record<string, string> = {
    comment: "text-slate-500",
    code: "text-slate-300",
    success: "text-emerald-400",
    info: "text-sky-400",
    blocked: "text-rose-400",
    spacer: "",
};

const STATE_FIELDS = [
    { key: "churn_risk", value: "HIGH", accent: "text-rose-500" },
    { key: "ltv", value: "$1,200", accent: "text-emerald-600" },
    { key: "last_discount", value: "null", accent: "text-gray-400" },
    { key: "status", value: "active", accent: "text-sky-600" },
];

export function UseCasesSection() {
    return (
        <section className="relative py-32 bg-gray-50 overflow-hidden border-t border-gray-100" id="demo">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-sky-100/50 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/40 blur-[140px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto mb-20 text-center"
                >
                    <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600 flex items-center justify-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Demo Scenario
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-[3.5rem] font-serif mb-6 leading-[1.1] text-gradient">
                        Churn retention,
                        <br className="hidden sm:block" />
                        end to end.
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        Customer acct-42 is at risk. An agent reads shared state, decides to act, and proposes a discount. Here&rsquo;s what happens when Statis is in the loop.
                    </p>
                </motion.div>

                {/* Split layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Left: context panels */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="lg:col-span-2 flex flex-col gap-5"
                    >
                        {/* Entity state */}
                        <div className="flex-1 p-6 sm:p-7 rounded-2xl bg-white border border-gray-100 shadow-sm">
                            <p className="text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-gray-400 mb-4">Entity State</p>
                            <p className="font-mono text-sm text-indigo-600 font-bold mb-5">acct-42</p>
                            <div className="space-y-3">
                                {STATE_FIELDS.map((f) => (
                                    <div key={f.key} className="flex justify-between items-center">
                                        <span className="font-mono text-xs text-gray-400">{f.key}</span>
                                        <span className={`font-mono text-xs font-bold ${f.accent}`}>{f.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rule */}
                        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-violet-200 shadow-sm">
                            <p className="text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-gray-400 mb-4">Rule</p>
                            <p className="font-mono text-xs text-violet-600 font-bold mb-4">churn_retention_v1</p>
                            <div className="font-mono text-xs text-gray-500 space-y-1.5">
                                <p><span className="text-gray-400">IF </span>churn_risk = HIGH</p>
                                <p><span className="text-gray-400">AND </span>ltv &gt; 1000</p>
                                <p><span className="text-gray-400">AND </span>no_discount_in_30_days</p>
                                <p className="text-emerald-600 pt-1">→ ALLOW 10% discount</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: terminal — kept dark intentionally */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-3 rounded-2xl bg-[#080d19] border border-gray-200 overflow-hidden shadow-lg"
                    >
                        {/* Terminal bar */}
                        <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                            <span className="ml-3 text-[11px] font-mono text-slate-600">statis-demo</span>
                        </div>

                        {/* Terminal content */}
                        <div className="p-6 sm:p-7 font-mono text-xs leading-6 overflow-x-auto">
                            {TERMINAL_LINES.map((line, i) => (
                                <div key={i} className={line.type === "spacer" ? "h-3" : LINE_COLORS[line.type]}>
                                    {line.text}
                                </div>
                            ))}
                            <div className="mt-3 flex items-center gap-1">
                                <span className="text-emerald-500">$</span>
                                <span className="w-2 h-4 bg-slate-400/40 animate-pulse inline-block" />
                            </div>
                        </div>
                    </motion.div>

                </div>

            </div>
        </section>
    );
}
