"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { StateFlowViz } from "@/components/ui/StateFlowViz";

const primitives = [
  {
    title: "Append-only Event Log",
    description:
      "Ingest semantic events — claims, facts, signals — from agents, services, and humans into an immutable, ordered log. The single source of truth.",
    icon: "log",
    span: "lg:col-span-7",
  },
  {
    title: "Materialized State",
    description:
      "Deterministic reducers derive golden-record entity state from the log. Replay the same events, get the identical state hash every time.",
    icon: "state",
    span: "lg:col-span-5",
  },
  {
    title: "Subscriptions + Guardrails",
    description:
      "Push state-change notifications to subscribers with built-in debounce, rate limits, and dead-letter queues. No polling required.",
    icon: "subscribe",
    span: "lg:col-span-5",
  },
  {
    title: "Replay + Time Machine",
    description:
      'Ask "what did X know at revision N?" with full provenance and delivery trace. Audit-grade explainability built in.',
    icon: "replay",
    span: "lg:col-span-7",
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

function PrimitiveIcon({ name }: { name: string }) {
  const lineUrl = `/icons/icon-${name}-line.svg`;
  const solidUrl = `/icons/icon-${name}-solid.svg`;

  return (
    <div className="relative h-5 w-5 shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={lineUrl}
        alt=""
        width={20}
        height={20}
        className="absolute inset-0 transition-opacity duration-200 group-hover:opacity-0"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={solidUrl}
        alt=""
        width={20}
        height={20}
        className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
    </div>
  );
}

function GlowDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-40" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
          active ? "bg-brand-accent" : "bg-white/15"
        }`}
      />
    </span>
  );
}

function PrimitiveCard({
  item,
  index,
  isActive,
  onHover,
  onLeave,
}: {
  item: (typeof primitives)[number];
  index: number;
  isActive: boolean;
  onHover: (index: number) => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      className={item.span}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={onLeave}
    >
      <div
        className={`group h-full rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 ${
          isActive
            ? "border-cyan-400/25 bg-white/[0.06] shadow-[0_0_24px_rgba(0,255,200,0.08)] -translate-y-[2px]"
            : "border-white/10 bg-white/[0.04] hover:border-cyan-400/15 hover:-translate-y-[1px] hover:shadow-[0_0_16px_rgba(0,255,200,0.06)]"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
              <PrimitiveIcon name={item.icon} />
            </div>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
          </div>
          <GlowDot active={isActive} />
        </div>
        <p className="max-w-prose text-sm leading-relaxed text-brand-muted">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

function StaticLayout() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Four primitives.{" "}
            <span className="text-brand-muted">One reliable system.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5">
          {primitives.map((p, i) => (
            <div key={p.icon} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
                  <PrimitiveIcon name={p.icon} />
                </div>
                <h3 className="text-lg font-semibold text-white">{p.title}</h3>
              </div>
              <p className="max-w-prose text-sm leading-relaxed text-brand-muted">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Primitives() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

  const activeIndex = hoverIndex ?? scrollIndex;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setScrollIndex(Math.min(3, Math.floor(v * 4)));
  });

  const handleHover = useCallback((index: number) => {
    setHoverIndex(index);
  }, []);

  const handleLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  if (reducedMotion) return <StaticLayout />;

  return (
    <section ref={sectionRef} className="relative h-[260vh]">
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
            <h2 className="text-3xl font-bold md:text-4xl">
              Four primitives.{" "}
              <span className="text-brand-muted">One reliable system.</span>
            </h2>
          </motion.div>

          {/* Content area */}
          <div className="relative flex-1">
            {/* Ambient viz behind the grid (desktop only) */}
            <div className="pointer-events-none absolute inset-0 hidden items-center justify-center opacity-30 lg:flex">
              <div className="h-[300px] w-[400px]">
                <StateFlowViz activeIndex={activeIndex} />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--color-statist)_70%)]" />
            </div>

            {/* Desktop: 12-col grid with bento cards + viz panel */}
            <div className="relative hidden h-full items-start gap-6 lg:grid lg:grid-cols-12">
              {/* Left: 2x2 bento grid */}
              <div className="col-span-7 grid grid-cols-12 gap-4">
                {primitives.map((p, i) => (
                  <PrimitiveCard
                    key={p.icon}
                    item={p}
                    index={i}
                    isActive={activeIndex === i}
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                ))}
              </div>

              {/* Right: framed viz panel */}
              <div className="col-span-5 flex items-start justify-center pt-4">
                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                  <div className="aspect-[4/3]">
                    <StateFlowViz activeIndex={activeIndex} />
                  </div>
                  <p className="mt-3 text-center text-xs text-brand-muted">
                    {primitives[activeIndex]?.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile: stacked cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {primitives.map((p, i) => (
                <PrimitiveCard
                  key={p.icon}
                  item={p}
                  index={i}
                  isActive={activeIndex === i}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
