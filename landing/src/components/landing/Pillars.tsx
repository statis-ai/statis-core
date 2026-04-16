"use client";

import type { ReactNode } from "react";
import { Section, Eyebrow, SectionReveal } from "./shared";

type Pillar = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

const PILLARS: Pillar[] = [
  {
    id: "context-in",
    eyebrow: "01 · Context in",
    title: "Every context evaluated.",
    description:
      "Compress, cost-meter, and guard what goes into the model — before it costs you tokens or leaks something it shouldn't.",
    items: [
      "Compressor — pin, prune, summarize",
      "Cost meter — per-turn, per-model",
      "Pattern guard — injection, secrets, PII",
      "Sanitization — redact before inference",
      "Admission — scope-level policy",
    ],
  },
  {
    id: "action-out",
    eyebrow: "02 · Action out",
    title: "Every action authorized.",
    description:
      "Agents propose. Statis decides. Nothing reaches a production system without passing the policy engine first.",
    items: [
      "Policies — deterministic, versioned",
      "Approvals — human-in-the-loop",
      "Adapters — GitHub, Linear, Slack, MCP",
      "Kill switch — stop every agent at once",
    ],
  },
  {
    id: "receipt-through",
    eyebrow: "03 · Receipt through",
    title: "Every execution receipted.",
    description:
      "A SHA-256 chain across every decision and outcome. Replayable, exportable, auditor-ready on day one.",
    items: [
      "SHA-256 hash chain",
      "Immutable audit store",
      "Replay — reconstruct any run",
      "Compliance exports — SOC2, HIPAA, SEC",
    ],
  },
];

function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  return (
    <SectionReveal delay={index * 0.08}>
      <div
        id={pillar.id}
        className="h-full rounded-xl p-7 transition-colors"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00D4FF", boxShadow: "0 0 8px rgba(0,212,255,0.6)" }} />
          <span className="text-[10px] font-mono uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
            {pillar.eyebrow}
          </span>
        </div>
        <h3 className="text-[22px] font-bold tracking-tight text-white mb-3 leading-tight">
          {pillar.title}
        </h3>
        <p className="text-[14px] leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>
          {pillar.description}
        </p>
        <ul className="space-y-2.5">
          {pillar.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-[13px] font-mono"
              style={{ color: "var(--text-2)" }}
            >
              <span
                className="mt-[7px] w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: "rgba(0,212,255,0.6)" }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionReveal>
  );
}

export function Pillars({ sectionId = "how-it-works" }: { sectionId?: string }): ReactNode {
  return (
    <Section id={sectionId}>
      <SectionReveal>
        <div className="text-center mb-16">
          <Eyebrow>How it works</Eyebrow>
          <h2
            className="font-bold tracking-[-0.025em] mt-5 mb-5 max-w-3xl mx-auto"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", lineHeight: 1.05 }}
          >
            Three pillars, one loop.
          </h2>
          <p
            className="text-[15px] md:text-[17px] max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            Context in. Action out. Receipt through. The same guarantees every time an agent
            touches a model or a production system.
          </p>
        </div>
      </SectionReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PILLARS.map((p, i) => (
          <PillarCard key={p.id} pillar={p} index={i} />
        ))}
      </div>
    </Section>
  );
}
