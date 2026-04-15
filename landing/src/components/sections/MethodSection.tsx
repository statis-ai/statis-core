"use client";

import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/reveal";

const PRINCIPLES = [
  {
    num: "01",
    title: "Determinism over ML.",
    desc: "Your governance layer shouldn't hallucinate. Rules are versioned, testable, reversible — no magic, no prompts in the critical path.",
  },
  {
    num: "02",
    title: "Audit is the product.",
    desc: "The ledger isn't a feature, it's the thing you're paying for. Every receipt tamper-evident, queryable, and exportable.",
  },
  {
    num: "03",
    title: "Operator-first tooling.",
    desc: "SDKs, CLIs, and infrastructure-as-code. No required dashboard. Built for the people who actually own production.",
  },
  {
    num: "04",
    title: "Self-hostable by default.",
    desc: "Docker Compose, bring your own database, run on your own metal. No vendor lock-in on the trust layer.",
  },
  {
    num: "05",
    title: "Reversible by design.",
    desc: "Every policy versioned, every decision explainable, every action undoable. Mistakes should be recoverable, not catastrophic.",
  },
];

export function MethodSection() {
  return (
    <section id="method" className="relative py-20 md:py-32 overflow-hidden">
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "10%",
          left: "10%",
          width: "40%",
          height: "30%",
          background: "radial-gradient(ellipse, rgba(249,115,22,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="mb-20 text-center">
            <div className="mb-6">
              <SectionEyebrow align="center" variant="accent">Method</SectionEyebrow>
            </div>
            <h2
              className="font-bold leading-[1.05] tracking-[-0.02em] max-w-3xl mx-auto"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              How we think about{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #EA580C 0%, #F97316 55%, #FB923C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                governed execution.
              </span>
            </h2>
            <p
              className="text-sm mt-5 max-w-xl mx-auto leading-relaxed"
              style={{ color: "var(--text-2)" }}
            >
              Five principles that shape every decision in the Statis codebase. These aren&apos;t
              marketing — they&apos;re the trade-offs we refuse to make.
            </p>
          </div>
        </Reveal>

        {/* Principles list */}
        <div>
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.num} delay={i * 0.06}>
              <div
                className="method-row relative py-8 transition-colors"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
                  <div className="col-span-12 md:col-span-2">
                    <span
                      className="text-[11px] font-mono tracking-[0.2em]"
                      style={{ color: "var(--orange)" }}
                    >
                      {p.num}
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <h3
                      className="font-bold leading-[1.1] tracking-[-0.015em]"
                      style={{ fontSize: "clamp(1.2rem, 2vw, 1.6rem)" }}
                    >
                      {p.title}
                    </h3>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
          <div style={{ borderTop: "1px solid var(--border)" }} />
        </div>
      </div>

      <style>{`
        .method-row:hover {
          background: linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.04) 50%, transparent 100%);
        }
      `}</style>
    </section>
  );
}
