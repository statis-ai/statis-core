"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

const statements = [
  { word: "State. Not memory.", sub: "Stop guessing what's true." },
  { word: "Deterministic.", sub: "Same events → same state." },
  { word: "Push-based.", sub: "Subscribers update instantly." },
  { word: "Replayable.", sub: "Audit any revision." },
];

const bgGradients = [
  "radial-gradient(ellipse at 30% 50%, rgba(0,255,200,0.04) 0%, transparent 60%)",
  "radial-gradient(ellipse at 60% 40%, rgba(0,200,255,0.04) 0%, transparent 60%)",
  "radial-gradient(ellipse at 40% 60%, rgba(100,80,255,0.03) 0%, transparent 60%)",
  "radial-gradient(ellipse at 55% 45%, rgba(0,255,200,0.04) 0%, transparent 60%)",
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function StaticFallback() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl space-y-10 px-6">
        {statements.map((s, i) => (
          <div key={i} className="border-l-2 border-brand-accent/30 pl-6">
            <p className="text-2xl font-bold text-brand-accent sm:text-3xl">
              {s.word}
            </p>
            <p className="mt-2 text-brand-muted">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function KineticWordCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActiveIndex(Math.min(3, Math.floor(v * 4.01)));
  });

  if (reducedMotion) return <StaticFallback />;

  return (
    <section ref={sectionRef} className="relative h-[210vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Shifting background tint — scoped to this section only */}
        <motion.div
          className="absolute inset-0"
          animate={{ background: bgGradients[activeIndex] }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, filter: "blur(8px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(8px)", y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-[clamp(2.8rem,7vw,6.5rem)] font-bold leading-none tracking-tight">
                <span className="text-brand-accent">
                  {statements[activeIndex].word}
                </span>
              </h2>
              <p className="mt-5 text-lg text-brand-muted md:text-xl">
                {statements[activeIndex].sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress indicator: active pill + dots */}
          <div className="mt-12 flex items-center justify-center gap-2">
            {statements.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-8 bg-brand-accent"
                    : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
