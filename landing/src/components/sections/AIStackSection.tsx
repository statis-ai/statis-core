"use client";

import { motion } from "framer-motion";

const AGENT_TOOLS = ["LangGraph", "AutoGen", "CrewAI", "Custom Agent"];
const STATIS_PRIMITIVES = ["State", "Policy", "Execution", "Ledger"];
const PROD_SYSTEMS = ["Stripe", "Salesforce", "Zendesk", "HubSpot", "Airflow"];

const FLOW_STEPS = [
    { from: "Agent", to: "Statis", label: "POST /actions  propose", color: "text-violet-400", arrow: "↓" },
    { from: "Statis", to: "Policy", label: "evaluate(state, history)", color: "text-sky-400",    arrow: "↓" },
    { from: "Policy", to: "Statis", label: "APPROVED / DENIED",      color: "text-emerald-400", arrow: "↓" },
    { from: "Statis", to: "System", label: "adapter.execute() ×1",   color: "text-[#00ffc8]",   arrow: "↓" },
    { from: "Statis", to: "Ledger", label: "sha256 receipt written",  color: "text-amber-400",   arrow: "↓" },
];

function LayerRow({
    label,
    items,
    highlight,
    delay,
}: {
    label: string;
    items: string[];
    highlight?: boolean;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={`rounded-2xl border px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 ${
                highlight
                    ? "border-[#00ffc8]/25 bg-[#00ffc8]/6 shadow-[0_0_40px_rgba(0,255,200,0.06)]"
                    : "border-white/7 bg-white/[0.025]"
            }`}
        >
            <span className={`text-sm font-semibold whitespace-nowrap min-w-[200px] ${highlight ? "text-[#00ffc8]" : "text-[#5a5a7a]"}`}>
                {label}
                {highlight && <span className="ml-2 text-[#00ffc8]/60 text-xs">← execution layer</span>}
            </span>
            <div className="hidden sm:block h-4 w-px bg-white/8 shrink-0" />
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <span
                        key={item}
                        className={`text-xs font-mono px-3 py-1 rounded-full border ${
                            highlight
                                ? "border-[#00ffc8]/20 text-[#00ffc8] bg-[#00ffc8]/5"
                                : "border-white/8 text-[#5a5a7a] bg-white/3"
                        }`}
                    >
                        {item}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

export function AIStackSection() {
    return (
        <section className="relative py-32 overflow-hidden section-divider">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[300px] bg-[#00ffc8]/4 blur-[120px] rounded-full" />
            </div>

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
                        Architecture
                    </p>
                    <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
                        The missing layer
                        <br />
                        <span className="text-gradient">in your AI stack.</span>
                    </h2>
                    <p className="text-[#7a7a8a] text-lg leading-relaxed">
                        Statis doesn&rsquo;t replace your orchestration framework or observability tools. It owns one moment: when the agent is about to do something real.
                    </p>
                </motion.div>

                {/* Two-column: stack + flow */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                    {/* Stack diagram */}
                    <div className="lg:col-span-3 space-y-2">
                        <LayerRow label="AI Agents & Orchestration" items={AGENT_TOOLS} delay={0.1} />

                        {/* Down arrow */}
                        <div className="flex justify-center py-1">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-px h-4 bg-gradient-to-b from-white/10 to-[#00ffc8]/30" />
                                <span className="text-[#00ffc8]/50 text-sm">↓</span>
                            </div>
                        </div>

                        <LayerRow label="Statis — Execution Layer" items={STATIS_PRIMITIVES} highlight delay={0.2} />

                        <div className="flex justify-center py-1">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[#00ffc8]/50 text-sm">↓</span>
                                <div className="w-px h-4 bg-gradient-to-b from-[#00ffc8]/30 to-white/10" />
                            </div>
                        </div>

                        <LayerRow label="Production Systems" items={PROD_SYSTEMS} delay={0.3} />
                    </div>

                    {/* Flow detail */}
                    <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="lg:col-span-2 rounded-2xl border border-white/8 bg-[#0a0a12] p-6"
                    >
                        <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#4a4a6a] mb-5">
                            Execution flow
                        </p>
                        <div className="space-y-1">
                            {FLOW_STEPS.map((step, i) => (
                                <div key={i}>
                                    <div className={`text-[11px] font-mono ${step.color}`}>
                                        {step.label}
                                    </div>
                                    {i < FLOW_STEPS.length - 1 && (
                                        <div className="text-[#2a2a3a] font-mono text-xs ml-2 leading-3">{step.arrow}</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-5 border-t border-white/6 space-y-3">
                            {[
                                { label: "Exactly-once lock",        ok: true },
                                { label: "Policy before execution",  ok: true },
                                { label: "SHA-256 receipt",          ok: true },
                                { label: "Adapter retries duplicate", ok: false },
                            ].map(({ label, ok }) => (
                                <div key={label} className="flex items-center gap-2.5">
                                    <span className={`text-xs font-mono ${ok ? "text-emerald-400" : "text-rose-400"}`}>
                                        {ok ? "✓" : "✗"}
                                    </span>
                                    <span className={`text-xs ${ok ? "text-[#7a7a8a]" : "text-rose-400/70 line-through"}`}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
