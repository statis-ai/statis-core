"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const STEPS = [
    {
        num: "01",
        label: "State Materializes",
        tag: "State Layer",
        body: "Events are ingested. Statis materializes one authoritative, deterministic state — pushed instantly to every subscribed agent.",
        accent: "text-indigo-600",
        border: "border-indigo-200",
        bg: "bg-indigo-50",
        span: "lg:col-span-2",
    },
    {
        num: "02",
        label: "Agent Proposes Action",
        tag: "Action Contract",
        body: "Agent reads shared state and proposes a typed Action Contract — who, what, to whom, under what context. Nothing executes yet.",
        accent: "text-violet-600",
        border: "border-violet-200",
        bg: "bg-violet-50",
        span: "lg:col-span-1",
    },
    {
        num: "03",
        label: "Policy Evaluates",
        tag: "Policy Engine",
        body: "Pure deterministic rule: evaluate(action, state, history) → APPROVED | DENIED | ESCALATED. No ML. Auditable. Versioned.",
        accent: "text-sky-600",
        border: "border-sky-200",
        bg: "bg-sky-50",
        span: "lg:col-span-1",
    },
    {
        num: "04",
        label: "Executes Exactly Once",
        tag: "Execution Guarantee",
        body: "Distributed lock acquired. Adapter called once. If agent retries — receipt found — execution blocked. Stripe never called twice.",
        accent: "text-emerald-600",
        border: "border-emerald-200",
        bg: "bg-emerald-50",
        span: "lg:col-span-1",
    },
    {
        num: "05",
        label: "Receipt Written",
        tag: "Ledger",
        body: "SHA-256 tamper-evident receipt: action, rule version, approver, timestamp, result. Immutable. Auditor-ready. Forever.",
        accent: "text-amber-600",
        border: "border-amber-200",
        bg: "bg-amber-50",
        span: "lg:col-span-1",
    },
];

export function IntroducingStatisSection() {
    return (
        <section className="relative py-32 bg-white overflow-hidden border-t border-gray-100">
            {/* Ambient glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-100/40 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-100/30 blur-[140px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto mb-20 text-center"
                >
                    <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" />
                        The Solution
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-[3.5rem] font-serif mb-6 leading-[1.1] text-gradient">
                        From shared truth
                        <br className="hidden sm:block" />
                        to governed action.
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8">
                        Statis closes the loop. Agents read from one authoritative state. When they act, every action is proposed, evaluated against policy, executed exactly once, and receipted — permanently.
                    </p>
                    <p className="text-sm font-mono text-gray-400 leading-relaxed">
                        You wouldn&rsquo;t deploy code without CI/CD.
                        <br />
                        <span className="text-indigo-600">You shouldn&rsquo;t deploy agents without Statis.</span>
                    </p>
                </motion.div>

                {/* Bento grid — 3 cols, first card spans 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
                    {STEPS.map((step, i) => (
                        <motion.div
                            key={step.num}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className={`flex flex-col p-7 sm:p-8 rounded-[2rem] border ${step.border} ${step.bg} hover:shadow-md transition-all duration-300 ${step.span}`}
                        >
                            {/* Step number + tag */}
                            <div className="flex items-center gap-2.5 mb-4">
                                <span className={`font-mono text-[11px] font-bold tracking-[0.2em] ${step.accent}`}>
                                    {step.num}
                                </span>
                                <span className={`text-[10px] font-mono font-semibold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full border ${step.border} ${step.accent}`}>
                                    {step.tag}
                                </span>
                            </div>

                            <h3 className="text-gray-900 font-bold text-lg sm:text-xl mb-3">
                                {step.label}
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed flex-1">
                                {step.body}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
