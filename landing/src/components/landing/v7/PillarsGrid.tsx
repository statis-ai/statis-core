"use client";

const QUADRANTS = [
  {
    eyebrow: "01 · Context In",
    headline: "Every prompt, scrubbed before the model sees it.",
    copy: "Pattern-based injection detection, PII redaction, token + cost meter. Zero network, zero auth — runs in-process.",
  },
  {
    eyebrow: "02 · Action Out",
    headline: "Propose. Gate. Then execute.",
    copy: "Deterministic policy rules evaluate every tool call. Distributed lock guarantees exactly-once across retries.",
  },
  {
    eyebrow: "03 · Receipt Through",
    headline: "Tamper-evident, by default.",
    copy: "SHA-256 hash chains every receipt to the last. Verifiable offline — no Statis required to audit later.",
  },
  {
    eyebrow: "04 · Escalations",
    headline: "Humans, only when it matters.",
    copy: "When policy can't decide, route to a reviewer. Slack, email, or signed URL — kill-switch is one click.",
  },
];

function ContextInVisual() {
  return (
    <div
      style={{
        background: "#0c0c0e",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 6,
        padding: 12,
        fontFamily: "var(--mono)",
        fontSize: 11,
        color: "#a1a1aa",
        lineHeight: 1.6,
      }}
    >
      <div>
        <span style={{ color: "#71717a" }}>user:</span> charge{" "}
        <span style={{ color: "#fafafa" }}>$427</span> to{" "}
        <span
          style={{
            background: "rgba(248,113,113,0.18)",
            border: "1px dashed rgba(248,113,113,0.45)",
            color: "#fca5a5",
            padding: "0 4px",
            borderRadius: 2,
            textDecoration: "line-through",
          }}
        >
          card_4242•••4242
        </span>
        <span style={{ color: "#71717a" }}> → [redacted]</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px dashed rgba(255,255,255,0.08)" }}>
        <span style={{ color: "#52525b" }}>cost</span>
        <span>
          <span style={{ color: "#71717a", textDecoration: "line-through" }}>$0.014</span>
          <span style={{ color: "#fb923c", marginLeft: 8 }}>$0.003</span>
        </span>
      </div>
    </div>
  );
}

function ActionOutVisual() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          background: "#0c0c0e",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 6,
          padding: 10,
          fontFamily: "var(--mono)",
          fontSize: 10,
          color: "#a1a1aa",
          lineHeight: 1.6,
        }}
      >
        <div>
          <span style={{ color: "#fb923c" }}>id</span>: refund.under_500
        </div>
        <div>
          <span style={{ color: "#fb923c" }}>match.amount</span>:{" "}
          <span style={{ color: "#fafafa" }}>{"\""}{"<"} 50000{"\""}</span>
        </div>
        <div>
          <span style={{ color: "#fb923c" }}>auto_approve</span>:{" "}
          <span style={{ color: "#34D399" }}>true</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, fontFamily: "var(--mono)" }}>
        <Pill status="PROPOSED" />
        <span style={{ color: "#52525b" }}>→</span>
        <Pill status="APPROVED" />
        <span style={{ color: "#52525b" }}>→</span>
        <Pill status="COMPLETED" />
      </div>
    </div>
  );
}

function ReceiptVisual() {
  return (
    <div
      style={{
        background: "#0c0c0e",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 6,
        padding: 12,
        fontFamily: "var(--mono)",
        fontSize: 10,
        color: "#a1a1aa",
        lineHeight: 1.7,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#fafafa", fontWeight: 600 }}>RCPT-000847</span>
        <span style={{ color: "#34D399", fontSize: 9 }}>● approved</span>
      </div>
      <div style={{ color: "#52525b", fontSize: 9, marginBottom: 2 }}>prev</div>
      <div style={{ color: "#71717a", marginBottom: 6 }}>0x9f4a…e51f</div>
      <div style={{ color: "#52525b", fontSize: 9, marginBottom: 2 }}>curr</div>
      <div style={{ color: "#fb923c" }}>0x3c7e…a2f0</div>
    </div>
  );
}

function EscalationVisual() {
  return (
    <div
      style={{
        background: "#0c0c0e",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 6,
        padding: 12,
        fontFamily: "var(--mono)",
        fontSize: 11,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: "#fafafa", fontWeight: 600 }}>stripe.subscription.cancel</span>
        <Pill status="PENDING" />
      </div>
      <div style={{ color: "#71717a", fontSize: 10, marginBottom: 12 }}>
        sub_PqL2sN8v · pro · annual<br />
        proposed by retention-bot
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          style={{
            flex: 1,
            padding: "6px 10px",
            fontSize: 10,
            fontFamily: "var(--mono)",
            color: "#fafafa",
            background: "rgba(52,211,153,0.16)",
            border: "1px solid rgba(52,211,153,0.36)",
            borderRadius: 4,
            cursor: "default",
          }}
        >
          Approve
        </button>
        <button
          style={{
            flex: 1,
            padding: "6px 10px",
            fontSize: 10,
            fontFamily: "var(--mono)",
            color: "#fafafa",
            background: "rgba(248,113,113,0.10)",
            border: "1px solid rgba(248,113,113,0.32)",
            borderRadius: 4,
            cursor: "default",
          }}
        >
          Deny
        </button>
      </div>
    </div>
  );
}

const PILL_PALETTES: Record<string, { color: string; bg: string; border: string }> = {
  PROPOSED:  { color: "#A1A1AA", bg: "rgba(161,161,170,0.10)", border: "rgba(161,161,170,0.28)" },
  APPROVED:  { color: "#34D399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.28)" },
  COMPLETED: { color: "#34D399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.28)" },
  PENDING:   { color: "#FACC15", bg: "rgba(250,204,21,0.10)", border: "rgba(250,204,21,0.28)" },
};

function Pill({ status }: { status: string }) {
  const p = PILL_PALETTES[status] ?? PILL_PALETTES.COMPLETED;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "1px 6px",
        borderRadius: 999,
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: p.color,
        background: p.bg,
        border: `1px solid ${p.border}`,
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: 999, background: p.color }} />
      {status}
    </span>
  );
}

const VISUALS = [<ContextInVisual key="ci" />, <ActionOutVisual key="ao" />, <ReceiptVisual key="rt" />, <EscalationVisual key="es" />];

export default function PillarsGrid() {
  return (
    <section style={{ padding: "120px 24px", background: "transparent" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <header style={{ maxWidth: 780, marginBottom: 56 }}>
          <div className="eyebrow">
            <span className="ver">§ 05</span>
            <span>The four facets</span>
          </div>
          <h2 className="section-hed">
            One product.{" "}
            <span>Four pieces that compose into trust.</span>
          </h2>
          <p className="section-sub">
            Statis is one platform — but it does four jobs across the agent loop.
            Each runs independently, each emits a receipt, each falls back gracefully.
          </p>
        </header>

        <div
          style={{
            background: "#0a0a0b",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 40px 80px -40px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
            }}
            className="pillars-inner"
          >
            {QUADRANTS.map((q, i) => {
              const isRight = i % 2 === 1;
              const isBottom = i >= 2;
              return (
                <div
                  key={q.eyebrow}
                  style={{
                    padding: 32,
                    borderRight: isRight ? "none" : "1px solid rgba(255,255,255,0.08)",
                    borderBottom: isBottom ? "none" : "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    minHeight: 320,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#fb923c",
                    }}
                  >
                    {q.eyebrow}
                  </div>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      color: "#fafafa",
                      lineHeight: 1.25,
                      letterSpacing: "-0.015em",
                      margin: 0,
                    }}
                  >
                    {q.headline}
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: "#a1a1aa", margin: 0 }}>
                    {q.copy}
                  </p>
                  <div style={{ marginTop: "auto", paddingTop: 16 }}>{VISUALS[i]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 720px) {
          .pillars-inner {
            grid-template-columns: 1fr !important;
            grid-template-rows: repeat(4, auto) !important;
          }
          .pillars-inner > div:nth-child(1),
          .pillars-inner > div:nth-child(2),
          .pillars-inner > div:nth-child(3) {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.08) !important;
          }
          .pillars-inner > div:nth-child(4) {
            border-bottom: none !important;
          }
        }
      `}</style>
    </section>
  );
}
