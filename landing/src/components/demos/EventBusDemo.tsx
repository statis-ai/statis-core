"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Database, Activity, Play, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export function EventBusDemo() {
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const runSimulation = () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setStep(0);

        // Step 1: Initial state is already 0, but trigger step 1 visually
        setTimeout(() => {
            setStep(1);
        }, 1500);

        // Step 2: The Materialization
        setTimeout(() => {
            setStep(2);
            setIsPlaying(false);
        }, 3000);
    };

    return (
        <section className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
            <div className="mb-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Reliable AI starts with reliable state
                    </h2>
                    <p className="text-brand-muted max-w-2xl text-lg">
                        See how Statis prevents a catastrophic agent mistake by instantly materializing an append-only event log into a consistent golden state.
                    </p>
                </div>
                <button
                    onClick={runSimulation}
                    disabled={isPlaying}
                    className={`group flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-black transition-all ${isPlaying ? "bg-brand-surface/50 cursor-not-allowed opacity-50 text-white" : "bg-brand-accent hover:bg-brand-accent/80 hover:shadow-glow"
                        }`}
                >
                    <Play className={`h-5 w-5 ${isPlaying ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`} />
                    {isPlaying ? "Simulating..." : step === 2 ? "Run Again" : "Run Simulation"}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* LEFT COLUMN: AGENT TERMINAL */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg">
                    <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-3">
                        <Terminal className="h-4 w-4 text-brand-muted" />
                        <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Agent Terminal</span>
                    </div>
                    <div className="p-4 font-mono text-sm h-96 overflow-y-auto flex flex-col gap-3">
                        <div className="text-brand-muted">
                            <span className="text-green-400">agent@statis</span>
                            <span className="text-white">:</span>
                            <span className="text-blue-400">~</span>$ tail -f /var/log/agent-executor.log
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-white break-words"
                        >
                            [INFO] Task: "Check-in on Acme Corp account"
                            <br />
                            [INFO] Fetching context... done.
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-white break-words flex gap-2 mt-2"
                        >
                            <span className="animate-pulse text-brand-accent">▶</span>
                            Drafting Upsell email to Acme Corp... [ETA: 5s]
                        </motion.div>

                        <AnimatePresence>
                            {step >= 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 space-y-2"
                                >
                                    <p className="font-bold flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" /> 🛑 WEBHOOK RECEIVED: State mutated.
                                    </p>
                                    <p>⚠️ ACTION BLOCKED: Entity has active <span className="text-red-300 font-bold">[sev1_outage]</span> blocker.</p>
                                    <p className="text-brand-muted">🔄 PIVOTING: Drafting empathy/support outreach instead.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* MIDDLE COLUMN: EVENT BUS LOG */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg">
                    <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-3">
                        <Activity className="h-4 w-4 text-brand-muted" />
                        <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Event Log Stream</span>
                    </div>
                    <div className="p-4 font-mono text-xs h-96 overflow-y-auto flex flex-col gap-3 relative">
                        <div className="absolute top-0 right-4 p-2 bg-brand-surface/80 rounded-b text-[10px] text-brand-muted border-b border-x border-brand-border">Entity: acme_corp</div>

                        <div className="p-3 rounded border border-brand-border/50 bg-black/20 text-brand-muted mt-6">
                            <span className="text-[10px] uppercase opacity-50 block mb-1">10:42:01 AM</span>
                            {"{"}"event": "login_successful", "user": "admin"{"}"}
                        </div>

                        <div className="p-3 rounded border border-brand-border/50 bg-black/20 text-brand-muted">
                            <span className="text-[10px] uppercase opacity-50 block mb-1">10:45:12 AM</span>
                            {"{"}"event": "page_view", "path": "/billing"{"}"}
                        </div>

                        <AnimatePresence>
                            {step >= 1 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    className="p-3 rounded border border-red-500/50 bg-red-500/10 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                >
                                    <span className="text-[10px] font-bold block mb-1 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> 10:48:33 AM
                                    </span>
                                    <span className="font-bold text-red-400">[TICKET.CREATED]</span>
                                    <br />
                                    <span className="text-red-200 mt-1 block">Fact: "Severity 1: Prod DB down. Customer threatening to cancel."</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT COLUMN: MATERIALIZED STATE */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg">
                    <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-3">
                        <Database className="h-4 w-4 text-brand-muted" />
                        <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Materialized State (JSON)</span>
                    </div>
                    <div className="p-4 font-mono text-sm h-96 overflow-y-auto bg-[#0d1117] text-gray-300">
                        <div>
                            <span className="text-white">{"{"}</span>
                            <div className="pl-4">
                                <span className="text-[#7ee787]">"entity_id"</span>: <span className="text-[#a5d6ff]">"acme_corp"</span>,
                                <br />
                                <span className="text-[#7ee787]">"rev"</span>: <motion.span animate={{ color: step >= 2 ? "#ff7b72" : "#79c0ff" }}>{step >= 2 ? "105" : "104"}</motion.span>,
                                <br />
                                <span className="text-[#7ee787]">"state_json"</span>: <span className="text-white">{"{"}</span>
                                <div className="pl-4">
                                    <span className="text-[#7ee787]">"plan"</span>: <span className="text-[#a5d6ff]">"Enterprise"</span>,
                                    <br />
                                    <motion.div
                                        animate={step >= 2 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(239,68,68,0.2)", "rgba(0,0,0,0)"] } : {}}
                                        transition={{ duration: 1.5 }}
                                        className="inline-block w-full"
                                    >
                                        <span className="text-[#7ee787]">"health_score"</span>: <motion.span animate={{ color: step >= 2 ? "#ff7b72" : "#79c0ff" }}>{step >= 2 ? "12" : "92"}</motion.span>,
                                    </motion.div>
                                    <motion.div
                                        animate={step >= 2 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(239,68,68,0.2)", "rgba(0,0,0,0)"] } : {}}
                                        transition={{ duration: 1.5 }}
                                        className="inline-block w-full"
                                    >
                                        <span className="text-[#7ee787]">"churn_risk"</span>: <motion.span animate={{ color: step >= 2 ? "#ff7b72" : "#79c0ff" }}>{step >= 2 ? "true" : "false"}</motion.span>,
                                    </motion.div>
                                    <motion.div
                                        animate={step >= 2 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(239,68,68,0.2)", "rgba(0,0,0,0)"] } : {}}
                                        transition={{ duration: 1.5 }}
                                        className="inline-block w-full"
                                    >
                                        <span className="text-[#7ee787]">"blockers"</span>: [
                                        <AnimatePresence>
                                            {step >= 2 && (
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-[#a5d6ff]"
                                                >
                                                    "sev1_outage"
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                        ],
                                    </motion.div>
                                    <motion.div
                                        animate={step >= 2 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(239,68,68,0.2)", "rgba(0,0,0,0)"] } : {}}
                                        transition={{ duration: 1.5 }}
                                        className="inline-block w-full"
                                    >
                                        <span className="text-[#7ee787]">"last_sentiment"</span>: <motion.span animate={{ color: step >= 2 ? "#ff7b72" : "#a5d6ff" }}>"{step >= 2 ? "furious" : "positive"}"</motion.span>
                                    </motion.div>
                                </div>
                                <span className="text-white">{"}"}</span>
                            </div>
                            <span className="text-white">{"}"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
