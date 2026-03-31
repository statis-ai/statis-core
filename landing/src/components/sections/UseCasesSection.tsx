"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { AnimatedTerminal, TerminalLine } from "@/components/ui/AnimatedTerminal";

const TERMINAL_LINES: TerminalLine[] = [
    { type: "comment", text: "# 1. Agent proposes discount" },
    { type: "prompt",  text: 'POST /actions { action_type: "apply_discount", target: "acct-42" }' },
    { type: "info",    text: "→ 201 PROPOSED  act-001" },
    { type: "spacer",  text: "" },
    { type: "comment", text: "# 2. Policy evaluates against entity state" },
    { type: "prompt",  text: "POST /actions/act-001/evaluate" },
    { type: "info",    text: "→ rule: churn_retention_v1  churn_risk=HIGH ✓  ltv=1200 ✓" },
    { type: "success", text: "→ APPROVED" },
    { type: "spacer",  text: "" },
    { type: "comment", text: "# 3. Execution — exactly once" },
    { type: "info",    text: "→ lock acquired: act-001" },
    { type: "info",    text: "→ stripe.apply_discount(10%) called" },
    { type: "success", text: "→ COMPLETED  charge_id: ch_mock_x9f2" },
    { type: "spacer",  text: "" },
    { type: "comment", text: "# 4. Tamper-evident receipt written" },
    { type: "info",    text: '→ receipt_id: "rct-8821"  rule: churn_retention_v1@1.0' },
    { type: "info",    text: '→ hash: sha256:3f9a8b2c...' },
    { type: "spacer",  text: "" },
    { type: "comment", text: "# 5. Agent retries — blocked" },
    { type: "prompt",  text: 'POST /actions { action_id: "act-001" }' },
    { type: "blocked", text: "→ 409  receipt exists — BLOCKED" },
];

const STATE_FIELDS = [
    { key: "churn_risk", value: "HIGH", accent: "text-[#7a756e]" },
    { key: "ltv", value: "$1,200", accent: "text-[#7a756e]" },
    { key: "last_discount", value: "null", accent: "text-[#6a6a7a]" },
    { key: "status", value: "active", accent: "text-[#7a756e]" },
];

export function UseCasesSection() {
    return (
        <section className="relative py-32 overflow-hidden section-divider" id="demo">
            {/* Ambient glows */}

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto mb-20 text-center"
                >
                    <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#7a756e] flex items-center justify-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Demo Scenario
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.5rem] mb-6 leading-[1.1] text-[#e8e5de]">
                        From proposal to receipt.
                        <br className="hidden sm:block" />
                        <span className="text-gradient">Every stage, visible.</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-[#8a8a9a] leading-relaxed max-w-2xl mx-auto">
                        An at-risk customer. A retention agent. A policy. Here&rsquo;s what happens when Statis is in the execution path — and what happens when the agent retries.
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
                        <div className="flex-1 p-6 sm:p-7 rounded-2xl glass-card">
                            <p className="text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-[#5a5a6a] mb-4">Entity State</p>
                            <div className="flex items-center gap-2 mb-5">
                                <p className="font-mono text-sm text-[#00ffc8] font-bold">acct-42</p>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] animate-pulse" />
                                    <span className="text-[9px] font-mono text-[#00ffc8]/50">observing</span>
                                </span>
                            </div>
                            <div className="space-y-3">
                                {STATE_FIELDS.map((f) => (
                                    <div key={f.key} className="flex justify-between items-center">
                                        <span className="font-mono text-xs text-[#6a6a7a]">{f.key}</span>
                                        <span className={`font-mono text-xs font-bold ${f.accent}`}>{f.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rule */}
                        <div className="p-6 sm:p-7 rounded-2xl glass-card border-violet-500/20">
                            <p className="text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-[#5a5a6a] mb-4">Rule</p>
                            <p className="font-mono text-xs text-[#7a756e] font-bold mb-4">churn_retention_v1</p>
                            <div className="font-mono text-xs text-[#6a6a7a] space-y-1.5">
                                <p><span className="text-[#4a4a5a]">IF </span>churn_risk = HIGH</p>
                                <p><span className="text-[#4a4a5a]">AND </span>ltv &gt; 1000</p>
                                <p><span className="text-[#4a4a5a]">AND </span>no_discount_in_30_days</p>
                                <p className="text-[#00ffc8] pt-1">→ ALLOW 10% discount</p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="p-5 rounded-2xl border border-[#7a756e]/20 bg-[#7a756e]/4"
                        >
                            <p className="text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-[#5a5a6a] mb-3">Receipt Written</p>
                            <div className="space-y-1.5 font-mono text-[11px]">
                                <div className="flex justify-between"><span className="text-[#4a4a6a]">receipt_id</span><span className="text-[#7a756e]">rct-8821</span></div>
                                <div className="flex justify-between"><span className="text-[#4a4a6a]">rule</span><span className="text-[#7a756e]">churn_retention_v1@1.0</span></div>
                                <div className="flex justify-between gap-4"><span className="text-[#4a4a6a]">hash</span><span className="text-[#7a756e] truncate">sha256:3f9a8b2c…</span></div>
                                <div className="flex justify-between"><span className="text-[#4a4a6a]">status</span><span className="text-[#00ffc8] font-bold">IMMUTABLE</span></div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right: animated terminal */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <AnimatedTerminal
                            lines={TERMINAL_LINES}
                            title="statis-demo — churn retention"
                        />
                    </motion.div>

                </div>

            </div>
        </section>
    );
}
