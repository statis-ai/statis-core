"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Database, Activity, Play, Bot } from "lucide-react";

export function HeroDataSwarm() {
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
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="w-full">
            <div className="mb-4 flex flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-4 px-2">
                <div>
                    <h3 className="text-xl font-bold text-white">Data-Triggered Swarm</h3>
                    <p className="text-sm text-brand-muted">"Zero Polling" Fan-Out Orchestration.</p>
                </div>
                <button
                    onClick={runSimulation}
                    disabled={isPlaying}
                    className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black transition-all w-full sm:w-auto justify-center ${isPlaying ? "bg-brand-surface/50 cursor-not-allowed opacity-50 text-white" : "bg-brand-accent hover:bg-brand-accent/80 hover:shadow-glow"
                        }`}
                >
                    <Play className={`h-4 w-4 ${isPlaying ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`} />
                    {isPlaying ? "Simulating..." : step === 7 ? "Run Again" : "Run Simulation"}
                </button>
            </div>

            <div className="relative w-full h-[28rem] sm:h-[32rem] bg-gray-900/60 rounded-3xl border border-brand-border/50 overflow-hidden backdrop-blur-md shadow-2xl">
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
                <div className="absolute top-[50%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 w-48 sm:w-56">
                    <div className="flex flex-col items-center p-3 sm:p-5 bg-gray-900/90 border border-brand-border/60 rounded-2xl shadow-xl backdrop-blur-xl">
                        <Database className="w-6 h-6 sm:w-8 sm:h-8 text-brand-muted mb-2 sm:mb-3" />
                        <span className="text-[10px] sm:text-sm font-bold text-white uppercase tracking-wider text-center">ETL Pipeline</span>
                        <AnimatePresence mode="wait">
                            {step >= 1 ? (
                                <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[9px] sm:text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                    Sync Complete
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-[9px] sm:text-[10px] font-mono text-brand-muted">
                                    Next sync: 6:00 AM
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. TOP CENTER: Anomaly Agent */}
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 w-56 sm:w-64">
                    <motion.div
                        animate={step >= 3 ? { scale: [1, 1.05, 1], borderColor: step >= 4 ? ["rgba(255,255,255,0.1)", "rgba(239,68,68,0.5)", "rgba(255,255,255,0.1)"] : ["rgba(255,255,255,0.1)", "rgba(234,179,8,0.5)", "rgba(255,255,255,0.1)"] } : {}}
                        className={`flex flex-col items-center p-3 sm:p-4 bg-gray-900/90 border rounded-xl shadow-lg backdrop-blur-xl relative overflow-hidden transition-all ${step >= 4 ? "border-red-500/40" : step === 3 ? "border-yellow-500/40" : "border-brand-border/40"}`}
                    >
                        <AnimatePresence>
                            {step === 3 && (
                                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
                            )}
                            {step >= 4 && (
                                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-red-500/10 pointer-events-none" />
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-1 sm:gap-2 mb-2 relative z-10">
                            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-brand-muted" />
                            <span className="text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-wider">Anomaly Agent</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {step >= 4 ? (
                                <motion.div key="detected" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] sm:text-[11px] font-mono text-red-400 font-bold whitespace-nowrap">
                                    🔴 -22% Variance Detected
                                </motion.div>
                            ) : step === 3 ? (
                                <motion.div key="active" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] sm:text-[11px] font-mono text-yellow-500 whitespace-nowrap">
                                    🟡 Running ML models...
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] sm:text-[11px] font-mono text-brand-muted">
                                    💤 Idle
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* 3. CENTER: Statis Hub */}
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 w-56 sm:w-64">
                    <motion.div
                        animate={step >= 6 ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(239,68,68,0)", "0 0 30px rgba(239,68,68,0.5)", "0 0 15px rgba(239,68,68,0.2)"] } : step >= 2 ? { scale: [1, 1.02, 1], boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 20px rgba(59,130,246,0.3)", "0 0 10px rgba(59,130,246,0.1)"] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-900/90 border shadow-2xl backdrop-blur-xl transition-colors ${step >= 6 ? "border-red-500/50 rounded-[2rem]" : step >= 2 ? "border-blue-500/40 rounded-[2rem]" : "border-gray-500/30 rounded-2xl"}`}
                    >
                        <Activity className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 ${step >= 6 ? "text-red-400 animate-pulse" : step >= 2 ? "text-blue-400" : "text-gray-500"}`} />
                        <span className="text-base sm:text-lg font-bold text-white uppercase tracking-widest mb-1">STATIS</span>
                        <AnimatePresence mode="wait">
                            {step >= 6 ? (
                                <motion.div key="anomaly" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[10px] sm:text-xs font-bold text-red-200 bg-red-500/20 px-2 sm:px-3 py-1 rounded-full border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] text-center">
                                    State: Anomaly Detected
                                </motion.div>
                            ) : step >= 2 ? (
                                <motion.div key="metrics" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[10px] sm:text-xs font-bold text-blue-200 bg-blue-500/20 px-2 sm:px-3 py-1 rounded-full border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] text-center">
                                    State: Metrics Updated
                                </motion.div>
                            ) : (
                                <motion.div key="healthy" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-2 text-[10px] sm:text-xs font-bold text-gray-300 bg-gray-500/20 px-2 sm:px-3 py-1 rounded-full border border-gray-500/30 text-center">
                                    State: Awaiting Sync
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* 4. FAR RIGHT: The Swarm Nodes */}

                {/* Finance Agent */}
                <div className="absolute top-[25%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 w-48 sm:w-56">
                    <motion.div
                        animate={step >= 7 ? { scale: [1, 1.05, 1], borderColor: ["rgba(255,255,255,0.1)", "rgba(234,179,8,0.5)", "rgba(255,255,255,0.1)"] } : {}}
                        className={`flex flex-col p-3 sm:p-4 bg-gray-900/90 border rounded-xl shadow-lg backdrop-blur-xl relative overflow-hidden transition-all ${step >= 7 ? "border-yellow-500/40" : "border-brand-border/40"}`}
                    >
                        <AnimatePresence>
                            {step === 7 && (
                                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-1 sm:gap-2 mb-2 relative z-10">
                            <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-brand-muted" />
                            <span className="text-[9px] sm:text-[11px] font-bold text-white uppercase tracking-wider">Finance Agent</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {step >= 7 ? (
                                <motion.div key="active" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] sm:text-[11px] font-mono text-yellow-400 whitespace-nowrap">
                                    🟡 Querying Stripe...
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] sm:text-[11px] font-mono text-brand-muted">
                                    💤 Idle
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Product Agent */}
                <div className="absolute top-[50%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 w-48 sm:w-56">
                    <motion.div
                        animate={step >= 7 ? { scale: [1, 1.05, 1], borderColor: ["rgba(255,255,255,0.1)", "rgba(234,179,8,0.5)", "rgba(255,255,255,0.1)"] } : {}}
                        className={`flex flex-col p-3 sm:p-4 bg-gray-900/90 border rounded-xl shadow-lg backdrop-blur-xl relative overflow-hidden transition-all ${step >= 7 ? "border-yellow-500/40" : "border-brand-border/40"}`}
                    >
                        <AnimatePresence>
                            {step === 7 && (
                                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-1 sm:gap-2 mb-2 relative z-10">
                            <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-brand-muted" />
                            <span className="text-[9px] sm:text-[11px] font-bold text-white uppercase tracking-wider">Product Agent</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {step >= 7 ? (
                                <motion.div key="active" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] sm:text-[11px] font-mono text-yellow-400 whitespace-nowrap">
                                    🟡 Scanning Datadog...
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] sm:text-[11px] font-mono text-brand-muted">
                                    💤 Idle
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Marketing Agent */}
                <div className="absolute top-[75%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10 w-48 sm:w-56">
                    <motion.div
                        animate={step >= 7 ? { scale: [1, 1.05, 1], borderColor: ["rgba(255,255,255,0.1)", "rgba(234,179,8,0.5)", "rgba(255,255,255,0.1)"] } : {}}
                        className={`flex flex-col p-3 sm:p-4 bg-gray-900/90 border rounded-xl shadow-lg backdrop-blur-xl relative overflow-hidden transition-all ${step >= 7 ? "border-yellow-500/40" : "border-brand-border/40"}`}
                    >
                        <AnimatePresence>
                            {step === 7 && (
                                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-yellow-500/10 pointer-events-none" />
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-1 sm:gap-2 mb-2 relative z-10">
                            <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-brand-muted" />
                            <span className="text-[9px] sm:text-[11px] font-bold text-white uppercase tracking-wider text-center">Marketing Agent</span>
                        </div>
                        <AnimatePresence mode="wait">
                            {step >= 7 ? (
                                <motion.div key="active" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] sm:text-[11px] font-mono text-yellow-400 whitespace-nowrap">
                                    🟡 Auditing Spend...
                                </motion.div>
                            ) : (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] sm:text-[11px] font-mono text-brand-muted">
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
