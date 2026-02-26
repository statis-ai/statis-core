"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Step data ──────────────────────────────────────────────── */

const STEPS = [
    {
        id: 1,
        icon: "🎧",
        badge: "TRIGGER",
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        title: "Support logs a Critical Outage",
        description:
            "A Support Agent files an incident: the login page is returning 500 errors, 2,000+ users are blocked.",
    },
    {
        id: 2,
        icon: "⚡",
        badge: "MATERIALIZE",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        title: "Statis flips the golden record",
        description:
            'The reducer fires instantly: churn_risk flips to true, blockers updated, sentiment set to "angry".',
    },
    {
        id: 3,
        icon: "📡",
        badge: "PUSH",
        badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
        title: "Sales & Billing get a push notification",
        description:
            "Subscribed agents receive a webhook within 300ms. No polling. No stale cache. Real-time truth.",
    },
    {
        id: 4,
        icon: "✅",
        badge: "RESULT",
        badgeColor: "bg-green-500/20 text-green-300 border-green-500/30",
        title: "Agents pause automatically",
        description:
            'Sales pauses the upsell email. Billing suspends dunning retries. No human wrote a single "if" statement.',
    },
];

/* ── Live Terminal JSON View ────────────────────────────────── */

function LiveTerminal({ step }: { step: number }) {
    const fields = [
        { key: "entity_id", value: '"acct-42"', always: true },
        { key: "account_tier", value: '"enterprise"', always: true },
        {
            key: "churn_risk",
            valueOff: "false",
            valueOn: "true",
            flipsAt: 1, // flips at step 2 (index 1)
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
        <div className="font-mono text-xs leading-relaxed">
            <span className="text-brand-muted">{"{"}</span>
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
                            ? "bg-red-500/10 -mx-3 px-7 py-0.5 rounded"
                            : ""
                            }`}
                    >
                        <span className="text-blue-300">&quot;{f.key}&quot;</span>
                        <span className="text-brand-muted">: </span>
                        <span
                            className={`transition-colors duration-700 ${isRed
                                ? "text-red-400 font-semibold"
                                : "text-green-400"
                                }`}
                        >
                            {val}
                        </span>
                        {i < fields.length - 1 && (
                            <span className="text-brand-muted">,</span>
                        )}
                    </div>
                );
            })}
            <span className="text-brand-muted">{"}"}</span>
        </div>
    );
}

/* ── Agent Status Cards ─────────────────────────────────────── */

function AgentStatusCard({
    name,
    icon,
    step,
}: {
    name: string;
    icon: string;
    step: number;
}) {
    const isSupport = name === "Support";
    const isPaused = step >= 3 && !isSupport;
    const isNotified = step >= 2 && !isSupport;
    const isTriggered = step >= 0 && isSupport;

    return (
        <div
            className={`rounded-xl border p-4 text-center transition-all duration-500 backdrop-blur-sm ${isPaused
                ? "border-amber-500/40 bg-amber-500/[0.08] shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                : isNotified
                    ? "border-violet-500/30 bg-violet-500/5"
                    : isTriggered
                        ? "border-blue-500/30 bg-blue-500/5"
                        : "border-white/5 bg-white/[0.02]"
                }`}
        >
            <div className="text-xl mb-2">{icon}</div>
            <div className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                {name}
            </div>

            {isPaused ? (
                <div className="flex items-center justify-center gap-1.5">
                    {/* Kill switch / pause icon — glowing amber */}
                    <div className="relative">
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/60 flex items-center justify-center animate-pulse">
                            <svg
                                className="w-3 h-3 text-amber-400"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                        </div>
                        {/* Glow ring */}
                        <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-amber-400">
                        PAUSED
                    </span>
                </div>
            ) : isNotified ? (
                <span className="text-[9px] font-mono font-semibold text-violet-400">
                    📡 NOTIFIED
                </span>
            ) : isTriggered ? (
                <span className="text-[9px] font-mono font-semibold text-blue-400">
                    📋 FILED
                </span>
            ) : (
                <span className="text-[9px] font-mono text-brand-muted/50">
                    IDLE
                </span>
            )}
        </div>
    );
}

/* ── Main Section ───────────────────────────────────────────── */

export function OutageScenarioSection() {
    const [activeStep, setActiveStep] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const hasPlayedRef = useRef(false);

    // Auto-play on scroll into view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasPlayedRef.current) {
                    hasPlayedRef.current = true;
                    startAutoPlay();
                }
            },
            { threshold: 0.35 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const startAutoPlay = () => {
        setIsAutoPlaying(true);
        setActiveStep(0);
        let step = 0;
        intervalRef.current = setInterval(() => {
            step++;
            if (step >= STEPS.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setIsAutoPlaying(false);
                return;
            }
            setActiveStep(step);
        }, 2400);
    };

    const handleReplay = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        hasPlayedRef.current = false;
        startAutoPlay();
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden py-24 sm:py-32 bg-brand-statist"
        >
            <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent mb-4">
                        See it in Action
                    </p>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                        The CSM Outage Scenario
                    </h2>
                    <p className="mt-5 text-lg text-brand-muted max-w-2xl mx-auto">
                        A production outage hits. Watch how five AI agents
                        coordinate through Statis — without a single line of
                        orchestration code.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Timeline steps */}
                    <div className="lg:col-span-5 space-y-3">
                        {STEPS.map((step, i) => (
                            <button
                                key={step.id}
                                onClick={() => {
                                    if (intervalRef.current)
                                        clearInterval(intervalRef.current);
                                    setIsAutoPlaying(false);
                                    setActiveStep(i);
                                }}
                                className={`w-full text-left p-5 rounded-xl transition-all duration-300 border group ${activeStep === i
                                    ? "bg-white/[0.06] border-brand-accent/30 shadow-[0_0_25px_rgba(0,255,200,0.06)]"
                                    : i <= activeStep
                                        ? "bg-white/[0.02] border-white/5 opacity-60"
                                        : "bg-white/[0.01] border-white/5 opacity-25"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-lg transition-all ${activeStep === i
                                            ? "bg-brand-accent/10 scale-110"
                                            : "bg-white/5"
                                            }`}
                                    >
                                        {step.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${step.badgeColor}`}
                                            >
                                                {step.badge}
                                            </span>
                                        </div>
                                        <h4
                                            className={`font-semibold text-sm ${activeStep === i
                                                ? "text-white"
                                                : "text-brand-muted"
                                                }`}
                                        >
                                            {step.title}
                                        </h4>
                                        {activeStep === i && (
                                            <motion.p
                                                initial={{
                                                    opacity: 0,
                                                    height: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    height: "auto",
                                                }}
                                                className="mt-2 text-sm text-brand-muted leading-relaxed"
                                            >
                                                {step.description}
                                            </motion.p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}

                        {/* Replay */}
                        <div className="pt-2 text-center">
                            <button
                                onClick={handleReplay}
                                disabled={isAutoPlaying}
                                className={`text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full transition-all ${isAutoPlaying
                                    ? "text-brand-muted/50 cursor-not-allowed"
                                    : "text-brand-accent hover:bg-brand-accent/10"
                                    }`}
                            >
                                ↻ Replay Scenario
                            </button>
                        </div>
                    </div>

                    {/* Live state visualization — glassmorphism card */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-32 rounded-2xl border border-white/[0.08] bg-[#0a0a10]/70 p-6 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
                            {/* Header bar */}
                            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4 mb-5">
                                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                                <span className="ml-3 text-xs font-mono text-brand-muted/70">
                                    entity: account/acct-42
                                </span>
                                {isAutoPlaying && (
                                    <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-brand-accent">
                                        <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
                                        LIVE
                                    </span>
                                )}
                            </div>

                            {/* Live Terminal JSON */}
                            <div className="rounded-lg bg-black/50 border border-white/5 p-4">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeStep}
                                        initial={{ opacity: 0.6 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <LiveTerminal step={activeStep} />
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Agent status bar */}
                            <div className="mt-5 grid grid-cols-3 gap-3">
                                <AgentStatusCard
                                    name="Support"
                                    icon="🎧"
                                    step={activeStep}
                                />
                                <AgentStatusCard
                                    name="Sales"
                                    icon="💼"
                                    step={activeStep}
                                />
                                <AgentStatusCard
                                    name="Billing"
                                    icon="💳"
                                    step={activeStep}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
