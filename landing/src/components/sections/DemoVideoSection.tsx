"use client";

import { motion } from "framer-motion";

export function DemoVideoSection() {
    return (
        <section className="relative py-24 lg:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <motion.div
                    className="mb-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                >
                    <span className="mb-4 inline-block rounded-full border border-brand-accent/20 bg-brand-accent/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-accent">
                        Demo
                    </span>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                        See STATIS in action
                    </h2>
                </motion.div>

                <motion.div
                    className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-black/50 p-2 shadow-glow-lg transition-all duration-500 hover:border-brand-accent/50 hover:shadow-glow"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Animated Glow Wrapper around the video area */}
                    <div className="border-glow absolute inset-0 z-0 opacity-20" />

                    <div className="relative z-10 aspect-video overflow-hidden rounded-2xl bg-brand-statist">
                        {/* Placeholder for actual video iframe or html5 video */}
                        <div className="flex h-full w-full flex-col items-center justify-center text-center">
                            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-accent/10">
                                <svg
                                    className="h-8 w-8 text-brand-accent pl-1"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <p className="text-xl font-medium text-white">Watch how STATIS handles agent drift</p>
                            <p className="mt-2 text-sm text-brand-muted">2-minute walkthrough</p>
                        </div>
                        {/* If video existed:
            <video autoPlay loop muted playsInline className="h-full w-full object-cover">
               <source src="/demo.mp4" type="video/mp4" />
            </video>
            */}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
