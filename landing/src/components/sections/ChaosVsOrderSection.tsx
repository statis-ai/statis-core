"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/* ── Animated Race Condition (Left Side) ──────────────────────── */

function RaceConditionDiagram() {
    const svgRef = useRef<SVGSVGElement>(null);

    return (
        <svg ref={svgRef} viewBox="0 0 340 220" className="w-full h-auto">
            <defs>
                <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="glowAmber" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Database node */}
            <rect x="135" y="140" width="70" height="36" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x="170" y="162" textAnchor="middle" fill="#8a8a9a" fontSize="9" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">DATABASE</text>

            {/* Support Agent */}
            <circle cx="70" cy="50" r="22" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
            <text x="70" y="47" textAnchor="middle" fontSize="14">🎧</text>
            <text x="70" y="61" textAnchor="middle" fill="#3b82f6" fontSize="7" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">Support</text>

            {/* Sales Agent */}
            <circle cx="270" cy="50" r="22" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
            <text x="270" y="47" textAnchor="middle" fontSize="14">💼</text>
            <text x="270" y="61" textAnchor="middle" fill="#3b82f6" fontSize="7" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">Sales</text>

            {/* Simultaneous beams to DB — animated */}
            <line x1="70" y1="72" x2="155" y2="140" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5" strokeDasharray="4 3">
                <animate attributeName="stroke-dashoffset" values="0;-14" dur="0.7s" repeatCount="indefinite" />
            </line>
            <line x1="270" y1="72" x2="190" y2="140" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" strokeDasharray="4 3">
                <animate attributeName="stroke-dashoffset" values="0;-14" dur="0.7s" repeatCount="indefinite" />
            </line>

            {/* STALE READ badge — pulsing */}
            <g filter="url(#glowRed)">
                <rect x="95" y="88" width="78" height="22" rx="11" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
                </rect>
                <text x="134" y="103" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">
                    STALE READ
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
                </text>
            </g>

            {/* CONFLICT badge */}
            <g filter="url(#glowAmber)" transform="translate(0, 6)">
                <rect x="105" y="110" width="58" height="18" rx="9" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth="0.8">
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                </rect>
                <text x="134" y="122" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
                    CONFLICT
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                </text>
            </g>

            {/* Crossed arrows showing collision */}
            <text x="170" y="85" textAnchor="middle" fill="rgba(239,68,68,0.5)" fontSize="16" fontWeight="bold">
                ⚡
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.2s" repeatCount="indefinite" />
            </text>
        </svg>
    );
}

/* ── Ordered Flow (Right Side) ────────────────────────────────── */

function OrderedFlowDiagram() {
    return (
        <svg viewBox="0 0 340 220" className="w-full h-auto">
            {/* Statis Hub */}
            <circle cx="170" cy="110" r="28" fill="rgba(0,255,200,0.06)" stroke="#00ffc8" strokeWidth="1.5" opacity="0.9">
                <animate attributeName="r" values="26;30;26" dur="3s" repeatCount="indefinite" />
            </circle>
            <text x="170" y="113" textAnchor="middle" fill="#00ffc8" fontSize="8" fontWeight="800" fontFamily="Inter, system-ui, sans-serif">STATIS</text>

            {/* Pulse ring */}
            <circle cx="170" cy="110" r="28" fill="none" stroke="rgba(0,255,200,0.08)" strokeWidth="1">
                <animate attributeName="r" values="30;55;30" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
            </circle>

            {/* Support → Statis (input) */}
            <circle cx="60" cy="50" r="20" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
            <text x="60" y="47" textAnchor="middle" fontSize="13">🎧</text>
            <text x="60" y="59" textAnchor="middle" fill="#3b82f6" fontSize="7" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">Support</text>

            {/* Sales (output) */}
            <circle cx="280" cy="50" r="20" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
            <text x="280" y="47" textAnchor="middle" fontSize="13">💼</text>
            <text x="280" y="59" textAnchor="middle" fill="#3b82f6" fontSize="7" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">Sales</text>

            {/* Billing (output) */}
            <circle cx="280" cy="180" r="20" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
            <text x="280" y="177" textAnchor="middle" fontSize="13">💳</text>
            <text x="280" y="189" textAnchor="middle" fill="#3b82f6" fontSize="7" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">Billing</text>

            {/* Input line: Support → Statis */}
            <line x1="80" y1="60" x2="144" y2="100" stroke="rgba(0,255,200,0.3)" strokeWidth="1.5" strokeDasharray="5 4">
                <animate attributeName="stroke-dashoffset" values="0;-18" dur="1s" repeatCount="indefinite" />
            </line>
            <text x="100" y="75" fill="rgba(0,255,200,0.5)" fontSize="7" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">FACT</text>

            {/* Output lines: Statis → Sales, Billing */}
            <line x1="196" y1="100" x2="262" y2="58" stroke="rgba(0,255,200,0.2)" strokeWidth="1.5" strokeDasharray="5 4">
                <animate attributeName="stroke-dashoffset" values="0;-18" dur="1s" repeatCount="indefinite" />
            </line>
            <line x1="190" y1="130" x2="264" y2="172" stroke="rgba(0,255,200,0.2)" strokeWidth="1.5" strokeDasharray="5 4">
                <animate attributeName="stroke-dashoffset" values="0;-18" dur="1s" repeatCount="indefinite" />
            </line>

            {/* PUSH labels */}
            <text x="240" y="73" fill="rgba(0,255,200,0.4)" fontSize="7" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">PUSH</text>
            <text x="234" y="160" fill="rgba(0,255,200,0.4)" fontSize="7" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">PUSH</text>

            {/* Checkmarks */}
            <text x="280" y="30" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">✓ SYNCED</text>
            <text x="280" y="204" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">✓ SYNCED</text>
        </svg>
    );
}

/* ── Main Section ───────────────────────────────────────────── */

export function ChaosVsOrderSection() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32 bg-[#050505]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent mb-4">
                        The Problem
                    </p>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                        The Cost of Hallucination
                    </h2>
                    <p className="mt-5 text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
                        When agents poll separate databases, they invent their own reality.
                        Statis replaces &ldquo;vibe-based coordination&rdquo; with a single, pushed truth.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Before */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-4 right-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-red-400/80 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                Without Statis
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Race Condition</h3>
                        <p className="text-sm text-brand-muted mb-6">
                            Two agents hit the database simultaneously and get conflicting reads.
                        </p>
                        <div className="rounded-xl bg-black/60 p-4 border border-white/5">
                            <RaceConditionDiagram />
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-brand-muted">
                                <span className="text-red-400">✕</span> Simultaneous reads return different states
                            </div>
                            <div className="flex items-center gap-2 text-sm text-brand-muted">
                                <span className="text-red-400">✕</span> No single source of truth
                            </div>
                            <div className="flex items-center gap-2 text-sm text-brand-muted">
                                <span className="text-red-400">✕</span> Agents invent their own reality
                            </div>
                        </div>
                    </motion.div>

                    {/* After */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="rounded-2xl border border-brand-accent/10 bg-brand-accent/[0.02] p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-4 right-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-accent/80 bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/20">
                                With Statis
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Serialized Truth</h3>
                        <p className="text-sm text-brand-muted mb-6">
                            Facts flow through Statis. Every agent gets the same state, pushed instantly.
                        </p>
                        <div className="rounded-xl bg-black/60 p-4 border border-brand-accent/5">
                            <OrderedFlowDiagram />
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-brand-muted">
                                <span className="text-brand-accent">✓</span> Events serialized through one hub
                            </div>
                            <div className="flex items-center gap-2 text-sm text-brand-muted">
                                <span className="text-brand-accent">✓</span> State pushed, never polled
                            </div>
                            <div className="flex items-center gap-2 text-sm text-brand-muted">
                                <span className="text-brand-accent">✓</span> Every agent sees identical truth
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
