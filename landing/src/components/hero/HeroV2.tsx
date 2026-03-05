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
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-6 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5"
                    >
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                            Agent Execution Infrastructure
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] font-serif">
                        Agents that read the truth.
                        <br />
                        <span className="text-gradient">Act on it safely.</span>
                    </h1>

                    {/* Sub-headline */}
                    <p className="mx-auto mt-7 max-w-2xl text-lg text-gray-500 md:text-xl leading-relaxed">
                        Statis is the execution layer between AI agents and production systems.
                        Shared state in. Governed, receipted action out.
                    </p>

                    {/* Pill chain */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.7 }}
                        className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm font-medium cursor-default select-none"
                    >
                        {[
                            "Shared State",
                            "Policy Evaluation",
                            "Exactly-Once Execution",
                            "Tamper-Evident Receipt",
                        ].map((label, i, arr) => (
                            <span key={label} className="flex items-center gap-2">
                                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-indigo-700">
                                    {label}
                                </span>
                                {i < arr.length - 1 && (
                                    <span className="text-gray-300 font-light">→</span>
                                )}
                            </span>
                        ))}
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
