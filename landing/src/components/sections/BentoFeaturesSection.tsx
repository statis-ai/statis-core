"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Code, BarChart2, AlertTriangle, Headphones, Briefcase } from "lucide-react";

/* ── 1. Animated Race Condition (Light Theme) ──────────────────────── */
function RaceConditionDiagramLight() {
    return (
        <div className="relative w-full h-[360px] bg-white rounded-2xl overflow-hidden flex items-center justify-center">
            {/* Premium Dotted Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />

            {/* Subtle radial gradient to fade out the dots near the edges */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white pointer-events-none opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white pointer-events-none opacity-80" />

            {/* Connecting Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Line to Left Agent */}
                <path
                    d="M 50% 70% L 35% 35%"
                    stroke="#E2E8F0"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                />
                {/* Line to Right Agent */}
                <path
                    d="M 50% 70% L 65% 35%"
                    stroke="#E2E8F0"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                />
            </svg>

            {/* Red 'conflict' dot on the left path (matches reference) */}
            <div className="absolute top-[52%] left-[42.5%] w-2 h-2 bg-red-400 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.8)] z-10" />

            {/* TOP LEFT: Agent Node (Code) */}
            <div className="absolute top-[25%] left-[35%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white border border-slate-100 rounded-[1rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center z-10">
                <Code className="text-blue-600 w-6 h-6" />
            </div>

            {/* TOP RIGHT: Agent Node (Graph) */}
            <div className="absolute top-[25%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white border border-slate-100 rounded-[1rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center z-10">
                <BarChart2 className="text-blue-600 w-6 h-6" />
            </div>

            {/* BOTTOM CENTER: PostgreSQL Window */}
            <div className="absolute bottom-[10%] left-[50%] -translate-x-1/2 w-52 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] z-10 overflow-hidden">
                {/* Window Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-600 tracking-wide">
                            PostgreSQL
                        </span>
                    </div>
                    {/* Window Controls (Yellow/Orange dots) */}
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                    </div>
                </div>
                {/* Window Body (Skeleton lines) */}
                <div className="p-3 space-y-2.5">
                    <div className="w-full h-1.5 bg-slate-200 rounded-full" />
                    <div className="w-3/4 h-1.5 bg-slate-200 rounded-full" />
                    <div className="w-4/5 h-1.5 bg-red-100 rounded-full" />
                </div>
            </div>

            {/* ANIMATED PACKET A (Left - Red) */}
            <motion.div
                className="absolute w-max bg-white border border-red-200 shadow-[0_4px_20px_rgba(254,226,226,0.8)] rounded-lg px-3 py-2 z-20 flex flex-col gap-1"
                initial={{ top: "65%", left: "50%", x: "-50%", y: "-50%", opacity: 0, scale: 0.9 }}
                animate={{
                    top: ["65%", "45%", "45%", "45%"],
                    left: ["50%", "42%", "42%", "42%"],
                    opacity: [0, 1, 1, 0],
                    scale: [0.9, 1, 1, 0.9],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">READ A</span>
                <span className="font-mono text-xs text-red-500 font-medium">
                    {`{ status: "ok" }`}
                </span>
            </motion.div>

            {/* ANIMATED PACKET B (Right - Yellow/Error) */}
            <motion.div
                className="absolute w-max bg-white border border-amber-200 shadow-[0_4px_20px_rgba(254,243,199,0.8)] rounded-lg px-3 py-2 z-30 flex flex-col gap-1"
                initial={{ top: "65%", left: "50%", x: "-50%", y: "-50%", opacity: 0, scale: 0.9 }}
                animate={{
                    top: ["65%", "65%", "45%", "45%", "45%"], // Slightly delayed trajectory
                    left: ["50%", "50%", "58%", "58%", "58%"],
                    opacity: [0, 0, 1, 1, 0],
                    scale: [0.9, 0.9, 1, 1, 0.9],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <span className="text-[9px] font-bold text-slate-400 tracking-wider">READ B</span>
                <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono text-xs text-amber-600 font-medium">
                        {`status: "err"`}
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

/* ── 2. Live Terminal (Light Theme) ───────────────────────────── */

function LiveTerminalLight({ step }: { step: number }) {
    const fields = [
        { key: "entity_id", value: '"acct-42"', always: true },
        { key: "account_tier", value: '"enterprise"', always: true },
        {
            key: "churn_risk",
            valueOff: "false",
            valueOn: "true",
            flipsAt: 1,
        },
        {
            key: "blockers",
            valueOff: "[]",
            valueOn: '["login_outage"]',
            flipsAt: 1,
        },
        {
            key: "sentiment",
            valueOff: '"satisfied"',
            valueOn: '"angry"',
            flipsAt: 1,
        },
        {
            key: "sales_status",
            valueOff: '"active"',
            valueOn: '"paused"',
            flipsAt: 3,
        },
        {
            key: "billing_status",
            valueOff: '"active"',
            valueOn: '"paused"',
            flipsAt: 3,
        },
    ];

    return (
        <div className="font-mono text-xs leading-relaxed text-gray-800">
            <span className="text-gray-400">{"{"}</span>
            {fields.map((f, i) => {
                const flipsAt = "flipsAt" in f ? f.flipsAt : undefined;
                const isFlipped = flipsAt !== undefined && step >= flipsAt;
                const val = f.always
                    ? f.value
                    : isFlipped
                        ? f.valueOn
                        : f.valueOff;
                const isHighlighted = flipsAt !== undefined && step === flipsAt;
                const isRed = isFlipped && !f.always;

                return (
                    <div
                        key={f.key}
                        className={`pl-4 transition-all duration-500 ${isHighlighted
                            ? "bg-red-50 -mx-3 px-7 py-0.5 rounded border border-red-100"
                            : "border border-transparent -mx-3 px-7 py-0.5"
                            }`}
                    >
                        <span className="text-indigo-600">&quot;{f.key}&quot;</span>
                        <span className="text-gray-400">: </span>
                        <span
                            className={`transition-colors duration-700 ${isRed
                                ? "text-red-600 font-semibold"
                                : "text-emerald-600"
                                }`}
                        >
                            {val}
                        </span>
                        {i < fields.length - 1 && (
                            <span className="text-gray-400">,</span>
                        )}
                    </div>
                );
            })}
            <span className="text-gray-400">{"}"}</span>
        </div>
    );
}

/* ── 3. Pipeline Flow ─────────────────────────────────────────── */

const stages = [
    { label: "Ingest", desc: "Events -> Log", icon: "📥", color: "text-blue-600", bg: "bg-blue-50/80", shadow: "shadow-blue-500/10", border: "border-blue-200" },
    { label: "Lock", desc: "Isolate State", icon: "🔒", color: "text-cyan-600", bg: "bg-cyan-50/80", shadow: "shadow-cyan-500/10", border: "border-cyan-200" },
    { label: "Reduce", desc: "Materialize", icon: "🧠", color: "text-violet-600", bg: "bg-violet-50/80", shadow: "shadow-violet-500/10", border: "border-violet-200" },
    { label: "Push", desc: "Webhooks", icon: "📡", color: "text-amber-600", bg: "bg-amber-50/80", shadow: "shadow-amber-500/10", border: "border-amber-200" },
];

function PipelineFlowLight() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between w-full h-full max-w-3xl mx-auto gap-3 md:gap-0 relative pointer-events-none select-none">

            {/* Background animated connecting line */}
            <div className="hidden md:block absolute left-12 right-12 top-[45px] h-0.5 bg-gray-200 z-0">
                <motion.div
                    className="absolute top-0 left-0 bottom-0 bg-indigo-500 w-1/4 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    animate={{ left: ["0%", "75%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {stages.map((stage, i) => (
                <div key={i} className="flex flex-col items-center flex-1 z-10 w-full md:w-auto relative group pt-2 px-2">
                    <motion.div
                        whileHover={{ y: -4 }}
                        className={`w-16 h-16 rounded-2xl ${stage.bg} border ${stage.border} flex items-center justify-center text-2xl shadow-lg ${stage.shadow} mb-4 relative backdrop-blur-sm z-10 bg-white/50`}
                    >
                        {stage.icon}

                        {/* Ping animation behind icon */}
                        <div className={`absolute inset-0 rounded-2xl bg-white/40 border-2 ${stage.border} animate-ping opacity-20`} style={{ animationDuration: '3s', animationDelay: `${i * 0.5}s` }} />
                    </motion.div>

                    <div className="flex flex-col items-center bg-white/80 backdrop-blur-md border border-gray-100 px-4 py-2 rounded-xl shadow-sm min-w-28">
                        <div className={`text-sm font-bold tracking-tight ${stage.color}`}>{stage.label}</div>
                        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">{stage.desc}</div>
                    </div>

                    {/* Mobile connecting arrow */}
                    {i < stages.length - 1 && (
                        <div className="md:hidden mt-3 text-gray-300">
                            ↓
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── Main Bento Section ───────────────────────────────────────── */

export function BentoFeaturesSection() {
    const [auditStep, setAuditStep] = useState(0);

    // Auto-play the audit terminal
    useEffect(() => {
        const interval = setInterval(() => {
            setAuditStep((s) => (s + 1 > 4 ? 0 : s + 1));
        }, 2400);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 sm:py-32 bg-gray-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-4">
                        deterministic Reality
                    </h2>
                    <p className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl font-serif">
                        A single source of truth for your AI agents.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">

                    {/* Block 1: The Race Condition (2 cols) */}
                    <div className="group md:col-span-2 rounded-[32px] bg-white border border-gray-200 shadow-sm p-8 pb-0 relative overflow-hidden flex flex-col pt-10 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-500">
                        <div className="absolute inset-0 dot-pattern opacity-50 pointer-events-none" />
                        <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Prevent Agent State Drift.</h3>
                            <p className="text-gray-500 text-sm max-w-md mb-8">
                                When agents poll isolated databases, they invent their own reality. Statis guarantees your entire swarm acts on the exact same cryptographic state at the exact same millisecond.
                            </p>
                            <div className="mt-auto flex justify-center pb-8">
                                <div className="w-full max-w-md">
                                    <RaceConditionDiagramLight />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Block 2: Live Audit Terminal (1 col, 2 rows) */}
                    <div className="group md:col-span-1 md:row-span-2 rounded-[32px] bg-white border border-gray-200 shadow-sm p-8 relative flex flex-col grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-500">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">The Golden Record, Pushed Instantly.</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Say goodbye to stale caches. Statis materializes a verified JSON state and pushes webhooks to your agents in under 300ms the moment a critical event occurs.
                        </p>

                        <div className="flex-1 rounded-2xl bg-gray-50 border border-gray-200 p-5 font-mono text-sm relative overflow-hidden flex flex-col">
                            {/* Animated Toast / Badge */}
                            <AnimatePresence>
                                {auditStep === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute top-12 right-2 left-2 z-20 bg-indigo-600 text-white text-[10px] sm:text-xs px-3 py-2 rounded-lg font-sans shadow-lg flex items-center gap-2"
                                    >
                                        <span className="text-amber-300">⚡</span>
                                        <span className="font-bold">EVENT INGESTED:</span> Support logs critical outage
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* IDE Header */}
                            <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                <span className="ml-2 text-xs text-gray-400">state.json</span>
                            </div>

                            <LiveTerminalLight step={auditStep} />

                            {/* Status indicator */}
                            <div className="mt-auto pt-4 flex gap-2 w-full">
                                {['Support', 'Sales', 'Billing'].map((agent, i) => {
                                    const isPaused = auditStep >= 3 && agent !== 'Support';
                                    return (
                                        <div key={agent} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg border text-[10px] font-bold uppercase transition-colors duration-500 ${isPaused ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-200 text-gray-400'}`}>
                                            <span className="mb-0.5">{agent === 'Support' ? '🎧' : agent === 'Sales' ? '💼' : '💳'}</span>
                                            {isPaused ? 'PAUSED' : 'IDLE'}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Block 3: Architecture Flow / Push (2 cols) - Fit flawlessly into Row 2 */}
                    <div className="group md:col-span-2 rounded-[32px] bg-white border border-gray-200 shadow-sm p-8 relative flex flex-col grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-500">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Sync-on-Write Architecture.</h3>
                        <p className="text-gray-500 text-sm max-w-lg mb-10">
                            No more polling cron jobs or scattered scripts. Ingest raw events, reduce them into a single golden state record, and push delta webhooks instantly.
                        </p>
                        <div className="flex-1 flex items-center bg-gray-50/50 rounded-2xl border border-gray-100 p-8 transform group-hover:scale-[1.02] transition-transform duration-500">
                            <PipelineFlowLight />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
