const STEPS = [
  { num: "01", name: "Propose",  desc: "Agent declares intent. Nothing executes." },
  { num: "02", name: "Evaluate", desc: "Policy engine checks rules. Approve, deny, or escalate." },
  { num: "03", name: "Execute",  desc: "Distributed lock. Adapter fires once. Never twice." },
  { num: "04", name: "Receipt",  desc: "SHA-256 hash. Immutable. Tamper-evident." },
];

export function HowItWorks() {
  return (
    <section
      className="py-28"
      style={{}}
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.25em] mb-3 inline-block px-2 py-0.5 rounded"
          style={{ color: "var(--text-2)", background: "rgba(255,255,255,0.04)" }}
        >
          How it works
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-14">
          Four primitives. One guarantee.
        </h2>

        <div className="space-y-10 text-left max-w-2xl mx-auto">
          {STEPS.map(step => (
            <div key={step.num} className="flex items-baseline gap-8">
              <span
                className="text-xs font-bold shrink-0 w-8"
                style={{ color: "var(--text-muted)" }}
              >
                {step.num}
              </span>
              <span className="text-lg font-bold shrink-0 w-28">
                {step.name}
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--text-2)" }}
              >
                {step.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
