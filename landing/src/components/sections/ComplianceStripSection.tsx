"use client";

import { motion } from "framer-motion";

const PILLARS = [
  {
    title: "EU AI Act",
    subtitle: "Art. 9 · 12 · 14",
    body: "Receipts and policy versioning map directly to Article 12 logging and Article 14 human oversight requirements.",
    accent: "text-[#00ffc8]",
    border: "border-[#00ffc8]/15",
  },
  {
    title: "Exactly-Once Execution",
    subtitle: "Distributed lock",
    body: "Distributed lock on every action ID. External systems are never called twice — even across agent retries.",
    accent: "text-[#7a756e]",
    border: "border-[#7a756e]/15",
  },
  {
    title: "Tamper-Evident Receipts",
    subtitle: "SHA-256 · Immutable",
    body: "SHA-256 hash of every action outcome, written atomically. Proof, not logs. Cannot be altered after the fact.",
    accent: "text-[#7a756e]",
    border: "border-[#7a756e]/15",
  },
  {
    title: "HITL Escalation",
    subtitle: "Human-in-the-loop",
    body: "Policy rules can escalate to human approval. Approver identity and timestamp recorded in the receipt.",
    accent: "text-[#7a756e]",
    border: "border-[#7a756e]/15",
  },
];

export function ComplianceStripSection() {
  return (
    <section className="relative py-16 overflow-hidden border-y border-white/[0.07] bg-white/[0.01]">
      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-[11px] font-mono font-semibold uppercase tracking-[0.3em] text-[#00ffc8] mb-10"
        >
          Built for regulated environments
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06]">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex flex-col gap-2 bg-[#080810] px-6 py-7"
            >
              <span className={`text-sm font-bold ${pillar.accent}`}>{pillar.title}</span>
              <span className={`text-[10px] font-mono uppercase tracking-[0.15em] ${pillar.accent} opacity-60`}>{pillar.subtitle}</span>
              <p className="text-xs text-[#6a6a7a] leading-relaxed mt-1">{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
