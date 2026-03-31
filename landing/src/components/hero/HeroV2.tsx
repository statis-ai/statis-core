"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const ParticleNetworkCanvas = dynamic(
    () =>
        import("./ParticleNetworkCanvas").then((mod) => mod.ParticleNetworkCanvas),
    { ssr: false }
);

const API_LINES = [
    { delay: 0,    text: "POST /actions",                                color: "text-[#5a5a7a]" },
    { delay: 0.05, text: '{  "action_type": "apply_discount",',          color: "text-[#5a5a7a]" },
    { delay: 0.1,  text: '   "target": "acct-8821",',                   color: "text-[#5a5a7a]" },
    { delay: 0.15, text: '   "params": { "pct": 10 }  }',               color: "text-[#5a5a7a]" },
    { delay: 0.5,  text: "",                                             color: "" },
    { delay: 0.6,  text: "→ 201 PROPOSED        act-f93a",              color: "text-[#8a8aaa]" },
    { delay: 1.0,  text: "→ evaluating policy   churn_retention_v1",   color: "text-[#8a8aaa]" },
    { delay: 1.5,  text: "→ APPROVED",                                  color: "text-[#00ffc8]" },
    { delay: 2.0,  text: "→ lock acquired       act-f93a",              color: "text-sky-400" },
    { delay: 2.4,  text: "→ stripe.discount(10%) executed",             color: "text-sky-400" },
    { delay: 2.9,  text: "→ COMPLETED",                                 color: "text-emerald-400" },
    { delay: 3.2,  text: "",                                             color: "" },
    { delay: 3.4,  text: '→ receipt  sha256:3f9a8b2c…',                color: "text-amber-400" },
    { delay: 3.7,  text: "→ rule     churn_retention_v1@1.0",           color: "text-amber-400" },
    { delay: 4.0,  text: "→ idempotent  act-f93a already receipted",    color: "text-[#5a5a7a]" },
];

function ApiPreview() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative w-full max-w-[520px] mx-auto lg:mx-0"
        >
            {/* Glow behind the terminal */}
            <div className="absolute -inset-4 bg-[#00ffc8]/6 blur-[60px] rounded-3xl pointer-events-none" />

            {/* Terminal window */}
            <div className="relative rounded-2xl border border-white/10 bg-[#07090f] overflow-hidden terminal-glow">
                {/* Titlebar */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6 bg-white/[0.02]">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    <span className="ml-3 text-[11px] font-mono text-[#3a3a5a] tracking-wider">statis — agent execution</span>
                    <div className="ml-auto flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] shadow-[0_0_6px_rgba(0,255,200,0.8)]" />
                        <span className="text-[10px] font-mono text-[#00ffc8]">live</span>
                    </div>
                </div>

                {/* Terminal body */}
                <div className="p-5 font-mono text-[12px] leading-[1.9] min-h-[280px]">
                    {API_LINES.map((line, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: line.delay + 0.8, duration: 0.3 }}
                            className={line.color || "h-3"}
                        >
                            {line.text || "\u00A0"}
                        </motion.div>
                    ))}
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ delay: 4.5, duration: 0.9, repeat: Infinity }}
                        className="inline-block w-2 h-3.5 bg-[#00ffc8]/70 align-middle"
                    />
                </div>

                {/* Bottom status bar */}
                <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/5 bg-white/[0.015]">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-[#3a3a5a]">api.statis.dev</span>
                        <span className="text-[10px] font-mono text-[#3a3a5a]">v0.1.0</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500/70">exactly-once ✓</span>
                </div>
            </div>
        </motion.div>
    );
}

export function HeroV2() {
    return (
        <section className="relative flex flex-col min-h-screen items-center justify-center overflow-hidden grid-texture">
            {/* Aurora ambient glow */}
            <div className="aurora" />

            {/* Particle network */}
            <div className="absolute inset-0 z-0">
                <ParticleNetworkCanvas />
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_70%_at_50%_50%,transparent_30%,#080810_100%)] pointer-events-none" />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8 pt-32 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left — copy */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#00ffc8]/20 bg-[#00ffc8]/6 px-4 py-1.5"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] shadow-[0_0_6px_rgba(0,255,200,0.9)]" />
                            <span className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-[#00ffc8]">
                                Agent Execution Infrastructure
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-[2.8rem] sm:text-5xl lg:text-[3.6rem] xl:text-[4rem] font-bold tracking-tight text-white leading-[1.08] mb-6">
                            Shared state in.
                            <br />
                            Governed, receipted
                            <br />
                            <span className="text-gradient">action</span> out.
                        </h1>

                        {/* Sub */}
                        <p className="text-lg text-[#7a7a8a] leading-relaxed max-w-lg mb-8">
                            Without a governed execution layer, your agents retry blindly, duplicate production writes, and leave no audit trail. Statis closes that gap — policy before every action, exactly-once guarantee, SHA-256 receipt.
                        </p>

                        {/* Primitive flow */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.7 }}
                            className="flex flex-wrap items-center gap-1.5 mb-10 text-[11px] font-mono"
                        >
                            {[
                                { label: "Propose", color: "text-[#00ffc8] border-[#00ffc8]/20 bg-[#00ffc8]/5" },
                                { label: "Evaluate", color: "text-violet-400 border-violet-500/20 bg-violet-500/5" },
                                { label: "Execute ×1", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
                                { label: "Receipt", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
                            ].map(({ label, color }, i, arr) => (
                                <span key={label} className="flex items-center gap-1.5">
                                    <span className={`rounded-full border px-3 py-0.5 ${color}`}>{label}</span>
                                    {i < arr.length - 1 && <span className="text-[#2a2a3a]">→</span>}
                                </span>
                            ))}
                        </motion.div>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.75, duration: 0.6 }}
                            className="flex flex-wrap items-center gap-3"
                        >
                            <a
                                href="https://www.surveymonkey.com/r/GVKH2KR"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-[#00ffc8] px-7 py-3 text-sm font-semibold text-black transition-all hover:brightness-110 hover:scale-[1.02] shadow-[0_0_32px_rgba(0,255,200,0.25)] cursor-pointer"
                            >
                                Request Design Partner Access
                            </a>
                            <a
                                href="https://docs.statis.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border border-white/10 bg-white/[0.04] px-7 py-3 text-sm font-medium text-[#c4c4d4] transition-all hover:bg-white/8 hover:border-white/18 cursor-pointer"
                            >
                                Read the Docs →
                            </a>
                            <a
                                href="#demo"
                                className="text-sm font-medium text-[#00ffc8]/70 hover:text-[#00ffc8] transition-colors cursor-pointer"
                            >
                                Try Shadow Mode — no code change →
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.6 }}
                            className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-6 text-[10px] font-mono text-[#3a3a4a]"
                        >
                            <span>Python · TypeScript</span>
                            <span className="text-[#2a2a3a]">·</span>
                            <span>PyPI + npm</span>
                            <span className="text-[#2a2a3a]">·</span>
                            <span>api.statis.dev live</span>
                        </motion.div>
                    </motion.div>

                    {/* Right — API preview */}
                    <ApiPreview />
                </div>

                {/* Scroll hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="mt-20 text-center"
                >
                    <div className="mx-auto h-10 w-px bg-gradient-to-b from-[#00ffc8]/20 to-transparent" />
                </motion.div>
            </div>
        </section>
    );
}
