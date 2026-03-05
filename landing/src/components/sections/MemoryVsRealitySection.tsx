"use client";

import { motion } from "framer-motion";
import { GitCompare } from "lucide-react";

const NOT_CARDS = [
    {
        label: "Not Orchestration",
        body: "LangGraph, AutoGen, CrewAI handle how agents reason and sequence. Statis governs when they act.",
    },
    {
        label: "Not Observability",
        body: "Langfuse, Arize tell you what happened. Statis creates tamper-evident proof of what was approved and why.",
    },
    {
        label: "Not a Workflow Engine",
        body: "Temporal, Inngest manage long-running workflows. Statis governs individual agent actions with write-access to production.",
    },
    {
        label: "Not Authorization",
        body: "Permit.io, OPA handle who can do what. Statis adds: under what conditions, with what receipts, and exactly once.",
    },
];

const COMPARISONS = [
    {
        left: { label: "Memory", desc: "Vector DBs help agents remember." },
        right: { label: "Reality", desc: "Statis helps agents agree." },
        detail: "When an agent needs context, use RAG. When it needs to know what's true right now — it needs shared reality.",
    },
    {
        left: { label: "Logs", desc: "Observability tells you what happened." },
        right: { label: "Receipts", desc: "Statis proves it." },
        detail: "Logs are reconstructed. Receipts are cryptographically signed at the moment of execution, with the rule version that approved it.",
    },
    {
        left: { label: "Human-in-loop", desc: "LangSmith can pause for human approval." },
        right: { label: "Policy", desc: "Statis adds a deterministic policy engine." },
        detail: "Rules that evaluate entity state, version-controlled, auditable, with no ML involved.",
    },
];

export function MemoryVsRealitySection() {
    return (
        <section className="relative py-32 bg-gray-50 overflow-hidden border-t border-gray-100">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-100/50 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-100/30 blur-[140px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto mb-20 text-center"
                >
                    <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 flex items-center justify-center gap-2">
                        <GitCompare className="w-4 h-4" />
                        The Distinction
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-[3.5rem] font-serif mb-6 leading-[1.1] text-gradient">
                        What Statis is not.
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        Precision matters. The agent infrastructure category is being defined now. Here&rsquo;s where Statis ends and others begin.
                    </p>
                </motion.div>

                {/* "Not X" cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-20">
                    {NOT_CARDS.map((card, i) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.07 }}
                            className="flex gap-4 p-6 sm:p-7 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm transition-all duration-300"
                        >
                            <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500/60 mt-2" />
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">{card.label}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{card.body}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Comparison pairs */}
                <div className="space-y-5">
                    {COMPARISONS.map((comp, i) => (
                        <motion.div
                            key={comp.left.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm transition-all duration-300"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-4">
                                {/* Left */}
                                <div className="flex-1 text-center sm:text-right">
                                    <p className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-1">{comp.left.label}</p>
                                    <p className="text-gray-500 text-sm">{comp.left.desc}</p>
                                </div>

                                {/* vs */}
                                <div className="shrink-0 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs font-mono uppercase tracking-widest px-3 py-1 border border-gray-200 rounded-full">vs</span>
                                </div>

                                {/* Right */}
                                <div className="flex-1 text-center sm:text-left">
                                    <p className="text-indigo-600 text-xs font-mono uppercase tracking-widest mb-1">{comp.right.label}</p>
                                    <p className="text-gray-900 font-semibold text-sm">{comp.right.desc}</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed text-center border-t border-gray-100 pt-4">
                                {comp.detail}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
