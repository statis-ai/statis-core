"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedTerminal, TerminalLine } from "@/components/ui/AnimatedTerminal";

const STEPS: {
    num: string;
    tag: string;
    label: string;
    body: string;
    lines: TerminalLine[];
    accent: string;
    border: string;
    bg: string;
    dot: string;
    connector: string | null;
}[] = [
    {
        num: "01",
        tag: "State Layer",
        label: "One authoritative state pushed to every agent.",
        body: "Events are ingested. Statis materialises a single deterministic state snapshot — no stale caches, no fragmented reality.",
        lines: [
            { type: "prompt",  text: "GET /state/acct-8821" },
            { type: "info",    text: "→ 200 OK" },
            { type: "code",    text: "{" },
            { type: "code",    text: '  "churn_risk": "HIGH",' },
            { type: "code",    text: '  "ltv": 1200,' },
            { type: "code",    text: '  "last_discount": null,' },
            { type: "code",    text: '  "materialized_at": "T+00:00"' },
            { type: "code",    text: "}" },
        ],
        accent: "text-[#00ffc8]",
        border: "border-[#00ffc8]/20",
        bg: "bg-[#00ffc8]/4",
        dot: "bg-[#00ffc8] shadow-[0_0_10px_rgba(0,255,200,0.7)]",
        connector: "from-[#00ffc8]/25",
    },
    {
        num: "02",
        tag: "Action Contract",
        label: "Agent proposes. Nothing executes yet.",
        body: "The agent reads shared state and proposes a typed Action Contract. Intent declared. Side effects blocked until policy approves.",
        lines: [
            { type: "prompt",  text: "POST /actions" },
            { type: "code",    text: "{" },
            { type: "code",    text: '  "action_type": "apply_discount",' },
            { type: "code",    text: '  "target": "acct-8821",' },
            { type: "code",    text: '  "params": { "pct": 10 }' },
            { type: "code",    text: "}" },
            { type: "info",    text: "→ 201 PROPOSED  act-f93a" },
        ],
        accent: "text-[#7a756e]",
        border: "border-[#7a756e]/20",
        bg: "bg-[#7a756e]/4",
        dot: "bg-[#7a756e]",
        connector: "from-[#7a756e]/25",
    },
    {
        num: "03",
        tag: "Policy Engine",
        label: "Deterministic rule. No ML. Versioned.",
        body: "Pure function: evaluate(action, state, history) → APPROVED | DENIED | ESCALATED. The exact rule version is receipted.",
        lines: [
            { type: "prompt",  text: "POST /actions/act-f93a/evaluate" },
            { type: "info",    text: "→ rule: churn_retention_v1@1.0" },
            { type: "info",    text: "→ churn_risk=HIGH ✓" },
            { type: "info",    text: "→ ltv=1200 > 1000 ✓" },
            { type: "info",    text: "→ no_discount_30d ✓" },
            { type: "success", text: "→ APPROVED" },
        ],
        accent: "text-[#7a756e]",
        border: "border-[#7a756e]/20",
        bg: "bg-[#7a756e]/4",
        dot: "bg-[#7a756e]",
        connector: "from-[#7a756e]/25",
    },
    {
        num: "04",
        tag: "Execution Lock",
        label: "Exactly once. Always.",
        body: "Distributed lock on the action ID. Adapter called once. If the agent retries — receipt found — execution blocked. External system never called twice.",
        lines: [
            { type: "info",    text: "→ lock acquired  act-f93a" },
            { type: "info",    text: "→ salesforce.update(acct-8821)" },
            { type: "success", text: "→ COMPLETED" },
            { type: "spacer",  text: "" },
            { type: "comment", text: "# agent retries 4s later:" },
            { type: "prompt",  text: "POST /actions  { action_id: 'act-f93a' }" },
            { type: "blocked", text: "→ 409  receipt exists — BLOCKED" },
        ],
        accent: "text-[#7a756e]",
        border: "border-[#7a756e]/20",
        bg: "bg-[#7a756e]/4",
        dot: "bg-[#7a756e]",
        connector: "from-[#7a756e]/25",
    },
    {
        num: "05",
        tag: "Ledger",
        label: "Tamper-evident receipt. Forever.",
        body: "SHA-256 hash of the action, rule version, approver, timestamp, and result — written atomically. Immutable. Proof, not logs.",
        lines: [
            { type: "prompt",  text: "GET /actions/act-f93a/receipt" },
            { type: "code",    text: "{" },
            { type: "code",    text: '  "receipt_id": "rct-8821",' },
            { type: "code",    text: '  "rule_id": "churn_retention_v1",' },
            { type: "code",    text: '  "rule_version": "1.0",' },
            { type: "code",    text: '  "hash": "sha256:3f9a8b2c..."' },
            { type: "code",    text: "}" },
            { type: "success", text: "→ immutable  tamper-evident" },
        ],
        accent: "text-[#7a756e]",
        border: "border-[#7a756e]/20",
        bg: "bg-[#7a756e]/4",
        dot: "bg-[#7a756e]",
        connector: null,
    },
];

export function IntroducingStatisSection() {
    const [activeStep, setActiveStep] = useState<number | null>(null);

    return (
        <section className="relative py-32 overflow-hidden section-divider">

            <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl mx-auto mb-20 text-center"
                >
                    <p className="mb-4 text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#00ffc8]">
                        How It Works
                    </p>
                    <h2 className="text-4xl sm:text-5xl font-bold text-[#e8e5de] leading-[1.1] mb-5">
                        Every agent action. Five governed stages.
                        <br />
                        <span className="text-gradient">One receipt.</span>
                    </h2>
                    <p className="text-[#7a7a8a] text-lg leading-relaxed">
                        Hover any step to see the live API. Every stage auditable. Every execution exactly once.
                    </p>
                </motion.div>

                {/* Vertical timeline — hover to expand terminal */}
                <div className="relative max-w-4xl mx-auto">
                    {STEPS.map((step, i) => {
                        const isActive = activeStep === i;
                        return (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className="relative flex gap-6 md:gap-10"
                                onMouseEnter={() => setActiveStep(i)}
                                onMouseLeave={() => setActiveStep(null)}
                            >
                                {/* Left: dot + connector */}
                                <div className="flex flex-col items-center flex-shrink-0 pt-5">
                                    <motion.div
                                        animate={{ scale: isActive ? 1.4 : 1 }}
                                        transition={{ duration: 0.2 }}
                                        className={`w-3 h-3 rounded-full ${step.dot} ring-4 ring-[#050508] flex-shrink-0`}
                                    />
                                    {step.connector && (
                                        <motion.div
                                            animate={{ opacity: isActive ? 0.8 : 0.25 }}
                                            className={`flex-1 w-[2px] bg-gradient-to-b ${step.connector} to-transparent mt-2 min-h-[40px]`}
                                        />
                                    )}
                                </div>

                                {/* Right: card */}
                                <div className="flex-1 pb-8">
                                    <motion.div
                                        animate={{
                                            borderColor: isActive ? undefined : undefined,
                                        }}
                                        className={`rounded-2xl border ${step.border} ${isActive ? step.bg : "bg-white/[0.02]"} p-6 md:p-7 transition-colors duration-300 cursor-default`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`font-mono text-[10px] font-bold tracking-[0.2em] ${step.accent}`}>{step.num}</span>
                                            <span className={`text-[10px] font-mono font-semibold tracking-[0.12em] uppercase px-2.5 py-0.5 rounded-full border ${step.border} ${step.accent}`}>
                                                {step.tag}
                                            </span>
                                        </div>
                                        <h3 className="text-[#e8e5de] font-bold text-lg mb-2">{step.label}</h3>
                                        <p className="text-[#7a7a8a] text-sm leading-relaxed mb-4">{step.body}</p>

                                        {/* Animated terminal — expands on hover */}
                                        <AnimatePresence>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <AnimatedTerminal
                                                        lines={step.lines}
                                                        title={`statis — step ${step.num}`}
                                                        className="mt-2"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
