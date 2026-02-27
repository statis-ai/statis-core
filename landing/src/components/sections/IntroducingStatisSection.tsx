"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function IntroducingStatisSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Background color transitions from light to a premium dark
    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 0.4, 0.6, 1],
        ["#f8fafc", "#f8fafc", "#0f172a", "#0f172a"]
    );

    // Text colors transition accordingly if needed (in this case, we use static dark colors for initial phases and light for later)
    const finalTextColor = useTransform(
        scrollYProgress,
        [0.55, 0.65],
        ["rgba(255,255,255,0)", "rgba(255,255,255,1)"]
    );

    // Intro Phrase: "One Update. Everyone Knows."
    // We combine the previous phases 1 & 2 into a single unified block.
    const introOpacity = useTransform(scrollYProgress, [0, 0.35, 0.45], [1, 1, 0]);
    const introScale = useTransform(scrollYProgress, [0, 0.45], [1, 1.05]);

    // Phase 3: "The infrastructure layer..."
    const opacity3 = useTransform(scrollYProgress, [0.55, 0.7, 0.9], [0, 1, 1]);
    const y3 = useTransform(scrollYProgress, [0.55, 0.7], [80, 0]);

    return (
        <motion.section
            ref={containerRef}
            className="relative h-[400vh]"
            style={{ backgroundColor }}
        >
            <div className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden">
                {/* Background Grid Pattern - adapting to dark mode over time */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at center, currentColor 1.5px, transparent 1.5px)`,
                        backgroundSize: '28px 28px',
                        color: useTransform(
                            scrollYProgress,
                            [0, 0.4, 0.6, 1],
                            ["rgba(15,23,42,0.06)", "rgba(15,23,42,0.06)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0.04)"]
                        )
                    }}
                />

                <div className="relative z-10 w-full px-6 flex items-center justify-center">

                    {/* Intro Phase: Combined Text */}
                    <motion.div
                        className="absolute flex flex-col items-center justify-center w-full text-center gap-2 md:gap-4 px-4"
                        style={{ opacity: introOpacity, scale: introScale, pointerEvents: "none" }}
                    >
                        <h2 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl font-serif text-slate-900">
                            One Update.
                        </h2>
                        <h2 className="text-5xl font-extrabold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl font-serif text-indigo-600 drop-shadow-sm">
                            Everyone Knows.
                        </h2>
                    </motion.div>

                    {/* Third Phase: The explanation in dark mode */}
                    <motion.div
                        className="flex flex-col items-center justify-center pt-8 md:pt-16 w-full max-w-5xl mx-auto text-center"
                        style={{ opacity: opacity3, y: y3, color: finalTextColor }}
                    >
                        {/* Soft Icon Box */}
                        <div className="mb-6 md:mb-8 flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-[1.25rem] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                            <svg className="w-7 h-7 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                        </div>

                        <motion.p className="text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-4 md:mb-6">
                            Introducing Statis
                        </motion.p>

                        <h2 className="text-[36px] sm:text-[48px] md:text-[64px] font-extrabold tracking-tight font-serif w-full leading-[1.05] mb-6 md:mb-8 text-white">
                            A coordination layer for <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">shared state and governed action.</span>
                        </h2>

                        <p className="mx-auto max-w-[800px] text-[17px] md:text-[21px] leading-[1.6] text-slate-300 font-medium px-4 md:px-0">
                            Instead of each system deriving its own version of reality, Statis materializes one deterministic state — and notifies everyone when it changes.
                        </p>

                        <div className="mt-12 md:mt-16 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 bg-slate-900/50 backdrop-blur-md rounded-[24px] py-6 px-4 md:px-10 border border-slate-700/50 w-full max-w-[1000px] shadow-2xl">
                            {/* Step 1 */}
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[13px] border border-indigo-500/30 shrink-0">1</span>
                                <span className="text-[15px] md:text-[17px] font-bold text-slate-100 whitespace-nowrap">Update once.</span>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-slate-700" />
                            <div className="sm:hidden h-px w-10 bg-slate-700" />

                            {/* Step 2 */}
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 font-bold text-[13px] border border-violet-500/30 shrink-0">2</span>
                                <span className="text-[15px] md:text-[17px] font-bold text-slate-100 whitespace-nowrap">The official state changes.</span>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-slate-700" />
                            <div className="sm:hidden h-px w-10 bg-slate-700" />

                            {/* Step 3 */}
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold text-[13px] border border-fuchsia-500/30 shrink-0">3</span>
                                <span className="text-[15px] md:text-[17px] font-bold text-slate-100 whitespace-nowrap">Every system reacts.</span>
                            </div>

                            {/* Pill */}
                            <div className="mt-4 sm:mt-0 rounded-full bg-indigo-500/20 px-5 py-2 md:py-2.5 text-[14px] md:text-[15px] font-bold tracking-wide text-indigo-300 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.25)] relative overflow-hidden group shrink-0">
                                <div className="absolute inset-0 bg-indigo-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                Immediately.
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
}
