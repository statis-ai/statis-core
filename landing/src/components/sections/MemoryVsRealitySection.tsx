"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Globe2 } from "lucide-react";
import Image from "next/image";

export function MemoryVsRealitySection() {
    return (
        <section className="relative py-24 sm:py-32 bg-white overflow-hidden">
            <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent mb-4">
                        The distinction
                    </h2>
                    <h3 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl font-serif">
                        Memory Is <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">Not Reality</span>
                    </h3>
                    <p className="mx-auto mt-6 max-w-2xl text-[19px] leading-8 text-slate-500">
                        Vector databases help agents <span className="font-semibold text-slate-800">remember</span>.
                        <br />
                        Statis helps agents <span className="font-semibold text-indigo-600">agree</span>.
                    </p>
                </motion.div>

                {/* The Comparison Cards - Glowing & Floating */}
                <div className="relative mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 max-w-4xl mx-auto">

                    {/* Background glow tying them together */}
                    <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-slate-200/50 via-indigo-100/50 to-violet-200/50 blur-3xl -z-10 rounded-[100%]" />

                    {/* Card 1: Memory (Status Quo) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
                        className="group relative rounded-[2rem] bg-white border border-slate-200 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-[100%] transition-transform duration-500 group-hover:scale-110 -z-10 opacity-50" />

                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-6">
                            <BrainCircuit className="w-6 h-6 text-slate-500" strokeWidth={1.5} />
                        </div>

                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                            When an agent needs context
                        </p>
                        <h4 className="text-xl font-bold text-slate-900 mb-4">
                            Look to the Past
                        </h4>
                        <p className="text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                            Use RAG, embeddings, and vector search to retrieve relevant documents and historical data.
                        </p>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                            <span className="text-[13px] font-medium text-slate-400">Vector Database</span>
                        </div>
                    </motion.div>

                    {/* Card 2: Reality (Statis) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 100 }}
                        className="group relative rounded-[2rem] bg-white border border-indigo-100 p-8 sm:p-10 shadow-[0_8px_30px_rgb(79,70,229,0.08)] hover:shadow-[0_20px_40px_rgb(79,70,229,0.15)] hover:border-indigo-200 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-[100%] transition-transform duration-700 group-hover:scale-125 -z-10" />

                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 shadow-inner relative">
                            {/* Inner glow ping */}
                            <div className="absolute inset-0 rounded-2xl bg-indigo-400 opacity-20 group-hover:animate-ping" style={{ animationDuration: '2s' }} />
                            <Globe2 className="w-6 h-6 text-indigo-600 relative z-10" strokeWidth={1.5} />
                        </div>

                        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 leading-snug">
                            When an agent needs to know what&rsquo;s true right now
                        </p>
                        <h4 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
                            Read Shared Reality
                        </h4>
                        <p className="text-slate-600 leading-relaxed font-medium">
                            It needs a deterministic, universally agreed-upon state. It needs shared reality.
                        </p>

                        <div className="mt-8 pt-6 border-t border-indigo-50 flex items-center justify-between">
                            <span className="text-[13px] font-medium text-slate-500">The Solution</span>
                            <div className="relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1.5 shadow-[0_4px_14px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] hover:scale-105 transition-all cursor-pointer">

                                {/* Statis Logo */}
                                <div className="bg-white rounded-full p-0.5 flex items-center justify-center shadow-sm relative z-10 w-5 h-5 overflow-hidden border border-indigo-200">
                                    <Image
                                        src="/new-statis-logo.png"
                                        alt="Statis logo"
                                        width={16}
                                        height={16}
                                        className="object-cover"
                                    />
                                </div>

                                <span className="text-[14px] font-bold text-white tracking-wide pr-1">Statis</span>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
