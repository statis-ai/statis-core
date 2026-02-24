"use client";

import { motion } from "framer-motion";
import { AICard } from "@/components/ui/AICard";
import {
  ReplayDiagram,
  SubscribeDiagram,
  LogDiagram,
} from "@/components/illustrations";

const tiles = [
  {
    title: "Audit-grade provenance",
    description:
      "Every state revision is traceable. Replay and delivery traces support explainability and compliance.",
    Diagram: ReplayDiagram,
  },
  {
    title: "Scoped delivery",
    description:
      "Subscribers receive only what they’re authorized to see. Push updates stay within defined boundaries.",
    Diagram: SubscribeDiagram,
  },
  {
    title: "Operational guardrails",
    description:
      "Debounce, rate limits, and dead-letter patterns keep the log and delivery pipeline under control.",
    Diagram: LogDiagram,
  },
];

const badges = [
  "SOC 2 Type II — planned",
  "Encryption in transit + at rest",
  "Audit logs + retention controls",
  "SSO/SAML — planned",
];

export function SecurityTiles() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full bg-brand-accent/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-accent">
            Enterprise security posture
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Built for auditability and control
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-muted">
            Provenance, scoped delivery, and guardrails so you can run state
            infrastructure in regulated environments.
          </p>
        </motion.div>

        {/* Badge row */}
        <motion.div
          className="mb-12 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {badges.map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-brand-muted"
            >
              {label}
            </span>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-3">
          {tiles.map((t, i) => {
            const Diagram = t.Diagram;
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex h-full"
              >
                <AICard className="group flex h-full flex-col">
                  <div className="relative h-[140px] shrink-0 overflow-hidden border-b border-white/[0.06]">
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-accent/[0.03] to-transparent" />
                    <div className="flex h-full w-full items-center justify-center px-6 transition-transform duration-300 group-hover:scale-[1.02]">
                      <Diagram />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold text-white">
                      {t.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">
                      {t.description}
                    </p>
                  </div>
                </AICard>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-brand-muted/80">
          Compliance attestations shown as planned unless otherwise stated.
        </p>
      </div>
    </section>
  );
}
