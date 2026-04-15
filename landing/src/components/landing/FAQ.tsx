"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section, Eyebrow, SectionReveal } from "./shared";

const FAQS = [
  {
    q: "What is Shadow Mode?",
    a: "Shadow mode lets you run Statis alongside your existing agents without changing a single line of agent code. Statis observes every action proposal, evaluates it against your policy rules, and flags what would have been DENIED or DUPLICATE \u2014 without blocking any execution. Zero production risk. Zero integration work. Purpose-built for design partners evaluating Statis before full adoption.",
  },
  {
    q: "How is Statis different from a vector database?",
    a: "Vector databases are for semantic retrieval \u2014 memory. Statis is for deterministic structured state and governed execution \u2014 reality. If an agent needs context, use RAG. If it needs to know what\u2019s true right now and act on it safely, it needs Statis.",
  },
  {
    q: "Do I need to rewrite my agent logic?",
    a: "No. Statis sits between your agents and your production systems. Your agents propose actions via a simple API. Statis handles evaluation, execution, and receipts. Minimal changes to existing agent code.",
  },
  {
    q: "What makes the Policy Engine different from an authorization layer?",
    a: 'Authorization answers "can this agent do this?" Statis answers "given the current state of this entity and its history, should this action happen right now?" The policy evaluates entity state, not just roles \u2014 and every decision is receipted against a versioned rule.',
  },
  {
    q: "How does exactly-once execution work?",
    a: "When an action is approved, Statis acquires a distributed lock on the action ID, calls the adapter, writes the receipt atomically, and releases the lock. If any agent retries with the same action ID \u2014 even concurrently \u2014 the receipt is found and execution is blocked. The external system is never called twice.",
  },
  {
    q: "Can I self-host Statis?",
    a: "Yes. Statis ships with a Docker Compose setup for self-hosted deployment. VPC and managed hosting options are also on the roadmap for enterprise design partners. If data residency is a requirement, reach out directly.",
  },
  {
    q: "How fast is state materialization?",
    a: "Sub-second in normal operation. State is materialized and pushed to subscribers in near real-time. The reducer pattern ensures state is always derived from the canonical event log, not from polling or caching.",
  },
];

function FAQItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center py-6 text-left cursor-pointer group"
      >
        <span className="text-[15px] font-medium pr-4" style={{ color: "var(--text)" }}>
          {q}
        </span>
        <span
          className="shrink-0 w-5 h-5 flex items-center justify-center text-[16px] transition-transform"
          style={{
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[14px] leading-relaxed pr-12" style={{ color: "var(--text-2)" }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section id="faq">
      <SectionReveal>
        <div className="text-center mb-12">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-4">
            Frequently asked.
          </h2>
        </div>
      </SectionReveal>

      <div className="max-w-2xl mx-auto">
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {FAQS.map((faq, i) => (
            <SectionReveal key={i} delay={i * 0.04}>
              <FAQItem
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </SectionReveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
