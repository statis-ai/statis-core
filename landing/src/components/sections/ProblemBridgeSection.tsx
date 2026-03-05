"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function StaticFallback() {
    return (
        <section className="py-24 bg-white border-t border-gray-100">
            <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-400 font-medium">
                    You wouldn&rsquo;t deploy code without CI/CD.
                </h2>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 font-bold leading-tight">
                    You shouldn&rsquo;t deploy agents without{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 text-[1.2em]">
                        Statis.
                    </span>
                </h2>
            </div>
        </section>
    );
}

export function ProblemBridgeSection() {
    const sectionRef = useRef<HTMLElement>(null);
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

    // Zoom In effect: starts very small (scale 0.5) and grows to scale 1
    const scale = useTransform(scrollYProgress, [0, 0.8], [0.5, 1]);

    // Opacity fades in as it grows
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 1, 1]);

    // Blur effect clears up
    const filter = useTransform(scrollYProgress, [0, 0.6], ["blur(12px)", "blur(0px)"]);

    if (reduced) return <StaticFallback />;

    return (
        <section
            ref={sectionRef}
            className="relative bg-white border-t border-gray-100"
            style={{ height: "200vh" }} // Provides plenty of scroll distance for the zoom
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                {/* Subtle ambient glow in the background */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)",
                        opacity: useTransform(scrollYProgress, [0, 1], [0.4, 1])
                    }}
                />

                <motion.div
                    style={{ scale, opacity, filter }}
                    className="relative z-10 w-full max-w-6xl px-4 text-center flex flex-col items-center justify-center space-y-4 md:space-y-6"
                >
                    <h2 className="text-[clamp(1.2rem,2.5vw,2.5rem)] font-serif text-gray-400 font-medium leading-tight tracking-tight drop-shadow-sm">
                        You wouldn&rsquo;t deploy code without CI/CD.
                    </h2>

                    <h2 className="text-[clamp(1.8rem,4.5vw,4.5rem)] font-serif text-gray-900 font-extrabold leading-[1.1] tracking-tight">
                        You shouldn&rsquo;t deploy agents without<br className="hidden sm:block" />{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-violet-600 drop-shadow-sm text-[1.5em] tracking-tighter mix-blend-multiply">
                            Statis.
                        </span>
                    </h2>
                </motion.div>

            </div>
        </section>
    );
}
