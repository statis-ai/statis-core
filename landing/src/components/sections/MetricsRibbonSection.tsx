"use client";

import { motion } from "framer-motion";
import { FileText, Lock, Radio, History } from "lucide-react";

const guarantees = [
    { label: "Append-only semantic log", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "group-hover:border-emerald-500/50" },
    { label: "Deterministic materialized state", icon: Lock, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "group-hover:border-indigo-500/50" },
    { label: "Push-based subscriptions", icon: Radio, color: "text-violet-400", bg: "bg-violet-500/10", border: "group-hover:border-violet-500/50" },
    { label: "Replay and time travel", icon: History, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "group-hover:border-cyan-500/50" },
];

export function MetricsRibbonSection() {
    return (
        <section className="relative py-24 bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[200px] bg-indigo-900/10 blur-[100px] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-serif">
                        Under the Hood
                    </h2>
                    <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto">
                        Same events. Same state. Every time. Built for production systems where reliability matters.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {guarantees.map((g, i) => {
                        const Icon = g.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`group flex flex-col items-center gap-4 py-8 px-6 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 ${g.border} cursor-default`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${g.bg} ${g.color}`}>
                                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                                </div>
                                <span className="text-sm font-semibold text-slate-200 text-center tracking-wide leading-relaxed group-hover:text-white transition-colors duration-300">
                                    {g.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
