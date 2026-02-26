"use client";

import { motion } from "framer-motion";

/* ── Pipeline stages ────────────────────────────────────────── */

const stages = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
        ),
        label: "Ingest",
        description: "Semantic events from any agent or system",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
        label: "Append-Only Log",
        description: "Immutable, ordered event stream",
        color: "text-cyan-400",
        bgColor: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        label: "Reducer Hub",
        description: "Deterministic state computation",
        color: "text-violet-400",
        bgColor: "bg-violet-500/10 border-violet-500/20",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
        ),
        label: "Gold Record",
        description: "Materialized, hashed state",
        color: "text-green-400",
        bgColor: "bg-green-500/10 border-green-500/20",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
        ),
        label: "Push Delivery",
        description: "Webhooks to subscribed agents",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10 border-amber-500/20",
    },
];

/* ── Animated arrow connector ───────────────────────────────── */

function Arrow() {
    return (
        <div className="hidden lg:flex items-center justify-center flex-shrink-0 w-10">
            <svg width="32" height="16" viewBox="0 0 32 16" className="text-brand-muted/30">
                <line
                    x1="0"
                    y1="8"
                    x2="24"
                    y2="8"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        values="0;-12"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </line>
                <polygon points="24,4 32,8 24,12" fill="currentColor" />
            </svg>
        </div>
    );
}

/* ── Main Section ───────────────────────────────────────────── */

export function ArchitectureFlowSection() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32 bg-brand-statist border-t border-white/5">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-2xl text-center mb-16"
                >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent mb-4">
                        Architecture
                    </p>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                        How the bus works.
                    </h2>
                    <p className="mt-5 text-lg text-brand-muted max-w-xl mx-auto">
                        Statis sits on top of your existing infrastructure — not
                        a replacement, a semantic coordinator.
                    </p>
                </motion.div>

                {/* Pipeline flow */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0 mb-16"
                >
                    {stages.map((stage, i) => (
                        <div key={i} className="contents">
                            <div
                                className={`rounded-2xl border ${stage.bgColor} p-5 w-full lg:w-auto lg:min-w-[150px] text-center transition-all duration-300 hover:scale-105 group`}
                            >
                                <div
                                    className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${stage.bgColor} ${stage.color}`}
                                >
                                    {stage.icon}
                                </div>
                                <div
                                    className={`text-sm font-bold ${stage.color}`}
                                >
                                    {stage.label}
                                </div>
                                <div className="text-xs text-brand-muted mt-1 leading-snug">
                                    {stage.description}
                                </div>
                            </div>
                            {i < stages.length - 1 && <Arrow />}
                        </div>
                    ))}
                </motion.div>

                {/* Wedge diagram: Statis on top of existing DBs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 relative">
                        {/* Statis layer */}
                        <div className="rounded-xl border border-brand-accent/20 bg-brand-accent/[0.04] p-5 text-center mb-4 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-statist px-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                                    Semantic Coordinator
                                </span>
                            </div>
                            <div className="text-lg font-bold text-brand-accent">
                                Statis
                            </div>
                            <div className="text-xs text-brand-muted mt-1">
                                Event log → Reducer → State → Push
                            </div>
                        </div>

                        {/* Connector arrows down */}
                        <div className="flex justify-center gap-20 mb-4">
                            <div className="h-6 w-[1px] bg-brand-muted/20" />
                            <div className="h-6 w-[1px] bg-brand-muted/20" />
                            <div className="h-6 w-[1px] bg-brand-muted/20" />
                        </div>

                        {/* Existing infrastructure layer */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                {
                                    name: "PostgreSQL",
                                    icon: "🐘",
                                    desc: "Your transactional DB",
                                },
                                {
                                    name: "Vector DB",
                                    icon: "🧠",
                                    desc: "Embeddings & RAG",
                                },
                                {
                                    name: "External APIs",
                                    icon: "🔌",
                                    desc: "Third-party services",
                                },
                            ].map((db) => (
                                <div
                                    key={db.name}
                                    className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-center"
                                >
                                    <div className="text-xl mb-2">
                                        {db.icon}
                                    </div>
                                    <div className="text-xs font-bold text-brand-muted">
                                        {db.name}
                                    </div>
                                    <div className="text-[10px] text-brand-muted/60 mt-0.5">
                                        {db.desc}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Label */}
                        <div className="text-center mt-4">
                            <span className="text-[10px] text-brand-muted/40 uppercase tracking-wider">
                                Your existing infrastructure (unchanged)
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
