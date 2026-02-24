"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { StateFlowViz } from "@/components/ui/StateFlowViz";

const steps = [
  {
    step: "01",
    title: "Publish events",
    description:
      "Agents, services, and humans publish semantic events — facts about what happened — to the append-only log.",
  },
  {
    step: "02",
    title: "Materialize state",
    description:
      "Deterministic reducers fold events into golden-record entity state. Same events in → identical state hash out.",
  },
  {
    step: "03",
    title: "Push updates",
    description:
      "Subscribers receive state-change notifications in real time with built-in guardrails: debounce, rate limits, DLQ.",
  },
  {
    step: "04",
    title: "Replay & audit",
    description:
      'Time-travel to any revision. Ask "what did this agent know at rev N?" with full provenance and delivery trace.',
  },
];

const stepTints = [
  "rgba(0,255,200,0.02)",
  "rgba(0,180,255,0.02)",
  "rgba(120,100,255,0.02)",
  "rgba(0,255,200,0.02)",
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

function ProgressRail({ activeStep }: { activeStep: number }) {
  const fillPercent = (activeStep / (steps.length - 1)) * 100;

  return (
    <div className="relative flex h-full flex-col items-center py-8">
      {/* Background rail */}
      <div className="absolute left-1/2 top-8 bottom-8 w-[2px] -translate-x-1/2 bg-white/10" />

      {/* Filled rail */}
      <motion.div
        className="absolute left-1/2 top-8 w-[2px] -translate-x-1/2 origin-top bg-brand-accent"
        animate={{ height: `${fillPercent}%` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Nodes */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        {steps.map((s, i) => {
          const isReached = i <= activeStep;
          const isCurrent = i === activeStep;
          return (
            <div key={s.step} className="flex items-center gap-4">
              <div className="relative">
                {isCurrent && (
                  <motion.div
                    className="absolute -inset-2 rounded-full bg-brand-accent/15"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <div
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-all duration-300 ${
                    isReached
                      ? "border-brand-accent bg-brand-accent/20 text-brand-accent shadow-[0_0_14px_rgba(0,255,200,0.3)]"
                      : "border-white/15 bg-white/5 text-white/35"
                  }`}
                >
                  {s.step}
                </div>
              </div>
              <span
                className={`hidden text-sm font-medium transition-colors duration-300 xl:block ${
                  isReached ? "text-white" : "text-white/30"
                }`}
              >
                {s.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActiveStepCard({ step }: { step: (typeof steps)[number] }) {
  return (
    <motion.div
      key={step.step}
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-cyan-400/25 bg-white/[0.06] p-8 shadow-[0_0_20px_rgba(0,255,200,0.08)] backdrop-blur-md"
    >
      <span className="mb-3 inline-block rounded-full bg-brand-accent/10 px-3 py-1 font-mono text-xs font-semibold text-brand-accent">
        {step.step}
      </span>
      <h3 className="mt-2 text-2xl font-semibold text-white">{step.title}</h3>
      <p className="mt-4 max-w-lg text-base leading-relaxed text-brand-muted">
        {step.description}
      </p>
    </motion.div>
  );
}

function StaticLayout() {
  return (
    <section className="border-y border-brand-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
          <p className="mt-4 text-brand-muted">
            Four steps from chaos to deterministic, auditable state.
          </p>
        </div>
        <div className="flex flex-col gap-8">
          {steps.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md"
            >
              <span className="mb-3 inline-block rounded-full bg-brand-accent/10 px-3 py-1 font-mono text-xs font-semibold text-brand-accent">
                {s.step}
              </span>
              <h3 className="mt-2 text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-brand-muted">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActiveStep(Math.min(3, Math.floor(v * 4)));
  });

  if (reducedMotion) return <StaticLayout />;

  return (
    <section ref={sectionRef} className="relative h-[300vh] border-y border-brand-border">
      <div className="sticky top-24 h-[calc(100vh-6rem)]">
        <div className="mx-auto flex h-full max-w-6xl flex-col px-6">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
            <p className="mt-4 text-brand-muted">
              Four steps from chaos to deterministic, auditable state.
            </p>
          </motion.div>

          {/* Content */}
          <div className="relative flex-1">
            {/* Background tint */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-3xl"
              animate={{ backgroundColor: stepTints[activeStep] }}
              transition={{ duration: 0.8 }}
            />

            {/* Desktop layout */}
            <div className="hidden h-full md:grid md:grid-cols-12 md:gap-8">
              {/* Left: stepper rail */}
              <div className="col-span-3 flex items-stretch">
                <ProgressRail activeStep={activeStep} />
              </div>

              {/* Right: active card + ambient viz */}
              <div className="relative col-span-9 flex items-center">
                {/* Ambient viz (desktop only) */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="h-[250px] w-[350px]">
                    <StateFlowViz activeIndex={activeStep} />
                  </div>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,var(--color-statist)_65%)]" />
                </div>

                {/* Active step card */}
                <div className="relative z-10 w-full">
                  <AnimatePresence mode="wait">
                    <ActiveStepCard step={steps[activeStep]} />
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Mobile: stacked cards */}
            <div className="flex flex-col gap-6 md:hidden">
              {steps.map((s) => (
                <div
                  key={s.step}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md"
                >
                  <span className="mb-2 inline-block rounded-full bg-brand-accent/10 px-3 py-1 font-mono text-xs font-semibold text-brand-accent">
                    {s.step}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
