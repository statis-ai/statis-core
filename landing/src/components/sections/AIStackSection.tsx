"use client";

import { motion } from "framer-motion";
import { Layers } from "lucide-react";

const STACK_ROWS = [
    {
        label: "AI Agents & Orchestration",
        items: ["LangGraph", "AutoGen", "CrewAI", "custom"],
        accent: "text-gray-500",
        border: "border-gray-200",
        bg: "bg-white",
        labelColor: "text-gray-500",
    },
    {
        label: "Statis — Execution Layer",
        items: ["State", "Policy", "Execution", "Ledger"],
        accent: "text-indigo-600",
        border: "border-indigo-300",
        bg: "bg-indigo-50",
        labelColor: "text-indigo-600",
        highlight: true,
    },
    {
        label: "Production Systems",
        items: ["Stripe", "Salesforce", "Zendesk", "any API"],
        accent: "text-gray-500",
        border: "border-gray-200",
        bg: "bg-white",
        labelColor: "text-gray-500",
    },
];

export function AIStackSection() {
    return (
        <section className="relative py-32 bg-white overflow-hidden border-t border-gray-100">
            {/* Ambient glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[700px] h-[300px] bg-indigo-100/50 blur-[120px] rounded-full" />
            </div>

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
                        <Layers className="w-4 h-4" />
                        Architecture
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-[3.5rem] font-serif mb-6 leading-[1.1] text-gradient">
                        The new layer
                        <br className="hidden sm:block" />
                        in the AI stack.
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        Statis sits between your agents and your production systems. It doesn&rsquo;t replace your orchestration framework or your observability tools. It owns one moment: when the agent is about to do something real.
                    </p>
                </motion.div>

                {/* Stack diagram */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="max-w-3xl mx-auto space-y-2"
                >
                    {STACK_ROWS.map((row, i) => (
                        <div key={i}>
                            <div className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5 sm:p-6 rounded-2xl border ${row.border} ${row.bg} transition-all duration-300 ${row.highlight ? "shadow-[0_4px_24px_rgba(99,102,241,0.15)] hover:shadow-[0_4px_32px_rgba(99,102,241,0.2)]" : "hover:border-gray-300 shadow-sm"}`}>
                                {/* Label */}
                                <span className={`text-sm font-semibold whitespace-nowrap ${row.labelColor} min-w-[200px]`}>
                                    {row.label}
                                    {row.highlight && (
                                        <span className="ml-2 text-indigo-500">◀</span>
                                    )}
                                </span>

                                {/* Divider */}
                                <div className="hidden sm:block h-4 w-[1px] bg-gray-200 shrink-0" />

                                {/* Items */}
                                <div className="flex flex-wrap gap-2">
                                    {row.items.map((item) => (
                                        <span key={item} className={`text-xs font-mono px-2.5 py-1 rounded-full border ${row.border} ${row.accent}`}>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Connector arrows */}
                            {i < STACK_ROWS.length - 1 && (
                                <div className="flex justify-center py-1">
                                    <div className="flex flex-col items-center gap-0.5">
                                        <div className="w-[1px] h-3 bg-gray-200" />
                                        <div className="text-gray-300 text-xs">↕</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}
