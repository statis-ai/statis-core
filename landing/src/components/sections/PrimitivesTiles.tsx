"use client";

import { motion } from "framer-motion";
import { AICard } from "@/components/ui/AICard";
import { FallbackImage } from "@/components/ui/FallbackImage";
import {
  LogDiagram,
  StateDiagram,
  SubscribeDiagram,
  ReplayDiagram,
} from "@/components/illustrations";

const primitives = [
  {
    title: "Append-only Event Log",
    subtitle: "The immutable timeline.",
    description:
      "Ingest semantic events — claims, facts, signals — from agents, services, and humans into an immutable, ordered log. The single source of truth.",
    iconSrc: "/icons3d/immutable_timeline.png",
    Diagram: LogDiagram,
  },
  {
    title: "Materialized State",
    subtitle: "The deterministic reality.",
    description:
      "Deterministic reducers derive golden-record entity state from the log. Replay the same events, get the identical state hash every time.",
    iconSrc: "/icons3d/deterministic_reality.png",
    Diagram: StateDiagram,
  },
  {
    title: "Subscriptions + Guardrails",
    subtitle: "The reactive engine.",
    description:
      "Push state-change notifications to subscribers with built-in debounce, rate limits, and dead-letter queues. No polling required.",
    iconSrc: "/icons3d/reactive_engine.png",
    Diagram: SubscribeDiagram,
  },
  {
    title: "Replay + Time Machine",
    subtitle: "The auditable past.",
    description:
      'Ask "what did X know at revision N?" with full provenance and delivery trace. Audit-grade explainability built in.',
    iconSrc: "/icons3d/auditable_past.png",
    Diagram: ReplayDiagram,
  },
];

export function PrimitivesTiles() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full bg-brand-accent/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-accent">
            Core primitives
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Four primitives.{" "}
            <span className="text-brand-muted">One reliable system.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-muted">
            Everything you need to build deterministic, auditable state
            infrastructure for AI agents and services.
          </p>
        </motion.div>

        {/* 2×2 grid — equal heights */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          {primitives.map((p, i) => {
            const Diagram = p.Diagram;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex h-full"
              >
                <AICard className="group flex h-full flex-col">
                  {/* Visual region */}
                  <div className="relative h-[200px] shrink-0 overflow-hidden border-b border-white/[0.06] md:h-[220px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/[0.03] to-transparent" />
                    <div className="flex h-full w-full items-center justify-center px-8 transition-transform duration-300 group-hover:scale-[1.03] group-hover:rotate-[1deg]">
                      <FallbackImage
                        src={p.iconSrc}
                        alt={p.subtitle}
                        width={180}
                        height={160}
                        className="h-full w-full object-contain"
                        fallback={<Diagram />}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6 lg:p-8">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-accent">
                      {p.subtitle}
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      {p.title}
                    </h3>
                    <p className="mt-3 max-w-sm flex-1 text-sm leading-relaxed text-brand-muted">
                      {p.description}
                    </p>
                  </div>
                </AICard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
