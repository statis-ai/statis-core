"use client";

import { motion } from "framer-motion";
import { Brain, Layers, Globe2, Activity } from "lucide-react";

export function AIStackSection() {
    return (
        <section className="relative py-32 bg-[#020617] overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">

                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                            <Layers className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-300">Architecture</span>
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-serif">
                            The New Layer in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI Stack</span>
                        </h2>
                    </motion.div>
                </div>

                <div className="relative mx-auto flex flex-col items-center">

                    {/* Layer 1: Application */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="w-full max-w-[280px] sm:max-w-sm relative z-30"
                    >
                        <div className="group flex flex-col items-center p-6 rounded-2xl bg-[#0f172a] border border-slate-800 text-center hover:border-slate-700 transition-colors shadow-lg shadow-black/50 hover:-translate-y-1 duration-300">
                            <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-4 text-slate-400 group-hover:text-slate-300 transition-colors">
                                <Activity className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-slate-200">Application Layer</h3>
                            <p className="text-sm mt-2 font-medium text-slate-500">Agents & Orchestration</p>
                        </div>
                    </motion.div>

                    {/* Connection */}
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        whileInView={{ opacity: 1, height: 32 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="w-px bg-gradient-to-b from-slate-700 to-indigo-900/50 relative z-20 shadow-lg"
                    />

                    {/* Layer 2: Memory */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="w-full max-w-[320px] sm:max-w-md relative z-20"
                    >
                        <div className="group flex flex-col items-center p-6 rounded-2xl bg-indigo-950/20 border border-indigo-900/50 text-center hover:border-indigo-800 transition-colors shadow-lg shadow-black/50 backdrop-blur-sm hover:-translate-y-1 duration-300">
                            <div className="w-12 h-12 rounded-xl bg-indigo-900/50 border border-indigo-800/50 flex items-center justify-center mb-4 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                <Brain className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-indigo-200">Memory Layer</h3>
                            <p className="text-sm mt-2 font-medium text-indigo-400/70">Vector Databases & RAG</p>
                        </div>
                    </motion.div>

                    {/* Connection */}
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        whileInView={{ opacity: 1, height: 48 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div className="w-px h-12 bg-gradient-to-b from-indigo-900/50 to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,1)] absolute -bottom-1.5 animate-pulse" />
                    </motion.div>

                    {/* Layer 3: Shared Reality (Statis) - The Foundation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.6, type: "spring", stiffness: 100 }}
                        className="w-full max-w-[360px] sm:max-w-2xl relative z-40 mt-1"
                    >
                        <div className="group relative overflow-hidden flex flex-col items-center p-8 sm:p-12 rounded-[2rem] bg-gradient-to-b from-indigo-600 to-violet-700 border border-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.3)] text-center hover:shadow-[0_0_60px_rgba(99,102,241,0.5)] hover:-translate-y-1 transition-all duration-500">

                            {/* Inner glows / dynamic light */}
                            <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/20 blur-3xl rounded-full group-hover:bg-white/30 transition-colors duration-700 pointer-events-none" />
                            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-400/20 blur-3xl rounded-full group-hover:bg-indigo-300/30 transition-colors duration-700 pointer-events-none" />

                            <div className="relative w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-white shadow-inner backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500">
                                <Globe2 className="w-8 h-8" strokeWidth={1.5} />
                            </div>

                            <h3 className="relative text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                                Shared Reality Layer
                            </h3>
                            <p className="relative text-base sm:text-lg font-medium text-indigo-100 max-w-lg mx-auto">
                                The foundational engine for deterministic, universally agreed-upon state across all autonomous agents.
                            </p>

                            <div className="mt-8 relative inline-flex items-center justify-center">
                                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-5 py-2.5 border border-white/20 backdrop-blur-lg shadow-sm">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                                    <span className="text-sm font-bold text-white tracking-wider uppercase">Powered by Statis</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="mt-24 text-center"
                >
                    <p className="inline-block relative text-lg font-medium text-slate-400">
                        <span className="relative z-10 px-6 py-2 rounded-full border border-white/5 bg-white/[0.02] shadow-sm backdrop-blur-sm">
                            As autonomy scales, <span className="text-white font-semibold">alignment</span> becomes <span className="text-indigo-400 font-semibold">infrastructure.</span>
                        </span>
                    </p>
                </motion.div>

            </div>
        </section>
    );
}
