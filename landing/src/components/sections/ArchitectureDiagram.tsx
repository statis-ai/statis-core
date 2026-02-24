"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Database, Server, Webhook, ArrowRight, Activity } from "lucide-react";

export function ArchitectureDiagram() {
    return (
        <section id="architecture" className="relative w-full py-24 bg-[#0A0A0A] text-white overflow-hidden">
            {/* Container */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        The Architecture: Stop Polling, Start Pushing.
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* COLUMN 1: THE PROBLEM */}
                    <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md relative overflow-hidden h-full min-h-[500px]">
                        <h3 className="text-sm font-bold mb-4 text-brand-muted text-center uppercase tracking-wider z-10">
                            Before: Polling & Race Conditions
                        </h3>

                        <div className="relative flex-1 w-full mx-auto max-w-[400px]">
                            {/* Agent Boxes (Top) */}
                            <div className="absolute top-[10%] left-0 w-full flex justify-between z-10">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-[#0A0A0A]">
                                        <Bot className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <span className="text-xs text-brand-muted">Support</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-[#0A0A0A]">
                                        <Bot className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <span className="text-xs text-brand-muted">Sales</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-[#0A0A0A]">
                                        <Bot className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <span className="text-xs text-brand-muted">Billing</span>
                                </div>
                            </div>

                            {/* Database Boxes (Bottom) */}
                            <div className="absolute bottom-[20%] left-0 w-full flex justify-around z-10">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-blue-500/30 bg-[#0A0A0A]">
                                        <Database className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <span className="text-xs text-blue-400 font-medium">Vector DB</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-indigo-500/30 bg-[#0A0A0A]">
                                        <Server className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <span className="text-xs text-indigo-400 font-medium">Postgres</span>
                                </div>
                            </div>

                            {/* Chaotic Arrows & Dots (SVG Overlay) */}
                            <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                {/* Agent X centers: 50, 200, 350 | Y = 80 */}
                                {/* DB X centers: 120, 280 | Y = 280 */}

                                {/* Lines */}
                                <path d="M 50 80 L 120 280" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" />
                                <path d="M 50 80 L 280 280" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" />

                                <path d="M 200 80 L 120 280" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" />
                                <path d="M 200 80 L 280 280" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" />

                                <path d="M 350 80 L 120 280" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" />
                                <path d="M 350 80 L 280 280" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" />

                                {/* Animated Red Dots */}
                                <motion.circle r="3" fill="#EF4444"
                                    initial={{ cx: 50, cy: 80 }}
                                    animate={{ cx: [50, 120, 50], cy: [80, 280, 80] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />

                                <motion.circle r="3" fill="#EF4444"
                                    initial={{ cx: 200, cy: 80 }}
                                    animate={{ cx: [200, 120, 200], cy: [80, 280, 80] }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.3 }} />

                                <motion.circle r="3" fill="#EF4444"
                                    initial={{ cx: 200, cy: 80 }}
                                    animate={{ cx: [200, 280, 200], cy: [80, 280, 80] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay: 0.8 }} />

                                <motion.circle r="3" fill="#EF4444"
                                    initial={{ cx: 350, cy: 80 }}
                                    animate={{ cx: [350, 120, 350], cy: [80, 280, 80] }}
                                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: 0.1 }} />

                                <motion.circle r="3" fill="#EF4444"
                                    initial={{ cx: 350, cy: 80 }}
                                    animate={{ cx: [350, 280, 350], cy: [80, 280, 80] }}
                                    transition={{ duration: 1.3, repeat: Infinity, ease: "linear", delay: 0.6 }} />

                                <motion.circle r="3" fill="#EF4444"
                                    initial={{ cx: 50, cy: 80 }}
                                    animate={{ cx: [50, 280, 50], cy: [80, 280, 80] }}
                                    transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: 0.5 }} />
                            </svg>
                        </div>

                        <p className="mt-auto text-center text-sm text-brand-muted z-10 px-4">
                            Agents constantly polling fragmented memory causes race conditions and stale context.
                        </p>
                    </div>

                    {/* COLUMN 2: THE SOLUTION */}
                    <div className="flex flex-col rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-8 backdrop-blur-md relative overflow-hidden h-full min-h-[500px]">
                        {/* Glowing background behind Statis Box */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none z-0" />

                        <h3 className="text-sm font-bold mb-4 text-emerald-400 text-center uppercase tracking-wider z-10">
                            After: The Statis Framework
                        </h3>

                        <div className="relative flex-1 w-full mx-auto max-w-[400px]">

                            {/* Left Side: Agents */}
                            <div className="absolute top-[10%] bottom-[20%] left-0 flex flex-col justify-around z-10">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-[#0A0A0A]">
                                        <Bot className="h-5 w-5 text-emerald-200" />
                                    </div>
                                    <span className="text-[10px] text-emerald-200/60">Support</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-[#0A0A0A]">
                                        <Bot className="h-5 w-5 text-emerald-200" />
                                    </div>
                                    <span className="text-[10px] text-emerald-200/60">Sales</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-[#0A0A0A]">
                                        <Bot className="h-5 w-5 text-emerald-200" />
                                    </div>
                                    <span className="text-[10px] text-emerald-200/60">Billing</span>
                                </div>
                            </div>

                            {/* Center: Statis Broker */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-48">
                                <div className="flex flex-col items-center p-3 rounded-2xl border border-emerald-400/50 bg-[#0A0A0A]/90 shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-sm">
                                    <span className="font-bold text-white text-sm mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-400" /> Statis Broker</span>

                                    <div className="w-full flex flex-col gap-1.5">
                                        {/* Layer 1: Event Bus */}
                                        <div className="text-center py-2 text-[10px] rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-100 shadow-inner">
                                            Event Bus (Log)
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-emerald-500/50 mx-auto rotate-90" />

                                        {/* Layer 2: Materialized State */}
                                        <div className="text-center py-2 text-[10px] rounded-lg border border-emerald-400/40 bg-emerald-900/40 text-emerald-200 shadow-inner">
                                            Materialized State
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-emerald-500/50 mx-auto rotate-90" />

                                        {/* Layer 3: Subscriptions */}
                                        <div className="text-center py-2 text-[10px] rounded-lg border border-emerald-300/50 bg-emerald-800/40 text-emerald-300 font-medium shadow-inner">
                                            Subscription Engine
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Agents Receiving Webhooks */}
                            <div className="absolute top-[10%] bottom-[20%] right-0 flex flex-col justify-around z-10">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-[#0A0A0A]">
                                        <Webhook className="h-5 w-5 text-emerald-400" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-[#0A0A0A]">
                                        <Webhook className="h-5 w-5 text-emerald-400" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-[#0A0A0A]">
                                        <Webhook className="h-5 w-5 text-emerald-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Clean Arrows & Dots (SVG Overlay) */}
                            <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                {/* Labels */}
                                <text x="90" y="55" fill="#9CA3AF" fontSize="10" textAnchor="middle" opacity="0.8">REST/gRPC</text>
                                <text x="310" y="55" fill="#34D399" fontSize="10" textAnchor="middle" opacity="0.8">Webhooks</text>

                                {/* Ingress Lines (to Layer 1) */}
                                <path d="M 30 65 L 140 130" stroke="rgba(16,185,129,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                                <path d="M 30 155 L 140 130" stroke="rgba(16,185,129,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                                <path d="M 30 245 L 140 130" stroke="rgba(16,185,129,0.2)" strokeWidth="2" strokeDasharray="4 4" />

                                {/* Egress Lines (from Layer 3) */}
                                <path d="M 260 270 L 370 65" stroke="rgba(16,185,129,0.4)" strokeWidth="2" strokeDasharray="4 4" />
                                <path d="M 260 270 L 370 155" stroke="rgba(16,185,129,0.4)" strokeWidth="2" strokeDasharray="4 4" />
                                <path d="M 260 270 L 370 245" stroke="rgba(16,185,129,0.4)" strokeWidth="2" strokeDasharray="4 4" />

                                {/* Animated Green Dots (Ingress -> Event Bus) */}
                                <motion.circle r="3" fill="#10B981"
                                    initial={{ cx: 30, cy: 65, opacity: 1 }}
                                    animate={{ cx: [30, 140], cy: [65, 130], opacity: [1, 0] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 0 }} />
                                <motion.circle r="3" fill="#10B981"
                                    initial={{ cx: 30, cy: 155, opacity: 1 }}
                                    animate={{ cx: [30, 140], cy: [155, 130], opacity: [1, 0] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 0.3 }} />
                                <motion.circle r="3" fill="#10B981"
                                    initial={{ cx: 30, cy: 245, opacity: 1 }}
                                    animate={{ cx: [30, 140], cy: [245, 130], opacity: [1, 0] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 0.6 }} />

                                {/* Animated Internal Pipeline Dots (Event Bus -> Subscriptions) */}
                                <motion.circle r="4" fill="#34D399"
                                    initial={{ cx: 200, cy: 130, opacity: 0 }}
                                    animate={{ cy: [130, 200, 270], opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear", delay: 1 }} />

                                <motion.circle r="4" fill="#34D399"
                                    initial={{ cx: 200, cy: 130, opacity: 0 }}
                                    animate={{ cy: [130, 200, 270], opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear", delay: 2.2 }} />

                                {/* Animated Green Dots (Subscriptions -> Egress) */}
                                <motion.circle r="3" fill="#10B981"
                                    initial={{ cx: 260, cy: 270, opacity: 0 }}
                                    animate={{ cx: [260, 370], cy: [270, 65], opacity: [0, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 1.6 }} />
                                <motion.circle r="3" fill="#10B981"
                                    initial={{ cx: 260, cy: 270, opacity: 0 }}
                                    animate={{ cx: [260, 370], cy: [270, 155], opacity: [0, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 1.8 }} />
                                <motion.circle r="3" fill="#10B981"
                                    initial={{ cx: 260, cy: 270, opacity: 0 }}
                                    animate={{ cx: [260, 370], cy: [270, 245], opacity: [0, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 2.0 }} />
                            </svg>
                        </div>

                        <p className="mt-auto text-center text-sm text-emerald-200/80 z-10 px-4">
                            Agents publish facts. Statis materializes the truth and pushes it instantly.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
