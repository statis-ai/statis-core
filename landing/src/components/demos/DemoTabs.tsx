"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Database, Activity, Play, AlertCircle, CheckCircle2, History, XCircle, Bot } from "lucide-react";

export function DemoTabs() {
    const [activeTab, setActiveTab] = useState<"tone-deaf" | "double-spend" | "time-travel" | "data-swarm">("tone-deaf");

    return (
        <div className="relative z-10 w-full mb-12">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
                    Built for the chaos of multi-agent systems
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-brand-muted">
                    Watch how Statis handles race conditions, out-of-order events, and state regressions instantly.
                </p>
            </div>

            <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-full bg-brand-surface/40 p-1 border border-brand-border backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab("tone-deaf")}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${activeTab === "tone-deaf" ? "bg-brand-accent text-black shadow-glow-sm" : "text-brand-muted hover:text-white"
                            }`}
                    >
                        Tone-Deaf AI
                    </button>
                    <button
                        onClick={() => setActiveTab("double-spend")}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${activeTab === "double-spend" ? "bg-brand-accent text-black shadow-glow-sm" : "text-brand-muted hover:text-white"
                            }`}
                    >
                        Double-Spend Swarm
                    </button>
                    <button
                        onClick={() => setActiveTab("time-travel")}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${activeTab === "time-travel" ? "bg-brand-accent text-black shadow-glow-sm" : "text-brand-muted hover:text-white"
                            }`}
                    >
                        Time Travel Audit
                    </button>
                    <button
                        onClick={() => setActiveTab("data-swarm")}
                        className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${activeTab === "data-swarm" ? "bg-brand-accent text-black shadow-glow-sm" : "text-brand-muted hover:text-white"
                            }`}
                    >
                        Data-Triggered Swarm
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "tone-deaf" && <ToneDeafTab key="tone-deaf" />}
                {activeTab === "double-spend" && <DoubleSpendTab key="double-spend" />}
                {activeTab === "time-travel" && <TimeTravelTab key="time-travel" />}
                {activeTab === "data-swarm" && <DataSwarmTab key="data-swarm" />}
            </AnimatePresence>
        </div>
    );
}

function ToneDeafTab() {
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const runSimulation = () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setStep(0);
        setTimeout(() => { setStep(1); }, 1500);
        setTimeout(() => { setStep(2); setIsPlaying(false); }, 3000);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-xl font-bold text-white">Tone-Deaf AI</h3>
                    <p className="text-sm text-brand-muted">An agent tries to upsell a customer who just reported a Sev1 outage.</p>
                </div>
                <button
                    onClick={runSimulation}
                    disabled={isPlaying}
                    className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black transition-all ${isPlaying ? "bg-brand-surface/50 cursor-not-allowed opacity-50 text-white" : "bg-brand-accent hover:bg-brand-accent/80 hover:shadow-glow"
                        }`}
                >
                    <Play className={`h-4 w-4 ${isPlaying ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`} />
                    {isPlaying ? "Simulating..." : step === 2 ? "Run Again" : "Run Simulation"}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* LEFT PANE */}
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

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white break-words">
                            [INFO] Task: "Check-in on Acme Corp account"
                            <br />
                            [INFO] Fetching context... done.
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-white break-words flex gap-2 mt-2">
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

                {/* MIDDLE PANE */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg">
                    <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-3">
                        <Activity className="h-4 w-4 text-brand-muted" />
                        <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Event Log Stream</span>
                    </div>
                    <div className="p-4 font-mono text-xs h-96 overflow-y-auto flex flex-col gap-3 relative">
                        <div className="absolute top-0 right-4 p-2 bg-brand-surface/80 rounded-b text-[10px] text-brand-muted border-b border-x border-brand-border">Statis Event Log</div>

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

                {/* RIGHT PANE */}
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
                                    <motion.div animate={step >= 2 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(239,68,68,0.2)", "rgba(0,0,0,0)"] } : {}} transition={{ duration: 1.5 }} className="inline-block w-full">
                                        <span className="text-[#7ee787]">"health_score"</span>: <motion.span animate={{ color: step >= 2 ? "#ff7b72" : "#79c0ff" }}>{step >= 2 ? "12" : "92"}</motion.span>,
                                    </motion.div>
                                    <motion.div animate={step >= 2 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(239,68,68,0.2)", "rgba(0,0,0,0)"] } : {}} transition={{ duration: 1.5 }} className="inline-block w-full">
                                        <span className="text-[#7ee787]">"churn_risk"</span>: <motion.span animate={{ color: step >= 2 ? "#ff7b72" : "#79c0ff" }}>{step >= 2 ? "true" : "false"}</motion.span>,
                                    </motion.div>
                                    <motion.div animate={step >= 2 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(239,68,68,0.2)", "rgba(0,0,0,0)"] } : {}} transition={{ duration: 1.5 }} className="inline-block w-full">
                                        <span className="text-[#7ee787]">"blockers"</span>: [
                                        <AnimatePresence>
                                            {step >= 2 && (
                                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#a5d6ff]">
                                                    "sev1_outage"
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                        ],
                                    </motion.div>
                                    <motion.div animate={step >= 2 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(239,68,68,0.2)", "rgba(0,0,0,0)"] } : {}} transition={{ duration: 1.5 }} className="inline-block w-full">
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
        </motion.div>
    );
}

function DoubleSpendTab() {
    const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const runSimulation = () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setStep(0);
        setTimeout(() => { setStep(1); }, 1500); // Agent A & B start
        setTimeout(() => { setStep(2); }, 3000); // Conflict events arrive
        setTimeout(() => { setStep(3); setIsPlaying(false); }, 4500); // Resolution
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-xl font-bold text-white">Double-Spend Swarm</h3>
                    <p className="text-sm text-brand-muted">Two agents try to resolve the same ticket simultaneously (Refund vs. Replacement).</p>
                </div>
                <button
                    onClick={runSimulation}
                    disabled={isPlaying}
                    className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all ${isPlaying ? "bg-brand-surface/50 cursor-not-allowed opacity-50" : "bg-brand-accent hover:bg-brand-accent/80 hover:shadow-glow"
                        }`}
                >
                    <Play className={`h-4 w-4 ${isPlaying ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`} />
                    {isPlaying ? "Simulating..." : step === 3 ? "Run Again" : "Run Simulation"}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* LEFT PANE: TWO AGENTS */}
                <div className="flex flex-col gap-4 h-96">
                    {/* Agent A */}
                    <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg">
                        <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-2">
                            <Terminal className="h-4 w-4 text-brand-muted" />
                            <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Agent A: Support</span>
                        </div>
                        <div className="p-3 font-mono text-xs h-full overflow-y-auto flex flex-col gap-2">
                            <div className="text-brand-muted">
                                <span className="text-green-400">agent-a</span><span className="text-white">:</span><span className="text-blue-400">~</span>$ log tail
                            </div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white">
                                [INFO] Processing order_99X complaint...
                            </motion.div>
                            <AnimatePresence>
                                {step >= 1 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-accent flex gap-2">
                                        <span className="animate-pulse">▶</span> Decision: Authorizing Refund.
                                    </motion.div>
                                )}
                                {step >= 3 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 mt-2 flex gap-1 items-center">
                                        <CheckCircle2 className="h-3 w-3" /> SUCCESS: State updated.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Agent B */}
                    <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg">
                        <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-2">
                            <Terminal className="h-4 w-4 text-brand-muted" />
                            <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Agent B: Returns</span>
                        </div>
                        <div className="p-3 font-mono text-xs h-full overflow-y-auto flex flex-col gap-2">
                            <div className="text-brand-muted">
                                <span className="text-green-400">agent-b</span><span className="text-white">:</span><span className="text-blue-400">~</span>$ log tail
                            </div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white">
                                [INFO] Routing return request for order_99X...
                            </motion.div>
                            <AnimatePresence>
                                {step >= 1 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-accent flex gap-2">
                                        <span className="animate-pulse">▶</span> Decision: Authorizing Replacement.
                                    </motion.div>
                                )}
                                {step >= 3 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                                        <div className="font-bold flex gap-1 items-center"><XCircle className="h-3 w-3" /> ACTION BLOCKED</div>
                                        Entity already resolved. [Conflict Rev 12]
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* MIDDLE PANE */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg h-96">
                    <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-3">
                        <Activity className="h-4 w-4 text-brand-muted" />
                        <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Event Log Stream</span>
                    </div>
                    <div className="p-4 font-mono text-xs h-full overflow-y-auto flex flex-col gap-3 relative">
                        <div className="absolute top-0 right-4 p-2 bg-brand-surface/80 rounded-b text-[10px] text-brand-muted border-b border-x border-brand-border">Statis Event Log</div>

                        <div className="p-3 rounded border border-brand-border/50 bg-black/20 text-brand-muted mt-6">
                            <span className="text-[10px] uppercase opacity-50 block mb-1">11:14:02 AM</span>
                            {"{"}"event": "ticket_opened", "reason": "damaged"{"}"}
                        </div>

                        <AnimatePresence>
                            {step >= 2 && (
                                <div className="relative mt-2">
                                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-yellow-500/50 rounded-full" />
                                    <span className="text-[10px] text-yellow-500 uppercase font-bold ml-2 block mb-2">Race Condition: Simultaneous writes</span>

                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded border border-green-500/50 bg-green-500/10 text-green-300 ml-2 mb-2">
                                        <span className="text-[10px] uppercase opacity-50 block mb-1 flex justify-between">
                                            <span>11:15:47.001 AM</span>
                                            {step >= 3 && <CheckCircle2 className="h-3 w-3 text-green-400" />}
                                        </span>
                                        <span className="font-bold">[REFUND_AUTHORIZED]</span> "agent_a"
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className={`p-3 rounded border ml-2 ${step >= 3 ? 'border-red-500/50 bg-red-500/10 text-red-300' : 'border-brand-border/50 bg-black/20 text-brand-muted'}`}>
                                        <span className="text-[10px] uppercase opacity-50 block mb-1 flex justify-between">
                                            <span>11:15:47.004 AM</span>
                                            {step >= 3 && <XCircle className="h-3 w-3 text-red-400" />}
                                        </span>
                                        <span className="font-bold">[REPLACEMENT_AUTHORIZED]</span> "agent_b"
                                        {step >= 3 && <div className="mt-1 text-red-400 font-bold">409 CONFLICT: Terminal state reached</div>}
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT PANE */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg h-96">
                    <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-3">
                        <Database className="h-4 w-4 text-brand-muted" />
                        <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Materialized State (JSON)</span>
                    </div>
                    <div className="p-4 font-mono text-sm h-full overflow-y-auto bg-[#0d1117] text-gray-300">
                        <div>
                            <span className="text-white">{"{"}</span>
                            <div className="pl-4">
                                <span className="text-[#7ee787]">"entity_id"</span>: <span className="text-[#a5d6ff]">"order_99X"</span>,
                                <br />
                                <span className="text-[#7ee787]">"rev"</span>: <motion.span animate={{ color: step >= 3 ? "#79c0ff" : "#7ee787" }}>{step >= 3 ? "12" : "11"}</motion.span>,
                                <br />
                                <span className="text-[#7ee787]">"state_json"</span>: <span className="text-white">{"{"}</span>
                                <div className="pl-4">
                                    <span className="text-[#7ee787]">"status"</span>: <span className="text-[#a5d6ff]">"disputed"</span>,
                                    <br />
                                    <motion.div animate={step >= 3 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(126,231,135,0.2)", "rgba(0,0,0,0)"] } : {}} transition={{ duration: 1.5 }} className="inline-block w-full">
                                        <span className="text-[#7ee787]">"resolution"</span>: <motion.span animate={{ color: step >= 3 ? "#a5d6ff" : "#8b949e" }}>{step >= 3 ? '"refund_processing"' : "null"}</motion.span>,
                                    </motion.div>
                                    <motion.div animate={step >= 3 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(126,231,135,0.2)", "rgba(0,0,0,0)"] } : {}} transition={{ duration: 1.5 }} className="inline-block w-full">
                                        <span className="text-[#7ee787]">"resolved_by"</span>: <motion.span animate={{ color: step >= 3 ? "#a5d6ff" : "#8b949e" }}>{step >= 3 ? '"agent_a"' : "null"}</motion.span>
                                    </motion.div>
                                </div>
                                <span className="text-white">{"}"}</span>
                            </div>
                            <span className="text-white">{"}"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function TimeTravelTab() {
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const runSimulation = () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setStep(0);
        setTimeout(() => { setStep(1); }, 1500); // Start moving slider
        setTimeout(() => { setStep(2); setIsPlaying(false); }, 3000); // Fully rewound
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-xl font-bold text-white">Time Travel Audit</h3>
                    <p className="text-sm text-brand-muted">An agent hallucinates a loan denial. We rewind state to see exactly why it happened.</p>
                </div>
                <button
                    onClick={runSimulation}
                    disabled={isPlaying}
                    className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all ${isPlaying ? "bg-brand-surface/50 cursor-not-allowed opacity-50" : "bg-brand-accent hover:bg-brand-accent/80 hover:shadow-glow"
                        }`}
                >
                    <Play className={`h-4 w-4 ${isPlaying ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`} />
                    {isPlaying ? "Rewinding..." : step === 2 ? "Run Again" : "Run Simulation"}
                </button>
            </div>

            <div className="w-full mb-6 p-4 rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono text-brand-muted uppercase">
                    <span>Dec 10, 08:00 AM (T-4h)</span>
                    <span>Current Time (12:00 PM)</span>
                </div>
                <div className="relative h-2 w-full bg-black rounded-full overflow-hidden border border-brand-border">
                    <motion.div
                        className="absolute top-0 bottom-0 left-0 bg-brand-accent rounded-full"
                        initial={{ right: 0 }}
                        animate={{ right: step >= 1 ? "100%" : "0%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                </div>
                <div className="flex justify-between text-xs text-white">
                    <span className={step >= 1 ? "text-brand-accent font-bold" : "opacity-50"}>Point of Audit Decision</span>
                    <span className={step === 0 ? "text-brand-accent font-bold" : "opacity-50"}>Final State (Denied)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* LEFT PANE */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg h-80">
                    <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-3">
                        <Terminal className="h-4 w-4 text-brand-muted" />
                        <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Underwriting Agent</span>
                    </div>
                    <div className="p-4 font-mono text-sm h-full overflow-y-auto flex flex-col gap-3">
                        <div className="text-brand-muted">
                            <span className="text-green-400">agent-underwriter</span><span className="text-white">:</span><span className="text-blue-400">~</span>$ log tail
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 0 ? (
                                <motion.div key="current" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 mt-2 p-3 rounded bg-red-500/10 border border-red-500/20">
                                    <div className="font-bold flex gap-1 items-center"><XCircle className="h-4 w-4" /> LOAN DENIED</div>
                                    Reason: High Risk Score. Auto-rejection policy triggered.
                                </motion.div>
                            ) : (
                                <motion.div key="past" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-white mt-2 p-3 rounded bg-black/40 border border-brand-border">
                                    <div className="flex gap-2 text-brand-accent animate-pulse mb-2">▶ Analyzing loan_app_444...</div>
                                    Reading current state variables...<br />
                                    <span className="text-yellow-400">Warning: Risk score is high. Review required.</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* MIDDLE PANE */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg h-80">
                    <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-3">
                        <History className="h-4 w-4 text-brand-muted" />
                        <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Provenance Trace</span>
                    </div>
                    <div className="p-4 font-mono text-xs h-full overflow-y-auto flex flex-col gap-3 relative">
                        <div className="absolute top-0 right-4 p-2 bg-brand-surface/80 rounded-b text-[10px] text-brand-muted border-b border-x border-brand-border">Statis Event Log</div>

                        <motion.div animate={{ opacity: step >= 1 ? 1 : 0.5 }} className={`p-3 rounded border ${step >= 1 ? 'border-brand-accent/50 bg-brand-accent/10 shadow-[0_0_15px_rgba(20,220,200,0.2)] text-white' : 'border-brand-border/50 bg-black/20 text-brand-muted'} mt-6`}>
                            <span className={`text-[10px] uppercase block mb-1 font-bold ${step >= 1 ? 'text-brand-accent' : 'opacity-50'}`}>08:00:15 AM (Audit Point)</span>
                            {"{"}"event": <span className={step >= 1 ? "text-yellow-400" : ""}>"risk_score_updated"</span>, "score": 580, "source": "equifax_webhook"{"}"}
                        </motion.div>

                        <motion.div animate={{ opacity: step === 0 ? 1 : 0.3 }} className="p-3 rounded border border-brand-border/50 bg-black/20 text-brand-muted">
                            <span className="text-[10px] uppercase opacity-50 block mb-1">08:05:01 AM</span>
                            {"{"}"event": "decision_rendered", "result": "denied"{"}"}
                        </motion.div>
                    </div>
                </div>

                {/* RIGHT PANE */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/40 backdrop-blur-md shadow-lg h-80">
                    <div className="flex items-center gap-2 border-b border-brand-border bg-black/40 px-4 py-3">
                        <Database className="h-4 w-4 text-brand-muted" />
                        <span className="text-xs font-mono font-medium text-brand-muted uppercase tracking-wider">Materialized State (JSON)</span>
                    </div>
                    <div className="p-4 font-mono text-sm h-full overflow-y-auto bg-[#0d1117] text-gray-300">
                        <div>
                            <span className="text-white">{"{"}</span>
                            <div className="pl-4">
                                <span className="text-[#7ee787]">"entity_id"</span>: <span className="text-[#a5d6ff]">"loan_app_444"</span>,
                                <br />
                                <span className="text-[#7ee787]">"rev"</span>: <motion.span animate={{ color: step >= 1 ? "#79c0ff" : "#7ee787" }}>{step >= 1 ? "42" : "45"}</motion.span>,
                                <br />
                                <span className="text-[#7ee787]">"state_json"</span>: <span className="text-white">{"{"}</span>
                                <div className="pl-4">
                                    <motion.div animate={step >= 1 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(126,231,135,0.2)", "rgba(0,0,0,0)"] } : {}} transition={{ duration: 1.5 }} className="inline-block w-full">
                                        <span className="text-[#7ee787]">"status"</span>: <motion.span animate={{ color: step >= 1 ? "#a5d6ff" : "#ff7b72" }}>{step >= 1 ? '"high_risk_flag"' : '"denied"'}</motion.span>,
                                    </motion.div>
                                    <motion.div animate={step >= 1 ? { backgroundColor: ["rgba(0,0,0,0)", "rgba(126,231,135,0.2)", "rgba(0,0,0,0)"] } : {}} transition={{ duration: 1.5 }} className="inline-block w-full">
                                        <span className="text-[#7ee787]">"credit_score"</span>: <motion.span animate={{ color: step >= 1 ? "#a5d6ff" : "#79c0ff" }}>580</motion.span>,
                                    </motion.div>
                                    <span className="text-[#7ee787]">"income_verified"</span>: <span className="text-[#79c0ff]">true</span>
                                </div>
                                <span className="text-white">{"}"}</span>
                            </div>
                            <span className="text-white">{"}"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function DataSwarmTab() {
    const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7>(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const runSimulation = () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setStep(0);
        setTimeout(() => { setStep(1); }, 500);  // ETL -> Statis
        setTimeout(() => { setStep(2); }, 1200); // Statis -> Anomaly
        setTimeout(() => { setStep(3); }, 1900); // Anomaly calc
        setTimeout(() => { setStep(4); }, 2900); // Anomaly detects
        setTimeout(() => { setStep(5); }, 3900); // Anomaly -> Statis
        setTimeout(() => { setStep(6); }, 4400); // Statis -> Swarm
        setTimeout(() => { setStep(7); }, 5100); // Swarm wakes
        setTimeout(() => { setIsPlaying(false); }, 6500);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-xl font-bold text-white">Data-Triggered Swarm</h3>
                    <p className="text-sm text-brand-muted">A highly visual node-based observability map of "Zero Polling" Fan-Out Orchestration.</p>
                </div>
                <button
                    onClick={runSimulation}
                    disabled={isPlaying}
                    className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all ${isPlaying ? "bg-brand-surface/50 cursor-not-allowed opacity-50" : "bg-brand-accent hover:bg-brand-accent/80 hover:shadow-glow"
                        }`}
                >
                    <Play className={`h-4 w-4 ${isPlaying ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`} />
                    {isPlaying ? "Simulating..." : step === 7 ? "Run Again" : "Run Simulation"}
                </button>
            </div>

            <div className="relative w-full h-[32rem] bg-gray-900/60 rounded-3xl border border-brand-border/50 overflow-hidden backdrop-blur-md shadow-2xl">
                {/* SVG Connecting Lines  */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {/* Base Lines */}
                    <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="50%" y1="50%" x2="50%" y2="20%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="50%" y1="50%" x2="80%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />

                    {/* Step 1 Particle (ETL to Statis) */}
                    <AnimatePresence>
                        {step === 1 && (
                            <motion.circle r="5" fill="#3b82f6" initial={{ cx: "20%", cy: "50%", opacity: 0 }} animate={{ cx: "50%", cy: "50%", opacity: [0, 1, 1, 0] }} transition={{ duration: 0.7, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #3b82f6)" }} />
                        )}
                    </AnimatePresence>

                    {/* Step 2 Particle (Statis to Anomaly) */}
                    <AnimatePresence>
                        {step === 2 && (
                            <motion.circle r="5" fill="#3b82f6" initial={{ cx: "50%", cy: "50%", opacity: 0 }} animate={{ cx: "50%", cy: "20%", opacity: [0, 1, 1, 0] }} transition={{ duration: 0.7, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #3b82f6)" }} />
                        )}
                    </AnimatePresence>

                    {/* Step 5 Particle (Anomaly to Statis) */}
                    <AnimatePresence>
                        {step === 5 && (
                            <motion.circle r="5" fill="#ef4444" initial={{ cx: "50%", cy: "20%", opacity: 0 }} animate={{ cx: "50%", cy: "50%", opacity: [0, 1, 1, 0] }} transition={{ duration: 0.5, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #ef4444)" }} />
                        )}
                    </AnimatePresence>

                    {/* Step 6 Particles (Statis to Swarm) */}
                    <AnimatePresence>
                        {step === 6 && (
                            <>
                                <motion.circle r="5" fill="#ef4444" initial={{ cx: "50%", cy: "50%", opacity: 0 }} animate={{ cx: "80%", cy: "25%", opacity: [0, 1, 1, 0] }} transition={{ duration: 0.7, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #ef4444)" }} />
                                <motion.circle r="5" fill="#ef4444" initial={{ cx: "50%", cy: "50%", opacity: 0 }} animate={{ cx: "80%", cy: "50%", opacity: [0, 1, 1, 0] }} transition={{ duration: 0.7, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #ef4444)" }} />
                                <motion.circle r="5" fill="#ef4444" initial={{ cx: "50%", cy: "50%", opacity: 0 }} animate={{ cx: "80%", cy: "75%", opacity: [0, 1, 1, 0] }} transition={{ duration: 0.7, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #ef4444)" }} />
                            </>
                        )}
                    </AnimatePresence>
                </svg>

                {/* DOM Nodes */}

                {/* 1. FAR LEFT: Data Pipeline */}
                <div className="absolute top-[50%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 w-56">
                    <div className="flex flex-col items-center p-5 bg-gray-900/90 border border-brand-border/60 rounded-2xl shadow-xl backdrop-blur-xl">
                        <Database className="w-8 h-8 text-brand-muted mb-3" />
                        <span className="text-sm font-bold text-white uppercase tracking-wider">ETL Pipeline</span>
                        <AnimatePresence mode="wait">
                            {step >= 1 ? (
                                <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                    Sync Complete
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-[10px] font-mono text-brand-muted">
                                    Next sync: 6:00 AM
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. TOP CENTER: Anomaly Agent */}
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 w-64">
                    <motion.div
                        animate={step >= 3 ? { scale: [1, 1.05, 1], borderColor: step >= 4 ? ["rgba(255,255,255,0.1)", "rgba(239,68,68,0.5)", "rgba(255,255,255,0.1)"] : ["rgba(255,255,255,0.1)", "rgba(234,179,8,0.5)", "rgba(255,255,255,0.1)"] } : {}}
                        className={`flex flex-col items-center p-4 bg-gray-900/90 border rounded-xl shadow-lg backdrop-blur-xl relative overflow-hidden transition-all ${step >= 4 ? "border-red-500/40" : step === 3 ? "border-yellow-500/40" : "border-brand-border/40"}`}
                    >
                        <AnimatePresence>
                            {step === 3 && (
                                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
                            )}
                            {step >= 4 && (
                                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-red-500/10 pointer-events-none" />
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <Bot className="w-5 h-5 text-brand-muted" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Anomaly Agent</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {step >= 4 ? (
                                <motion.div key="detected" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-mono text-red-400 font-bold whitespace-nowrap">
                                    🔴 -22% Variance Detected
                                </motion.div>
                            ) : step === 3 ? (
                                <motion.div key="active" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-mono text-yellow-500">
                                    🟡 Active: Running ML models...
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-mono text-brand-muted">
                                    💤 Idle
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* 3. CENTER: Statis Hub */}
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 w-64">
                    <motion.div
                        animate={step >= 6 ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(239,68,68,0)", "0 0 30px rgba(239,68,68,0.5)", "0 0 15px rgba(239,68,68,0.2)"] } : step >= 2 ? { scale: [1, 1.02, 1], boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 20px rgba(59,130,246,0.3)", "0 0 10px rgba(59,130,246,0.1)"] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`flex flex-col items-center justify-center p-6 bg-gray-900/90 border rounded-edit-2xl shadow-2xl backdrop-blur-xl ${step >= 6 ? "border-red-500/50" : step >= 2 ? "border-blue-500/40" : "border-gray-500/30 rounded-2xl"}`}
                    >
                        <Activity className={`w-10 h-10 mb-3 ${step >= 6 ? "text-red-400 animate-pulse" : step >= 2 ? "text-blue-400" : "text-gray-500"}`} />
                        <span className="text-lg font-bold text-white uppercase tracking-widest mb-1">STATIS</span>
                        <AnimatePresence mode="wait">
                            {step >= 6 ? (
                                <motion.div key="anomaly" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-xs font-bold text-red-200 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                                    State: Anomaly Detected
                                </motion.div>
                            ) : step >= 2 ? (
                                <motion.div key="metrics" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-xs font-bold text-blue-200 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                    State: Metrics Updated
                                </motion.div>
                            ) : (
                                <motion.div key="healthy" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-xs font-bold text-gray-300 bg-gray-500/20 px-3 py-1 rounded-full border border-gray-500/30">
                                    State: Awaiting Sync
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* 4. FAR RIGHT: The Swarm Nodes */}

                {/* Finance Agent */}
                <div className="absolute top-[25%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 w-56">
                    <motion.div
                        animate={step >= 7 ? { scale: [1, 1.05, 1], borderColor: ["rgba(255,255,255,0.1)", "rgba(234,179,8,0.5)", "rgba(255,255,255,0.1)"] } : {}}
                        className={`flex flex-col p-4 bg-gray-900/90 border rounded-xl shadow-lg backdrop-blur-xl relative overflow-hidden transition-all ${step >= 7 ? "border-yellow-500/40" : "border-brand-border/40"}`}
                    >
                        <AnimatePresence>
                            {step === 7 && (
                                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <Terminal className="w-4 h-4 text-brand-muted" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Finance Agent</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {step >= 7 ? (
                                <motion.div key="active" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-mono text-yellow-400">
                                    🟡 Active: Querying Stripe...
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-mono text-brand-muted">
                                    💤 Idle
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Product Agent */}
                <div className="absolute top-[50%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 w-56">
                    <motion.div
                        animate={step >= 7 ? { scale: [1, 1.05, 1], borderColor: ["rgba(255,255,255,0.1)", "rgba(234,179,8,0.5)", "rgba(255,255,255,0.1)"] } : {}}
                        className={`flex flex-col p-4 bg-gray-900/90 border rounded-xl shadow-lg backdrop-blur-xl relative overflow-hidden transition-all ${step >= 7 ? "border-yellow-500/40" : "border-brand-border/40"}`}
                    >
                        <AnimatePresence>
                            {step === 7 && (
                                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <Terminal className="w-4 h-4 text-brand-muted" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Product Agent</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {step >= 7 ? (
                                <motion.div key="active" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-mono text-yellow-400">
                                    🟡 Active: Scanning Datadog...
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-mono text-brand-muted">
                                    💤 Idle
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Marketing Agent */}
                <div className="absolute top-[75%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 w-56">
                    <motion.div
                        animate={step >= 7 ? { scale: [1, 1.05, 1], borderColor: ["rgba(255,255,255,0.1)", "rgba(234,179,8,0.5)", "rgba(255,255,255,0.1)"] } : {}}
                        className={`flex flex-col p-4 bg-gray-900/90 border rounded-xl shadow-lg backdrop-blur-xl relative overflow-hidden transition-all ${step >= 7 ? "border-yellow-500/40" : "border-brand-border/40"}`}
                    >
                        <AnimatePresence>
                            {step === 7 && (
                                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <Terminal className="w-4 h-4 text-brand-muted" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Marketing Agent</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {step >= 7 ? (
                                <motion.div key="active" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-mono text-yellow-400">
                                    🟡 Active: Auditing Ad Spend...
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-mono text-brand-muted">
                                    💤 Idle
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

            </div>
        </motion.div>
    );
}
