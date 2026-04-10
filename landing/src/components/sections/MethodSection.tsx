import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

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
    <section id="method" className="relative py-32 overflow-hidden">
      {/* Subtle radial glow behind the section header */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "10%",
          left: "10%",
          width: "40%",
          height: "30%",
          background: "radial-gradient(ellipse, rgba(200,92,26,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Eyebrow + heading */}
        <div className="mb-24">
          <div className="mb-6">
            <SectionEyebrow>Method</SectionEyebrow>
          </div>
          <h2
            className="font-bold leading-[1.05] tracking-[-0.02em] max-w-3xl"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)" }}
          >
            How we think about{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #c85c1a 0%, #FB923C 60%, #FED7AA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              governed execution.
            </span>
          </h2>
          <p
            className="text-base mt-6 max-w-xl leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            Five principles that shape every decision in the Statis codebase. These aren&apos;t
            marketing — they&apos;re the trade-offs we refuse to make.
          </p>
        </div>

        {/* Principles list */}
        <div>
          {PRINCIPLES.map((p) => (
            <div
              key={p.num}
              className="method-row relative py-10 transition-colors"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
                <div className="col-span-12 md:col-span-2">
                  <span
                    className="text-[11px] font-mono tracking-[0.2em]"
                    style={{ color: "#c85c1a" }}
                  >
                    {p.num}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <h3
                    className="font-bold leading-[1.1] tracking-[-0.015em] text-white"
                    style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}
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
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
        </div>
      </div>

      <style>{`
        .method-row:hover {
          background: linear-gradient(90deg, transparent 0%, rgba(200,92,26,0.03) 50%, transparent 100%);
        }
      `}</style>
    </section>
  );
}
