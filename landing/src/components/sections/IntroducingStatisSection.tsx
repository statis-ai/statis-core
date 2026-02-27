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

    // Phase 1: "One Update."
    const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
    const scale1 = useTransform(scrollYProgress, [0, 0.25], [1, 0.8]);

    // Phase 2: "Everyone Knows."
    const opacity2 = useTransform(scrollYProgress, [0.2, 0.35, 0.45], [0, 1, 0]);
    const scale2 = useTransform(scrollYProgress, [0.2, 0.35, 0.5], [0.8, 1, 1.2]);

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

                    {/* First Phase: "One Update." */}
                    <motion.div
                        className="absolute flex flex-col items-center justify-center w-full"
                        style={{ opacity: opacity1, scale: scale1, pointerEvents: "none" }}
                    >
                        <h2 className="text-6xl font-extrabold tracking-tight sm:text-8xl md:text-9xl font-serif text-slate-900">
                            One Update.
                        </h2>
                    </motion.div>

                    {/* Second Phase: "Everyone Knows." */}
                    <motion.div
                        className="absolute flex flex-col items-center justify-center w-full"
                        style={{ opacity: opacity2, scale: scale2, pointerEvents: "none" }}
                    >
                        <h2 className="text-6xl font-extrabold tracking-tight sm:text-8xl md:text-9xl font-serif text-indigo-600 drop-shadow-sm">
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

                        <h2 className="text-[36px] sm:text-[48px] md:text-[72px] font-extrabold tracking-tight font-serif w-full leading-[1.05] mb-6 md:mb-8 text-white">
                            The infrastructure layer <br className="hidden sm:block" />
                            for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">shared reality.</span>
                        </h2>

                        <p className="mx-auto max-w-[800px] text-[17px] md:text-[21px] leading-[1.6] text-slate-300 font-medium px-4 md:px-0">
                            Instead of each agent maintaining its own view, Statis keeps every agent aligned to a single, verified state.
                        </p>

                        <div className="mt-12 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 bg-slate-900/50 backdrop-blur-md rounded-[24px] py-6 px-8 md:px-12 border border-slate-700/50 w-full max-w-[840px] shadow-2xl">
                            {/* Step 1 */}
                            <div className="flex items-center gap-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[13px] border border-indigo-500/30">1</span>
                                <span className="text-[16px] md:text-[18px] font-bold text-slate-100">You update once.</span>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-slate-700" />
                            <div className="sm:hidden h-px w-10 bg-slate-700" />

                            {/* Step 2 */}
                            <div className="flex items-center gap-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 font-bold text-[13px] border border-violet-500/30">2</span>
                                <span className="text-[16px] md:text-[18px] font-bold text-slate-100">Everyone reacts.</span>
                            </div>

                            {/* Pill */}
                            <div className="mt-4 sm:mt-0 rounded-full bg-indigo-500/20 px-5 py-2 md:py-2.5 text-[14px] md:text-[15px] font-bold tracking-wide text-indigo-300 sm:ml-4 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.25)] relative overflow-hidden group">
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
