function ProposeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function EvaluateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ExecuteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

const STEPS = [
  {
    num: "01", name: "Propose",
    desc: "Agent declares intent. Nothing executes.",
    detail: "Typed action contract — entity, action type, payload. Zero side effects at this stage.",
    icon: <ProposeIcon />,
  },
  {
    num: "02", name: "Evaluate",
    desc: "Policy engine checks rules. Approve, deny, or escalate.",
    detail: "Deterministic rule evaluation against versioned policies. No ML — every decision is reproducible.",
    icon: <EvaluateIcon />,
  },
  {
    num: "03", name: "Execute",
    desc: "Distributed lock. Adapter fires once. Never twice.",
    detail: "Action ID lock acquired before the adapter call. Idempotent by design — retries are safe.",
    icon: <ExecuteIcon />,
  },
  {
    num: "04", name: "Receipt",
    desc: "SHA-256 hash. Immutable. Tamper-evident.",
    detail: "Written atomically with execution. Queryable, exportable, and verifiable against the ledger.",
    icon: <ReceiptIcon />,
  },
];

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-14">
          <p
            className="text-[10px] uppercase tracking-[0.25em] mb-3 inline-block px-2 py-0.5 rounded"
            style={{ color: "var(--text-2)", background: "rgba(255,255,255,0.04)" }}
          >
            How it works
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
            Four primitives. One guarantee.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="rounded-lg p-5"
              style={{
                background: "#0e0e0e",
                border: "1px solid #1e1e1e",
                borderTop: "1px solid rgba(200,92,26,0.15)",
                position: "relative",
              }}
            >
              {/* Connector arrow between cards — not on last */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute"
                  style={{
                    right: "-13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(200,92,26,0.3)",
                    fontSize: "16px",
                    zIndex: 1,
                  }}
                >
                  →
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-[10px] font-bold"
                  style={{ color: "var(--orange)" }}
                >
                  {step.num}
                </span>
                <span style={{ color: "#333" }}>
                  {step.icon}
                </span>
              </div>

              <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text)" }}>
                {step.name}
              </h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-2)" }}>
                {step.desc}
              </p>
              <p className="text-[10px] leading-relaxed" style={{ color: "#333" }}>
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
