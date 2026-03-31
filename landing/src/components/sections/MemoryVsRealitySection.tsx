"use client";

import { motion } from "framer-motion";

const COMPARISONS = [
    {
        category: "State",
        without: { tool: "Vector DB / RAG", desc: "Semantic retrieval — agent remembers", tag: "approximate" },
        with:    { tool: "Statis State Layer", desc: "Deterministic shared reality — agents agree", tag: "exact" },
    },
    {
        category: "Audit",
        without: { tool: "Logs / Langfuse", desc: "Reconstruct what happened after the fact", tag: "reconstructed" },
        with:    { tool: "Statis Ledger", desc: "SHA-256 tamper-evident receipt at execution time", tag: "proof" },
    },
    {
        category: "Approval",
        without: { tool: "Human-in-the-loop", desc: "Pause for human review every time", tag: "manual" },
        with:    { tool: "Statis Policy Engine", desc: "Deterministic rule — versioned, auditable, no ML", tag: "automated" },
    },
    {
        category: "Execution",
        without: { tool: "Retry logic in agent code", desc: "Hopes for idempotency from the adapter", tag: "fragile" },
        with:    { tool: "Statis Execution Lock", desc: "Distributed lock — adapter called exactly once", tag: "guaranteed" },
    },
];

const NOT_CARDS = [
    {
        label: "Not Orchestration",
        sublabel: "vs LangGraph, AutoGen, CrewAI",
        body: "They handle how agents reason and sequence. Statis governs the moment they act.",
        accent: "border-violet-500/15 bg-violet-500/4",
        tag: "text-violet-400",
    },
    {
        label: "Not Observability",
        sublabel: "vs Langfuse, Arize",
        body: "They tell you what happened. Statis creates tamper-evident proof of what was approved and why — before it happened.",
        accent: "border-sky-500/15 bg-sky-500/4",
        tag: "text-sky-400",
    },
    {
        label: "Not a Workflow Engine",
        sublabel: "vs Temporal, Inngest",
        body: "They manage long-running workflows. Statis governs individual agent actions that have write-access to production.",
        accent: "border-emerald-500/15 bg-emerald-500/4",
        tag: "text-emerald-400",
    },
    {
        label: "Not Authorization",
        sublabel: "vs Permit.io, OPA",
        body: "They answer: who can do what? Statis answers: given current entity state, should this happen now — and proves it.",
        accent: "border-amber-500/15 bg-amber-500/4",
        tag: "text-amber-400",
    },
    {
        label: "Not Threat Detection",
        sublabel: "vs Runlayer, AWS AgentCore",
        body: "They govern which tools an agent can call. Statis governs what happens when the agent actually executes — exactly-once lock, policy evaluation, tamper-evident proof.",
        accent: "border-[#00ffc8]/15 bg-[#00ffc8]/4",
        tag: "text-[#00ffc8]",
    },
];

export function MemoryVsRealitySection() {
    return (
        <section className="relative py-32 overflow-hidden section-divider">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/4 blur-[140px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl mx-auto mb-16 text-center"
                >
                    <p className="mb-4 text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-violet-400">
                        The Distinction
                    </p>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
                        Agent Execution Infrastructure.
                        <br />
                        <span className="text-gradient">A new layer.</span>
                    </h2>
                    <p className="text-[#7a7a8a] text-lg leading-relaxed">
                        The agent infrastructure category is being defined now. Precision matters — here&rsquo;s exactly where Statis sits.
                    </p>
                </motion.div>

                {/* Comparison table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="rounded-2xl border border-white/8 bg-[#0a0a12] overflow-hidden mb-10"
                >
                    {/* Table header */}
                    <div className="grid grid-cols-3 border-b border-white/8 bg-white/[0.02]">
                        <div className="px-5 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#4a4a6a]">Capability</div>
                        <div className="px-5 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-rose-400 border-l border-white/6">Without Statis</div>
                        <div className="px-5 py-3.5 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#00ffc8] border-l border-white/6">With Statis</div>
                    </div>

                    {COMPARISONS.map((row, i) => (
                        <motion.div
                            key={row.category}
                            initial={{ opacity: 0, x: -8 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.07 }}
                            className={`grid grid-cols-3 ${i < COMPARISONS.length - 1 ? "border-b border-white/5" : ""}`}
                        >
                            {/* Category */}
                            <div className="px-5 py-4 flex items-start">
                                <span className="text-[#5a5a7a] text-xs font-mono font-semibold uppercase tracking-widest">{row.category}</span>
                            </div>

                            {/* Without */}
                            <div className="px-5 py-4 border-l border-white/5">
                                <div className="text-xs font-mono text-[#5a5a7a] mb-1">{row.without.tool}</div>
                                <div className="text-xs text-[#6a6a7a] leading-relaxed">{row.without.desc}</div>
                                <span className="inline-block mt-2 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-rose-500/20 text-rose-400/70">{row.without.tag}</span>
                            </div>

                            {/* With Statis */}
                            <div className="px-5 py-4 border-l border-white/5 bg-[#00ffc8]/[0.015]">
                                <div className="text-xs font-mono text-[#00ffc8] mb-1">{row.with.tool}</div>
                                <div className="text-xs text-[#8a8a9a] leading-relaxed">{row.with.desc}</div>
                                <span className="inline-block mt-2 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[#00ffc8]/20 text-[#00ffc8]/70">{row.with.tag}</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Not X cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {NOT_CARDS.map((card, i) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: i * 0.07 }}
                            className={`flex gap-4 p-6 rounded-2xl border ${card.accent} cursor-default`}
                        >
                            <div className="shrink-0 mt-1">
                                <div className="w-1 h-1 rounded-full bg-rose-500/60 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <h3 className="font-bold text-white text-sm">{card.label}</h3>
                                    <span className={`text-[10px] font-mono ${card.tag}`}>{card.sublabel}</span>
                                </div>
                                <p className="text-[#7a7a8a] text-sm leading-relaxed">{card.body}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
