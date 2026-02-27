"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const ParticleNetworkCanvas = dynamic(
    () =>
        import("./ParticleNetworkCanvas").then((mod) => mod.ParticleNetworkCanvas),
    { ssr: false }
);

export function HeroV2() {
    return (
        <section className="relative flex flex-col min-h-[92vh] items-center justify-center overflow-hidden pt-32 pb-20">
            {/* Nervous System Background Animation */}
            <div className="absolute inset-0 z-0 opacity-100">
                <ParticleNetworkCanvas />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8 pb-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="mx-auto max-w-4xl text-center"
                >
                    {/* Eyebrow */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent"
                    >
                        The Decision Layer for Autonomous Systems
                    </motion.p>

                    {/* Headline */}
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] font-serif">
                        AI agents shouldn&rsquo;t invent
                        <br />
                        <span className="text-gradient">their own version of the truth.</span>
                    </h1>

                    {/* Sub-headline */}
                    <p className="mx-auto mt-7 max-w-2xl text-lg text-gray-500 md:text-xl leading-relaxed">
                        As systems become autonomous and cross workflows, fragmented state becomes
                        fragmented execution. Statis materializes a single, authoritative state — so
                        every agent acts from the same decision surface, instantly.
                    </p>

                    {/* Punch lines */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.7 }}
                        className="mt-10 flex flex-wrap items-center justify-center gap-y-3 gap-x-4 md:gap-x-6 text-lg md:text-xl font-serif font-bold tracking-tight cursor-default select-none"
                    >
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                            No contradictions
                        </span>
                        <span className="text-violet-200 text-sm hidden sm:inline-block animate-pulse">✦</span>
                        <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                            No silent drift
                        </span>
                        <span className="text-fuchsia-200 text-sm hidden sm:inline-block animate-pulse" style={{ animationDelay: '500ms' }}>✦</span>
                        <span className="bg-gradient-to-r from-fuchsia-500 to-rose-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                            No automation surprises
                        </span>
                    </motion.div>

                    {/* CTAs */}
                    <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
                        <a
                            href="https://www.surveymonkey.com/r/GVKH2KR"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-indigo-700 shadow-sm"
                        >
                            Request Design Partner Access
                        </a>
                        <a
                            href="https://docs.statis.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-gray-200 bg-white shadow-sm px-8 py-3.5 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50"
                        >
                            Read the Docs →
                        </a>
                    </div>
                </motion.div>

                {/* Bottom hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="mt-20 text-center"
                >
                    <p className="text-xs text-gray-400 uppercase tracking-widest">
                        Scroll to see how it works
                    </p>
                    <div className="mx-auto mt-3 h-8 w-[1px] bg-gradient-to-b from-gray-300 to-transparent" />
                </motion.div>
            </div>
        </section>
    );
}
