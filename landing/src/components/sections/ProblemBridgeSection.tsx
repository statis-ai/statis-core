"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

const STATEMENTS = [
    {
        word: "Agents act.",
        sub: "On stale data, at different times, with different truths.",
    },
    {
        word: "Actions fire twice.",
        sub: "Retry logic. Race conditions. No one notices until Stripe does.",
    },
    {
        word: "Auditors ask why.",
        sub: "You have logs. Logs are reconstructed. That's not proof.",
    },
    {
        word: "Statis.",
        sub: "Shared state in. Governed, receipted action out.",
        isFinal: true,
    },
];

function StaticFallback() {
    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="mx-auto max-w-4xl px-6 text-center space-y-16">
                {STATEMENTS.map((s, i) => (
                    <div key={i}>
                        <p className={`text-4xl font-extrabold tracking-tight font-serif ${s.isFinal ? "text-indigo-600" : "text-gray-900"}`}>
                            {s.word}
                        </p>
                        <p className="mt-3 text-gray-500">{s.sub}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export function ProblemBridgeSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mql.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        setActiveIndex(Math.min(STATEMENTS.length - 1, Math.floor(v * STATEMENTS.length)));
    });

    if (reduced) return <StaticFallback />;

    const current = STATEMENTS[activeIndex];

    return (
        <section
            ref={sectionRef}
            className="relative bg-white border-t border-gray-100"
            style={{ height: `${STATEMENTS.length * 80}vh` }}
        >
            <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
                {/* Subtle ambient gradient that shifts with each statement */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                        background: current.isFinal
                            ? "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.06) 0%, transparent 65%)"
                            : "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.02) 0%, transparent 65%)",
                    }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                />

                <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, filter: "blur(10px)", y: 28 }}
                            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                            exit={{ opacity: 0, filter: "blur(10px)", y: -28 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <h2
                                className={`text-[clamp(3rem,9vw,7.5rem)] font-extrabold leading-none tracking-tight font-serif ${
                                    current.isFinal
                                        ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500"
                                        : "text-gray-900"
                                }`}
                            >
                                {current.word}
                            </h2>
                            <p className={`mt-5 text-lg md:text-xl leading-relaxed ${current.isFinal ? "text-indigo-500" : "text-gray-400"}`}>
                                {current.sub}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Progress dots */}
                    <div className="mt-14 flex items-center justify-center gap-2">
                        {STATEMENTS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    i === activeIndex
                                        ? "w-8 bg-indigo-500"
                                        : "w-1.5 bg-gray-200"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
