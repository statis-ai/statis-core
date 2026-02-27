"use client";

import { motion } from "framer-motion";
import { Layers, GitMerge, Clock, AlertTriangle } from "lucide-react";

export function BentoFeaturesSection() {
    return (
        <section className="relative py-32 bg-[#020617] overflow-hidden border-t border-white/5">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-900/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">

                {/* 1. Header & Intro */}
                <div className="max-w-4xl mx-auto mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500 mb-6 flex items-center justify-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            The Problem
                        </h2>
                        <h3 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-serif mb-8 leading-[1.1]">
                            When Systems Don&rsquo;t Share State, <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">They Diverge.</span>
                        </h3>

                        <div className="space-y-6 text-lg sm:text-xl text-slate-400 leading-relaxed font-medium">
                            <p className="max-w-3xl mx-auto">
                                Modern AI systems aren&rsquo;t single programs.<br className="hidden sm:block" />
                                They&rsquo;re collections of agents, services, workflows, and tools — all acting independently.
                            </p>
                            <div className="flex flex-col items-center justify-center space-y-3 py-2">
                                <p>Each one reads from slightly different data.</p>
                                <p>Each one reacts at slightly different times.</p>
                                <p>Each one derives its own view of what&rsquo;s true.</p>
                            </div>
                            <p className="text-white text-2xl font-serif pt-4">
                                That works in demos. <span className="text-rose-400 font-bold">In production, it breaks.</span>
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* 2. Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr mb-24">

                    {/* Bento Card 1: Fragmented State */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="group flex flex-col items-center text-center p-8 sm:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 backdrop-blur-sm shadow-xl"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700/50 group-hover:scale-110 group-hover:bg-slate-800 group-hover:border-slate-600 transition-all duration-300">
                            <Layers className="w-7 h-7 text-slate-300 group-hover:text-white" />
                        </div>
                        <h4 className="text-2xl font-bold tracking-tight text-white mb-6">
                            1. Fragmented State
                        </h4>
                        <div className="font-mono text-sm sm:text-base text-slate-500 mb-8 space-y-3">
                            <p>Events are emitted.</p>
                            <p>Caches are updated.</p>
                            <p>Services subscribe.</p>
                        </div>
                        <div className="mt-auto space-y-4 text-base sm:text-lg text-slate-400">
                            <p>But every system materializes its own version of reality.</p>
                            <p className="font-bold text-rose-300 bg-rose-500/10 inline-block px-3 py-1 rounded-md border border-rose-500/20 shadow-sm transition-colors duration-300">
                                There is no single, authoritative state.
                            </p>
                        </div>
                    </motion.div>

                    {/* Bento Card 2: Inconsistent Action */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="group flex flex-col items-center text-center p-8 sm:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 backdrop-blur-sm shadow-xl"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700/50 group-hover:scale-110 group-hover:bg-slate-800 group-hover:border-slate-600 transition-all duration-300">
                            <GitMerge className="w-7 h-7 text-slate-300 group-hover:text-white" />
                        </div>
                        <h4 className="text-2xl font-bold tracking-tight text-white mb-6">
                            2. Inconsistent Action
                        </h4>
                        <div className="font-mono text-sm sm:text-base text-slate-500 mb-8 space-y-3">
                            <p>One workflow proceeds.</p>
                            <p>Another pauses.</p>
                            <p>A third retries.</p>
                        </div>
                        <div className="space-y-4 text-base sm:text-lg text-slate-400 mt-auto">
                            <p>All technically correct — but not aligned.</p>
                            <div className="font-bold text-rose-300 bg-rose-500/10 px-4 py-3 rounded-xl border border-rose-500/20 leading-relaxed shadow-sm transition-colors duration-300">
                                <p>Autonomy increases speed.</p>
                                <p>Fragmentation increases divergence.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bento Card 3: No Moment in Time */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="group flex flex-col items-center text-center p-8 sm:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 backdrop-blur-sm shadow-xl"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700/50 group-hover:scale-110 group-hover:bg-slate-800 group-hover:border-slate-600 transition-all duration-300">
                            <Clock className="w-7 h-7 text-slate-300 group-hover:text-white" />
                        </div>
                        <h4 className="text-2xl font-bold tracking-tight text-white mb-6">
                            3. No Clear &ldquo;Moment in Time&rdquo;
                        </h4>
                        <p className="text-base sm:text-lg text-slate-400 mb-6 max-w-[280px]">
                            When something goes wrong, you dig through logs. You can&rsquo;t easily answer:
                        </p>
                        <div className="font-mono text-[13px] sm:text-[14px] text-indigo-300 mb-8 space-y-3 bg-[#0a0f1d]/40 p-5 rounded-xl border border-indigo-900/30 shadow-inner w-full sm:max-w-md flex flex-col items-center text-center">
                            <p className="flex gap-2 justify-center w-full"><span className="text-indigo-500 hidden sm:inline">?</span> What was the state?</p>
                            <p className="flex gap-2 justify-center w-full"><span className="text-indigo-500 hidden sm:inline">?</span> Why did it act?</p>
                            <p className="flex gap-2 justify-center w-full"><span className="text-indigo-500 hidden sm:inline">?</span> Who reacted?</p>
                        </div>
                        <div className="mt-auto">
                            <p className="font-bold text-rose-300 bg-rose-500/10 inline-block px-3 py-2 rounded-md border border-rose-500/20 shadow-sm transition-colors duration-300">
                                You reconstruct history instead of querying it.
                            </p>
                        </div>
                    </motion.div>

                </div>

                {/* 3. The Core Issue (Outro) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="max-w-4xl mx-auto text-center bg-gradient-to-b from-[#0a0f1d] to-[#020617] p-10 sm:p-16 rounded-[3rem] border border-slate-800/60 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-60" />

                    <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">
                        The Core Issue
                    </h4>

                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-white leading-tight mb-8">
                        Today&rsquo;s AI systems coordinate <span className="text-slate-500 line-through">messages.</span><br className="hidden sm:block" />
                        <span className="text-rose-400 sm:ml-2">They don&rsquo;t coordinate state.</span>
                    </p>

                    <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        As autonomy increases, subtle inconsistencies compound into real execution failures.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-lg font-medium">
                        <span className="text-slate-400 px-6 py-3.5 rounded-full border border-slate-800 bg-slate-900/50">
                            You don&rsquo;t need smarter agents.
                        </span>
                        <span className="text-indigo-200 px-6 py-3.5 rounded-full border border-indigo-500/40 bg-indigo-600/20 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-400/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                            You need shared, deterministic state.
                        </span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
