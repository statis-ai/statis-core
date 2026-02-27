"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, Activity, ShieldCheck } from "lucide-react";

export function BeforeAfterSection() {
    const [activeTab, setActiveTab] = useState<"before" | "after">("after");

    const issues = [
        { title: "Agents poll different systems", desc: "Constant API hammering and rate limits." },
        { title: "Cached data drifts", desc: "One agent sees 'paid', another sees 'unpaid'." },
        { title: "Decisions contradict", desc: "Support refunds what Billing just denied." },
        { title: "State transitions are implicit", desc: "Hidden logic buried in agent prompts." },
        { title: "Debugging requires archaeology", desc: "Digging through logs to find the race condition." },
    ];

    const solutions = [
        { title: "One materialized source of truth", desc: "A single, verifiable reality for all agents." },
        { title: "Instant propagation", desc: "Webhooks fire the millisecond state changes." },
        { title: "Deterministic reactions", desc: "Predictable behavior, even at massive scale." },
        { title: "Explicit state transitions", desc: "Logic lives in the platform, not the prompt." },
        { title: "Explainable autonomy", desc: "Time-travel debugging and perfect audit trails." },
    ];

    return (
        <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent mb-4">
                            The Paradigm Shift
                        </h2>
                        <h3 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl font-serif mb-6">
                            From Chaos to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Coordination</span>
                        </h3>
                        <p className="text-lg leading-8 text-gray-500">
                            Stop building brittle, point-to-point integrations between your AI agents.
                        </p>
                    </motion.div>
                </div>

                {/* Interactive Comparison Interactive Builder */}
                <div className="max-w-5xl mx-auto">
                    {/* Mobile/Tablet Toggle (Visible mostly on smaller screens, but works on all) */}
                    <div className="flex justify-center mb-8 md:hidden">
                        <div className="bg-gray-100 p-1 rounded-full flex gap-1 relative">
                            <button
                                onClick={() => setActiveTab("before")}
                                className={`relative z-10 px-6 py-2.5 text-sm font-semibold rounded-full transition-colors ${activeTab === "before" ? "text-red-700" : "text-gray-500"
                                    }`}
                            >
                                Without Statis
                            </button>
                            <button
                                onClick={() => setActiveTab("after")}
                                className={`relative z-10 px-6 py-2.5 text-sm font-semibold rounded-full transition-colors ${activeTab === "after" ? "text-indigo-700" : "text-gray-500"
                                    }`}
                            >
                                With Statis
                            </button>
                            {/* Sliding Background */}
                            <motion.div
                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm"
                                animate={{
                                    left: activeTab === "before" ? "4px" : "calc(50%)",
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative">
                        {/* Divider Line (Desktop) */}
                        <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent -translate-x-1/2" />

                        {/* VS Badge (Desktop) */}
                        <div className="hidden md:flex absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border border-gray-200 shadow-sm items-center justify-center z-10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            VS
                        </div>

                        {/* BEFORE COLUMN */}
                        <motion.div
                            className={`flex flex-col gap-6 transition-all duration-500 ${activeTab === "before" ? "opacity-100" : "opacity-40 md:opacity-50 grayscale hover:grayscale-0 md:hover:opacity-70"
                                }`}
                            onClick={() => setActiveTab("before")}
                            onMouseEnter={() => window.innerWidth >= 768 && setActiveTab("before")}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">Without a Shared Layer</h4>
                                    <p className="text-sm text-gray-500">The N² integration problem</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {issues.map((issue, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="relative group p-5 rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-red-200 transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                            <div>
                                                <h5 className="font-semibold text-gray-900 text-sm mb-1">{issue.title}</h5>
                                                <p className="text-xs text-gray-500 leading-relaxed">{issue.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* AFTER COLUMN */}
                        <motion.div
                            className={`flex flex-col gap-6 transition-all duration-500 ${activeTab === "after" ? "opacity-100 scale-[1.02]" : "opacity-40 md:opacity-50 grayscale md:hover:opacity-70 md:hover:grayscale-0 scale-95 md:scale-100"
                                }`}
                            onClick={() => setActiveTab("after")}
                            onMouseEnter={() => window.innerWidth >= 768 && setActiveTab("after")}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">With Statis</h4>
                                    <p className="text-sm text-indigo-600 font-medium">The verifiable reality layer</p>
                                </div>
                            </div>

                            <div className="space-y-4 relative">
                                {/* Connecting line for UI effect */}
                                <div className="absolute left-7 top-8 bottom-8 w-px bg-indigo-100 -z-10" />

                                {solutions.map((solution, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="relative group p-5 rounded-2xl border border-indigo-50/50 bg-white shadow-[0_4px_20px_rgb(79,70,229,0.06)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.12)] transition-shadow"
                                    >
                                        <div className="flex items-start gap-4 hover:translate-x-1 transition-transform duration-300">
                                            <div className="relative mt-0.5">
                                                <div className="absolute inset-0 bg-indigo-200 rounded-full blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <CheckCircle2 className="w-5 h-5 text-indigo-600 relative z-10 bg-white rounded-full" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 text-sm mb-1">{solution.title}</h5>
                                                <p className="text-xs text-gray-600 leading-relaxed">{solution.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
