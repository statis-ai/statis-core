"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Headphones, Users, Briefcase, Bot, Truck, CreditCard, FileText, Play } from "lucide-react";

export function UseCaseGallery() {
    const [activePlaybook, setActivePlaybook] = useState<"tone-deaf" | "double-spend" | "time-travel">("tone-deaf");

    return (
        <section className="relative z-10 w-full bg-brand-statist py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Center Heading */}
                <div className="text-center mb-16 mx-auto max-w-3xl">
                    <h2 className="text-sm font-semibold leading-7 text-brand-accent tracking-widest uppercase">
                        Use Cases
                    </h2>
                    <h3 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Built for complex workflows
                    </h3>
                    <p className="mt-4 text-lg text-brand-muted">
                        See how Statis handles race conditions, out-of-order events, and state regressions instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* LEFT COLUMN: Playbook Cards (35%) */}
                    <div className="lg:col-span-4 flex flex-col gap-4 sticky top-24 relative z-20 pointer-events-auto">

                        {/* Tone Deaf AI Card */}
                        <button
                            onClick={() => setActivePlaybook("tone-deaf")}
                            className={`text-left p-5 rounded-2xl border transition-all pointer-events-auto relative ${activePlaybook === "tone-deaf"
                                ? "bg-brand-surface/80 border-brand-accent/50 shadow-[0_0_20px_rgba(20,220,200,0.15)]"
                                : "bg-brand-surface/40 border-brand-border/40 hover:bg-brand-surface/60 hover:border-brand-border"
                                }`}
                        >
                            <div className="relative z-10 pointer-events-none">
                                <h3 className={`text-lg font-bold mb-2 ${activePlaybook === "tone-deaf" ? "text-brand-accent" : "text-white"}`}>
                                    Prevent Tone-Deaf AI
                                </h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    Stop automated outreach instantly when entity context changes—like a Sev-1 outage.
                                </p>
                            </div>
                        </button>

                        {/* Double Spend Swarm Card */}
                        <button
                            onClick={() => setActivePlaybook("double-spend")}
                            className={`text-left p-5 rounded-2xl border transition-all pointer-events-auto relative ${activePlaybook === "double-spend"
                                ? "bg-brand-surface/80 border-brand-accent/50 shadow-[0_0_20px_rgba(20,220,200,0.15)]"
                                : "bg-brand-surface/40 border-brand-border/40 hover:bg-brand-surface/60 hover:border-brand-border"
                                }`}
                        >
                            <div className="relative z-10 pointer-events-none">
                                <h3 className={`text-lg font-bold mb-2 ${activePlaybook === "double-spend" ? "text-brand-accent" : "text-white"}`}>
                                    Resolve Race Conditions
                                </h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    Deterministically referee conflicting actions from autonomous agents to prevent double-spends.
                                </p>
                            </div>
                        </button>

                        {/* Time Travel Audit Card */}
                        <button
                            onClick={() => setActivePlaybook("time-travel")}
                            className={`text-left p-5 rounded-2xl border transition-all pointer-events-auto relative ${activePlaybook === "time-travel"
                                ? "bg-brand-surface/80 border-brand-accent/50 shadow-[0_0_20px_rgba(20,220,200,0.15)]"
                                : "bg-brand-surface/40 border-brand-border/40 hover:bg-brand-surface/60 hover:border-brand-border"
                                }`}
                        >
                            <div className="relative z-10 pointer-events-none">
                                <h3 className={`text-lg font-bold mb-2 ${activePlaybook === "time-travel" ? "text-brand-accent" : "text-white"}`}>
                                    Time-Travel Audit
                                </h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    Mathematically prove exactly what an LLM knew at any given millisecond in the past.
                                </p>
                            </div>
                        </button>
                    </div>

                    {/* RIGHT COLUMN: Dynamic Topology Stage (65%) */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {activePlaybook === "tone-deaf" && <ToneDeafTopology key="tone-deaf" />}
                            {activePlaybook === "double-spend" && <DoubleSpendTopology key="double-spend" />}
                            {activePlaybook === "time-travel" && <TimeTravelTopology key="time-travel" />}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}

function ToneDeafTopology() {
    const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const runSimulation = () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setStep(0);
        setTimeout(() => { setStep(1); }, 1000); // Support -> Statis
        setTimeout(() => { setStep(2); }, 2000); // Statis updates
        setTimeout(() => { setStep(3); }, 3000); // Statis -> Agents
        setTimeout(() => { setStep(4); }, 4000); // Agents block
        setTimeout(() => { setIsPlaying(false); }, 5500);
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
            <div className="flex justify-end mb-4">
                <button onClick={runSimulation} disabled={isPlaying} className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black transition-all ${isPlaying ? "bg-brand-surface/50 cursor-not-allowed opacity-50 text-white" : "bg-brand-accent hover:bg-brand-accent/80"}`}>
                    <Play className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                    {isPlaying ? "Simulating..." : step >= 4 ? "Run Again" : "Run Simulation"}
                </button>
            </div>

            <div className="relative w-full h-[400px] bg-gray-900/60 rounded-3xl border border-brand-border/50 overflow-hidden backdrop-blur-md shadow-2xl">
                {/* SVG Lines */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <svg className="w-full h-[400px]">
                        <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="50%" y1="50%" x2="80%" y2="35%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="50%" y1="50%" x2="80%" y2="65%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />

                        {/* Particle: Support to Statis */}
                        <AnimatePresence>
                            {step === 1 && (
                                <motion.circle r="6" fill="#ef4444" initial={{ cx: "20%", cy: "50%", opacity: 0 }} animate={{ cx: "50%", cy: "50%", opacity: [0, 1, 1, 0] }} transition={{ duration: 1, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #ef4444)" }} />
                            )}
                        </AnimatePresence>

                        {/* Particles: Statis to Agents */}
                        <AnimatePresence>
                            {step === 3 && (
                                <>
                                    <motion.circle r="6" fill="#ef4444" initial={{ cx: "50%", cy: "50%", opacity: 0 }} animate={{ cx: "80%", cy: "35%", opacity: [0, 1, 1, 0] }} transition={{ duration: 1, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #ef4444)" }} />
                                    <motion.circle r="6" fill="#ef4444" initial={{ cx: "50%", cy: "50%", opacity: 0 }} animate={{ cx: "80%", cy: "65%", opacity: [0, 1, 1, 0] }} transition={{ duration: 1, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #ef4444)" }} />
                                </>
                            )}
                        </AnimatePresence>
                    </svg>
                </div>

                {/* Nodes */}
                {/* Left Node: Support Suite */}
                <div className="absolute top-[50%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 w-48">
                    <div className="flex flex-col items-center p-4 bg-gray-900/90 border border-brand-border/60 rounded-xl shadow-xl backdrop-blur-xl">
                        <Headphones className="w-8 h-8 text-brand-muted mb-2" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider text-center">Support Suite</span>
                        {step >= 1 ? (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                                Sev-1 Ticket Created
                            </motion.div>
                        ) : (
                            <div className="mt-2 text-[10px] font-mono text-brand-muted px-2 py-1">Monitoring...</div>
                        )}
                    </div>
                </div>

                {/* Center Node: STATIS Hub */}
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 w-56">
                    <motion.div animate={step >= 2 ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(239,68,68,0)", "0 0 30px rgba(239,68,68,0.5)", "0 0 15px rgba(239,68,68,0.2)"] } : {}} transition={{ duration: 0.5 }} className={`flex flex-col items-center justify-center p-5 bg-gray-900/90 border shadow-2xl backdrop-blur-xl transition-colors ${step >= 2 ? "border-red-500/50 rounded-[2rem]" : "border-gray-500/30 rounded-2xl"}`}>
                        <Activity className={`w-10 h-10 mb-2 ${step >= 2 ? "text-red-400 animate-pulse" : "text-gray-500"}`} />
                        <span className="text-sm font-bold text-white uppercase tracking-widest mb-1">STATIS HUB</span>
                        <AnimatePresence mode="wait">
                            {step >= 2 ? (
                                <motion.div key="red" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[10px] font-bold text-red-200 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/50">
                                    State: [churn_risk: true]
                                </motion.div>
                            ) : (
                                <motion.div key="gray" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[10px] font-bold text-gray-300 bg-gray-500/20 px-3 py-1 rounded-full border border-gray-500/30">
                                    State: Normal
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Right Top Node: Sales Agent */}
                <div className="absolute top-[35%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 w-48">
                    <motion.div animate={step >= 4 ? { borderColor: ["rgba(255,255,255,0.1)", "rgba(239,68,68,0.5)", "rgba(2ef,68,68,0.5)"] } : {}} className={`flex flex-col p-4 bg-gray-900/90 border rounded-xl shadow-lg backdrop-blur-xl transition-all ${step >= 4 ? "border-red-500/50" : "border-brand-border/40"}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-brand-muted" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Sales Agent</span>
                        </div>
                        {step >= 4 ? (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-mono text-red-400 font-bold whitespace-nowrap">
                                ⏸️ Outreach Paused
                            </motion.div>
                        ) : (
                            <div className="text-[10px] font-mono text-yellow-400">🟡 Drafting Upsell...</div>
                        )}
                    </motion.div>
                </div>

                {/* Right Bottom Node: CSM Agent */}
                <div className="absolute top-[65%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 w-48">
                    <motion.div animate={step >= 4 ? { borderColor: ["rgba(255,255,255,0.1)", "rgba(239,68,68,0.5)", "rgba(2ef,68,68,0.5)"] } : {}} className={`flex flex-col p-4 bg-gray-900/90 border rounded-xl shadow-lg backdrop-blur-xl transition-all ${step >= 4 ? "border-red-500/50" : "border-brand-border/40"}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-4 h-4 text-brand-muted" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">CSM Agent</span>
                        </div>
                        {step >= 4 ? (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-mono text-red-400 font-bold whitespace-nowrap">
                                ⏸️ Outreach Paused
                            </motion.div>
                        ) : (
                            <div className="text-[10px] font-mono text-yellow-400">🟡 Scheduling Check-in...</div>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

function DoubleSpendTopology() {
    const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const runSimulation = () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setStep(0);
        setTimeout(() => { setStep(1); }, 500); // Both send to Statis
        setTimeout(() => { setStep(2); }, 1500); // Statis accepts top, rejects bottom
        setTimeout(() => { setStep(3); }, 2500); // Statis -> Stripe
        setTimeout(() => { setStep(4); }, 3500); // Success at Stripe
        setTimeout(() => { setIsPlaying(false); }, 5000);
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
            <div className="flex justify-end mb-4">
                <button onClick={runSimulation} disabled={isPlaying} className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black transition-all ${isPlaying ? "bg-brand-surface/50 cursor-not-allowed opacity-50 text-white" : "bg-brand-accent hover:bg-brand-accent/80"}`}>
                    <Play className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                    {isPlaying ? "Simulating..." : step >= 4 ? "Run Again" : "Run Simulation"}
                </button>
            </div>

            <div className="relative w-full h-[400px] bg-gray-900/60 rounded-3xl border border-brand-border/50 overflow-hidden backdrop-blur-md shadow-2xl">
                {/* SVG Lines */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <svg className="w-full h-[400px]">
                        <line x1="20%" y1="35%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="20%" y1="65%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="50%" y1="50%" x2="80%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />

                        {/* Particle: Upper Bot -> Statis */}
                        <AnimatePresence>
                            {step === 1 && (
                                <motion.circle r="6" fill="#10b981" initial={{ cx: "20%", cy: "35%", opacity: 0 }} animate={{ cx: "50%", cy: "50%", opacity: [0, 1, 1, 0] }} transition={{ duration: 1, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #10b981)" }} />
                            )}
                        </AnimatePresence>

                        {/* Particle: Lower Bot -> Statis */}
                        <AnimatePresence>
                            {step === 1 && (
                                <motion.circle r="6" fill="#10b981" initial={{ cx: "20%", cy: "65%", opacity: 0 }} animate={{ cx: "50%", cy: "50%", opacity: [0, 1, 1, 0] }} transition={{ duration: 1, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #10b981)" }} />
                            )}
                        </AnimatePresence>

                        {/* Bouncing rejection particle for Bottom Bot */}
                        <AnimatePresence>
                            {step === 2 && (
                                <motion.circle r="6" fill="#ef4444" initial={{ cx: "50%", cy: "50%", opacity: 0 }} animate={{ cx: "35%", cy: "58%", opacity: [0, 1, 0] }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ filter: "drop-shadow(0 0 10px #ef4444)" }} />
                            )}
                        </AnimatePresence>

                        {/* Particle: Statis to Stripe */}
                        <AnimatePresence>
                            {step === 3 && (
                                <motion.circle r="6" fill="#10b981" initial={{ cx: "50%", cy: "50%", opacity: 0 }} animate={{ cx: "80%", cy: "50%", opacity: [0, 1, 1, 0] }} transition={{ duration: 1, ease: "linear" }} style={{ filter: "drop-shadow(0 0 10px #10b981)" }} />
                            )}
                        </AnimatePresence>
                    </svg>
                </div>

                {/* Nodes */}
                {/* Left Top: Support Bot */}
                <div className="absolute top-[35%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 w-48">
                    <motion.div animate={step >= 2 ? { borderColor: "rgba(16, 185, 129, 0.5)" } : {}} className="flex flex-col p-4 bg-gray-900/90 border border-brand-border/40 rounded-xl shadow-xl backdrop-blur-xl transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Bot className={`w-4 h-4 ${step >= 2 ? "text-green-400" : "text-brand-muted"}`} />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Support Bot</span>
                        </div>
                        {step >= 2 ? (
                            <div className="text-[10px] font-mono font-bold text-green-400">✅ Action Accepted</div>
                        ) : (
                            <div className="text-[10px] font-mono text-brand-muted">🟡 Refunding $50...</div>
                        )}
                    </motion.div>
                </div>

                {/* Left Bottom: Logistics Bot */}
                <div className="absolute top-[65%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 w-48">
                    <motion.div animate={step >= 2 ? { borderColor: "rgba(239, 68, 68, 0.5)" } : {}} className="flex flex-col p-4 bg-gray-900/90 border border-brand-border/40 rounded-xl shadow-xl backdrop-blur-xl transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Truck className={`w-4 h-4 ${step >= 2 ? "text-red-400" : "text-brand-muted"}`} />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Logistics Bot</span>
                        </div>
                        {step >= 2 ? (
                            <motion.div initial={{ x: -5 }} animate={{ x: [0, -5, 5, -5, 5, 0] }} transition={{ duration: 0.4 }} className="text-[10px] font-mono font-bold text-red-500">
                                ❌ Action Rejected
                            </motion.div>
                        ) : (
                            <div className="text-[10px] font-mono text-brand-muted">🟡 Sending Replacement...</div>
                        )}
                    </motion.div>
                </div>

                {/* Center Node: STATIS Hub */}
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 w-56">
                    <motion.div animate={step >= 2 ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(16,185,129,0)", "0 0 30px rgba(16,185,129,0.5)", "0 0 15px rgba(16,185,129,0.2)"] } : {}} transition={{ duration: 0.5 }} className={`flex flex-col items-center justify-center p-5 bg-gray-900/90 border shadow-2xl backdrop-blur-xl transition-colors ${step >= 2 ? "border-green-500/50 rounded-[2rem]" : "border-gray-500/30 rounded-2xl"}`}>
                        <Activity className={`w-10 h-10 mb-2 ${step >= 2 ? "text-green-400" : "text-gray-500"}`} />
                        <span className="text-sm font-bold text-white uppercase tracking-widest mb-1">STATIS HUB</span>
                        <AnimatePresence mode="wait">
                            {step >= 2 ? (
                                <motion.div key="green" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[10px] font-bold text-green-200 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/50">
                                    State: Refund_Processing
                                </motion.div>
                            ) : (
                                <motion.div key="gray" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[10px] font-bold text-gray-300 bg-gray-500/20 px-3 py-1 rounded-full border border-gray-500/30">
                                    State: Open
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Right Node: Stripe API */}
                <div className="absolute top-[50%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 w-48">
                    <div className="flex flex-col items-center p-4 bg-gray-900/90 border border-brand-border/60 rounded-xl shadow-xl backdrop-blur-xl transition-all">
                        <CreditCard className="w-8 h-8 text-brand-muted mb-2" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider text-center">Stripe API</span>
                        {step >= 4 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[10px] font-mono font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                                $50 Refunded
                            </motion.div>
                        ) : (
                            <div className="mt-2 text-[10px] font-mono text-brand-muted px-2 py-1">Awaiting Calls...</div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function TimeTravelTopology() {
    // We use a slider directly for TimeTravel
    const [sliderValue, setSliderValue] = useState(100);
    // Value: 100 = Current (Denied), 0 = Past (Pending / Good context)

    const isRewinded = sliderValue < 50;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full h-[450px]">
            <div className="relative w-full h-full bg-gray-900/60 rounded-3xl border border-brand-border/50 overflow-hidden backdrop-blur-md shadow-2xl flex flex-col justify-between">

                {/* SVG Lines */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <svg className="w-full h-[350px]">
                        <line x1="50%" y1="25%" x2="50%" y2="80%" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
                        {sliderValue < 90 && sliderValue > 10 && (
                            <motion.circle r="6" fill="#14dcc8" cx="50%" cy={`${sliderValue * 0.55 + 25}%`} style={{ filter: "drop-shadow(0 0 10px #14dcc8)" }} />
                        )}
                    </svg>
                </div>

                <div className="relative flex-1 flex flex-col items-center justify-center gap-16 pt-10 pb-6 overflow-y-auto">
                    {/* Top Node: AI Loan Underwriter */}
                    <div className="z-10 w-64">
                        <motion.div animate={{ borderColor: isRewinded ? "rgba(20, 220, 200, 0.4)" : "rgba(239, 68, 68, 0.4)" }} className="flex flex-col items-center p-4 bg-gray-900/90 border rounded-xl shadow-xl backdrop-blur-xl transition-colors">
                            <FileText className="w-8 h-8 text-brand-muted mb-2" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider text-center">AI Loan Underwriter</span>
                            <div className="mt-3 w-full p-2 bg-black/40 rounded text-left border border-brand-border/40 font-mono">
                                <span className="text-[10px] text-brand-muted block mb-1">State Variables (Read-Only)</span>
                                <div className="text-[10px] flex justify-between">
                                    <span className="text-white">Risk Score:</span>
                                    <span className={isRewinded ? "text-brand-accent font-bold" : "text-red-400 font-bold"}>{isRewinded ? "Low (750)" : "High (580)"}</span>
                                </div>
                                <div className="text-[10px] flex justify-between mt-1">
                                    <span className="text-white">Action:</span>
                                    <span className={isRewinded ? "text-brand-accent" : "text-red-400"}>{isRewinded ? "Analyzing..." : "Auto-Reject"}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Center Node: STATIS Hub */}
                    <div className="z-10 w-64">
                        <motion.div animate={{ borderColor: isRewinded ? "rgba(20, 220, 200, 0.4)" : "rgba(239, 68, 68, 0.4)" }} className="flex flex-col items-center justify-center p-5 bg-gray-900/90 border rounded-2xl shadow-2xl backdrop-blur-xl transition-colors">
                            <Activity className={`w-8 h-8 mb-2 ${isRewinded ? "text-brand-accent" : "text-red-400"}`} />
                            <span className="text-sm font-bold text-white uppercase tracking-widest mb-1">STATIS HUB</span>
                            <div className={`mt-1 text-[10px] font-bold px-3 py-1 rounded-full border ${isRewinded ? "bg-brand-accent/20 text-brand-accent border-brand-accent/50" : "bg-red-500/20 text-red-200 border-red-500/50"}`}>
                                State: {isRewinded ? "Pending Review" : "Denied"}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Scrubber */}
                <div className="relative z-10 w-full p-6 bg-black/60 border-t border-brand-border/50 backdrop-blur-xl mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between text-xs font-mono text-brand-muted uppercase mb-4">
                        <span className={isRewinded ? "text-brand-accent font-bold drop-shadow-[0_0_8px_rgba(20,220,200,0.8)]" : ""}>T-4 Hours (Past)</span>
                        <span className="text-white font-semibold">Drag to rewind</span>
                        <span className={!isRewinded ? "text-red-400 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : ""}>Present (Denied)</span>
                    </div>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                      .statis-slider::-webkit-slider-thumb {
                        appearance: none;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        background: white;
                        cursor: grab;
                        border: 3px solid #14dcc8;
                        box-shadow: 0 0 10px rgba(20, 220, 200, 0.5);
                        transition: transform 0.1s;
                      }
                      .statis-slider::-webkit-slider-thumb:hover {
                        transform: scale(1.15);
                      }
                      .statis-slider::-webkit-slider-thumb:active {
                        cursor: grabbing;
                        transform: scale(0.9);
                      }
                      .statis-slider::-moz-range-thumb {
                        appearance: none;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        background: white;
                        cursor: grab;
                        border: 3px solid #14dcc8;
                        box-shadow: 0 0 10px rgba(20, 220, 200, 0.5);
                        transition: transform 0.1s;
                      }
                      .statis-slider::-moz-range-thumb:hover {
                        transform: scale(1.15);
                      }
                      .statis-slider::-moz-range-thumb:active {
                        cursor: grabbing;
                        transform: scale(0.9);
                      }
                    `}} />
                    <input
                        type="range"
                        min="0" max="100"
                        value={sliderValue}
                        onChange={(e) => setSliderValue(parseInt(e.target.value))}
                        className="w-full h-3 rounded-full appearance-none cursor-pointer statis-slider"
                        style={{
                            background: `linear-gradient(to right, #14dcc8 ${sliderValue}%, #333 100%)`
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
