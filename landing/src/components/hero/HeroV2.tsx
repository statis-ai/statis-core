"use client";

import { motion } from "framer-motion";
import { ParticleField } from "./ParticleField";
import { HeroDataSwarm } from "./HeroDataSwarm";

export function HeroV2() {
    return (
        <section className="relative flex flex-col min-h-[90vh] items-center justify-center overflow-hidden pt-32 pb-20">
            {/* Background Interactive Canvas */}
            <ParticleField />

            {/* Aurora glow specific to the hero center */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[100px]">
                <div className="absolute inset-0 rounded-full bg-brand-accent/40 mix-blend-screen" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8 pb-10 mt-10">
                {/* TOP ROW: Text & CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-4xl text-center"
                >
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                        Deterministic State for <span className="text-gradient">AI Agents.</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-brand-muted md:text-xl">
                        The semantic event bus for multi-agent workflows. Publish facts once, materialize a shared truth, and push state changes instantly—with a cryptographically verifiable, replayable audit trail.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
                        <a
                            href="https://www.surveymonkey.com/r/GVKH2KR"
                            target="_blank" rel="noopener noreferrer"
                            className="rounded-full bg-brand-accent px-8 py-3.5 text-sm font-semibold text-black transition-all hover:scale-105 hover:bg-brand-accent/90 hover:shadow-glow-sm"
                        >
                            Get Early Access
                        </a>
                        <a
                            href="https://docs.statis.dev"
                            target="_blank" rel="noopener noreferrer"
                            className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/10"
                        >
                            Read the Documentation
                        </a>
                    </div>
                </motion.div>

                {/* BOTTOM ROW: The Data-Triggered Swarm Demo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-20 w-full text-left"
                >
                    <HeroDataSwarm />
                </motion.div>
            </div>
        </section>
    );
}
