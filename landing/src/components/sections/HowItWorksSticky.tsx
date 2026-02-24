"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AICard } from "@/components/ui/AICard";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { HowItWorksPanelArt } from "@/components/illustrations";

const steps = [
  {
    stepNum: 1,
    label: "PUBLISH",
    title: "Publish events",
    description:
      "Agents, services, and humans publish semantic events — facts about what happened — to the append-only log.",
    imgSrc: "/illustrations/how_publish.png",
  },
  {
    stepNum: 2,
    label: "ORDER",
    title: "Order the record",
    description:
      "Events are appended immutably and sequenced. Every fact has a global position in the timeline — no silent overwrites.",
    imgSrc: "/illustrations/how_order.png",
  },
  {
    stepNum: 3,
    label: "MATERIALIZE",
    title: "Materialize state",
    description:
      "Deterministic reducers fold events into golden-record entity state. Same events in → identical state hash out.",
    imgSrc: "/illustrations/how_materialize.png",
  },
  {
    stepNum: 4,
    label: "REPLAY",
    title: "Replay & audit",
    description:
      'Time-travel to any revision. Ask "what did this agent know at rev N?" with full provenance and delivery trace.',
    imgSrc: "/illustrations/how_replay.png",
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

/** Individual scrolling step card with IntersectionObserver callback */
function StepCard({
  step,
  index,
  onVisible,
}: {
  step: (typeof steps)[number];
  index: number;
  onVisible: (idx: number) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Fallback = useCallback(
    () => <HowItWorksPanelArt activeStep={index} className="h-full w-full" />,
    [index],
  );

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onVisible(index);
      },
      { threshold: 0.45 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index, onVisible]);

  return (
    <div ref={cardRef}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: index * 0.06 }}
      >
        <AICard className="overflow-hidden" interactive={false}>
          {/* Image / fallback illustration */}
          <div className="relative h-[240px] w-full overflow-hidden border-b border-white/[0.06] sm:h-[280px]">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/[0.03] to-transparent" />
            <FallbackImage
              src={step.imgSrc}
              alt={step.title}
              width={720}
              height={280}
              className="h-full w-full object-contain p-6"
              fallback={<Fallback />}
            />
          </div>
          {/* Text */}
          <div className="p-8">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-accent">
              #{step.stepNum} — {step.label}
            </span>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {step.title}
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-brand-muted">
              {step.description}
            </p>
          </div>
        </AICard>
      </motion.div>
    </div>
  );
}

function StaticLayout() {
  return (
    <section className="border-y border-brand-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            How it works
          </h2>
          <p className="mt-4 max-w-lg text-brand-muted">
            Four steps from events to deterministic, auditable state.
          </p>
        </div>
        <div className="flex flex-col gap-8">
          {steps.map((s) => (
            <AICard key={s.stepNum} className="p-8" interactive={false}>
              <div className="mb-6 h-[200px] w-full">
                <HowItWorksPanelArt
                  activeStep={s.stepNum - 1}
                  className="h-full w-full"
                />
              </div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-accent">
                #{s.stepNum} — {s.label}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                {s.description}
              </p>
            </AICard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSticky() {
  const [activeStep, setActiveStep] = useState(0);
  const reducedMotion = useReducedMotion();

  const handleVisible = useCallback((idx: number) => {
    setActiveStep(idx);
  }, []);

  if (reducedMotion) return <StaticLayout />;

  return (
    <section className="border-y border-brand-border py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: sticky */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="mb-4 inline-block rounded-full bg-brand-accent/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-accent">
                  How it works
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                  Four steps to reliable state.
                </h2>
                <p className="mt-4 text-brand-muted">
                  From semantic events to deterministic, auditable infrastructure.
                </p>

                {/* Step indicators */}
                <div className="mt-10 flex flex-col gap-3">
                  {steps.map((s, i) => (
                    <div
                      key={s.stepNum}
                      className="flex items-center gap-3 transition-all duration-300"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold transition-all duration-300 ${
                          i === activeStep
                            ? "bg-brand-accent/20 text-brand-accent shadow-[0_0_12px_rgba(0,255,200,0.25)]"
                            : i < activeStep
                              ? "bg-white/[0.08] text-white/50"
                              : "bg-white/[0.04] text-white/25"
                        }`}
                      >
                        {s.stepNum}
                      </div>
                      <span
                        className={`text-sm font-medium transition-colors duration-300 ${
                          i === activeStep
                            ? "text-white"
                            : "text-brand-muted/60"
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <Button variant="primary" size="lg">
                    Read the Spec
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right: scrolling cards */}
          <div className="flex flex-col gap-8 lg:col-span-8">
            {steps.map((s, i) => (
              <StepCard
                key={s.stepNum}
                step={s}
                index={i}
                onVisible={handleVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
