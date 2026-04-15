"use client";

import { Reveal } from "@/components/ui/reveal";

const PILLARS = [
  {
    title: "EU AI Act",
    subtitle: "Art. 9 · 12 · 14",
    body: "Receipts and policy versioning map directly to Article 12 logging and Article 14 human oversight requirements.",
    accent: "text-[#B8520F]",
  },
  {
    title: "Exactly-Once Execution",
    subtitle: "Distributed lock",
    body: "Distributed lock on every action ID. External systems are never called twice — even across agent retries.",
    accent: "text-[#6B5D4F]",
  },
  {
    title: "Tamper-Evident Receipts",
    subtitle: "SHA-256 · Immutable",
    body: "SHA-256 hash of every action outcome, written atomically. Proof, not logs. Cannot be altered after the fact.",
    accent: "text-[#6B5D4F]",
  },
  {
    title: "HITL Escalation",
    subtitle: "Human-in-the-loop",
    body: "Policy rules can escalate to human approval. Approver identity and timestamp recorded in the receipt.",
    accent: "text-[#6B5D4F]",
  },
];

export function ComplianceStripSection() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-[11px] font-mono font-semibold uppercase tracking-[0.3em] text-[#B8520F] mb-10">
            Built for regulated environments
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "var(--border)" }}>
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.07}>
              <div
                className="flex flex-col gap-2 px-6 py-7" style={{ background: "var(--bg-surface)" }}
              >
                <span className={`text-sm font-bold ${pillar.accent}`}>{pillar.title}</span>
                <span className={`text-[10px] font-mono uppercase tracking-[0.15em] ${pillar.accent} opacity-60`}>{pillar.subtitle}</span>
                <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--text-2)" }}>{pillar.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
