"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { AICard } from "@/components/ui/AICard";
import { FallbackImage } from "@/components/ui/FallbackImage";
import {
  LogDiagram,
  StateDiagram,
  SubscribeDiagram,
  ReplayDiagram,
} from "@/components/illustrations";

const frames = [
  {
    line: "Events in.",
    imgSrc: "/illustrations/proof_events_in.png",
    Diagram: LogDiagram,
  },
  {
    line: "State out.",
    imgSrc: "/illustrations/proof_state_out.png",
    Diagram: StateDiagram,
  },
  {
    line: "Agents notified.",
    imgSrc: "/illustrations/proof_agents_notified.png",
    Diagram: SubscribeDiagram,
  },
  {
    line: "Rewind anytime.",
    imgSrc: "/illustrations/proof_rewind_anytime.png",
    Diagram: ReplayDiagram,
  },
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
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {frames.map((f, i) => {
              const Diagram = f.Diagram;
              return (
                <p key={i} className="text-2xl font-bold text-brand-accent">
                  {f.line}
                </p>
              );
            })}
          </div>
          <AICard className="min-h-[200px] p-6" interactive={false}>
            <ReplayDiagram />
          </AICard>
        </div>
      </div>
    </section>
  );
}

export function KineticProofScroll() {
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

  const currentFrame = frames[activeIndex];
  const CurrentDiagram = currentFrame.Diagram;

  return (
    <section ref={sectionRef} className="relative h-[220vh]">
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden py-24">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
          {/* Left: big bold statement */}
          <div className="text-left">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-tight tracking-tight"
              >
                <span className="text-brand-accent">{currentFrame.line}</span>
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Right: glass card with image / SVG fallback */}
          <div className="flex justify-center lg:justify-end">
            <AICard
              className="h-[220px] w-full max-w-md overflow-hidden lg:h-[260px]"
              interactive={false}
            >
              <div className="flex h-full w-full items-center justify-center p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full"
                  >
                    <FallbackImage
                      src={currentFrame.imgSrc}
                      alt={currentFrame.line}
                      width={400}
                      height={220}
                      className="h-full w-full object-contain"
                      fallback={<CurrentDiagram />}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </AICard>
          </div>
        </div>
      </div>
    </section>
  );
}
