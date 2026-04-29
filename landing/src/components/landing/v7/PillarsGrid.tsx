"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

/* ════════ halftone background ════════ */

function HalftoneBg() {
  return (
    <div aria-hidden="true" className="ft-halftone">
      <div className="ft-halftone-layer ft-halftone-layer-1" />
      <div className="ft-halftone-layer ft-halftone-layer-2" />
    </div>
  );
}

/* ════════ tiny status pill ════════ */

const PILL = {
  proposed: { color: "#A1A1AA", bg: "rgba(161,161,170,0.12)", border: "rgba(161,161,170,0.32)" },
  approved: { color: "#34D399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.34)" },
  pending:  { color: "#FACC15", bg: "rgba(250,204,21,0.12)", border: "rgba(250,204,21,0.32)" },
  denied:   { color: "#F87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.32)" },
};

function Pill({ status, children }: { status: keyof typeof PILL; children: React.ReactNode }) {
  const p = PILL[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: "0.06em",
        color: p.color,
        background: p.bg,
        border: `1px solid ${p.border}`,
        textTransform: "uppercase" as const,
        fontFamily: "var(--mono)",
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: 999, background: p.color }} />
      {children}
    </span>
  );
}

/* ════════ floating dark mockups for each facet ════════ */

function ContextMockup() {
  return (
    <div className="ft-mockup ft-mockup-tall">
      <div className="ft-mockup-head">
        <span className="ft-mockup-input">
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L13 13" />
          </svg>
          compress and redact this prompt
        </span>
        <span className="ft-mockup-tag ft-tag-blue">scrub</span>
      </div>
      <div className="ft-mockup-row">
        <span className="ft-mockup-key">user.query</span>
        <span className="ft-mockup-val">
          charge $427 to{" "}
          <span className="ft-mockup-redact">card_4242•••4242</span>
        </span>
      </div>
      <div className="ft-mockup-row">
        <span className="ft-mockup-key">tokens</span>
        <span className="ft-mockup-bar">
          <span className="ft-mockup-bar-fill" style={{ width: "22%" }} />
          <span className="ft-mockup-bar-pct">22%</span>
        </span>
      </div>
      <div className="ft-mockup-foot">
        <span className="ft-mockup-old">18,420</span>
        <span className="ft-arrow">→</span>
        <span className="ft-mockup-new">4,112 tokens</span>
        <span className="ft-mockup-cost">$0.014 → <strong>$0.003</strong></span>
      </div>
    </div>
  );
}

function ActionMockup() {
  return (
    <div className="ft-mockup ft-mockup-tall">
      <div className="ft-mockup-head">
        <span className="ft-mockup-input">policies/refund.yaml</span>
        <span className="ft-mockup-tag ft-tag-green">v3 matched</span>
      </div>
      <div className="ft-mockup-policy">
        <div><span className="y-k">match.amount</span>: <span className="y-v">&lt; 50000</span></div>
        <div><span className="y-k">approve</span>: <span className="y-v">auto</span></div>
        <div><span className="y-k">receipt</span>: <span className="y-v">required</span></div>
      </div>
      <div className="ft-mockup-foot ft-mockup-flow">
        <Pill status="proposed">propose</Pill>
        <span className="ft-arrow">→</span>
        <Pill status="approved">approved</Pill>
        <span className="ft-arrow">→</span>
        <Pill status="approved">completed</Pill>
      </div>
    </div>
  );
}

function ReceiptMockup() {
  return (
    <div className="ft-mockup ft-mockup-tall">
      <div className="ft-mockup-head">
        <span className="ft-mockup-input">RCPT-000847</span>
        <span className="ft-mockup-tag ft-tag-green">signed</span>
      </div>
      <div className="ft-rcpt-block">
        <div className="ft-rcpt-key">prev</div>
        <div className="ft-rcpt-hash ft-rcpt-prev">0x9f4a2b8d…e51f</div>
      </div>
      <div className="ft-rcpt-block ft-rcpt-curr">
        <div className="ft-rcpt-key">sha256 · curr</div>
        <div className="ft-rcpt-hash">0x3c7e1a9f…a2f0</div>
      </div>
      <div className="ft-mockup-foot">
        <span className="ft-rcpt-foot-label">chain unbroken</span>
        <span className="ft-rcpt-foot-count">#847</span>
      </div>
    </div>
  );
}

function EscalateMockup() {
  return (
    <div className="ft-mockup ft-mockup-tall">
      <div className="ft-mockup-head">
        <span className="ft-mockup-input">escalations · live</span>
        <span className="ft-mockup-tag ft-tag-yellow">1 pending</span>
      </div>
      <div className="ft-esc-card">
        <div className="ft-esc-head">
          <span className="ft-esc-title">stripe.subscription.cancel</span>
          <Pill status="pending">pending</Pill>
        </div>
        <div className="ft-esc-meta">sub_PqL2sN8v · proposed by retention-bot · 2m ago</div>
        <div className="ft-esc-actions">
          <button type="button" className="ft-esc-btn ft-esc-btn-approve">Approve</button>
          <button type="button" className="ft-esc-btn ft-esc-btn-deny">Deny</button>
        </div>
      </div>
      <div className="ft-mockup-foot">
        <span className="ft-mockup-route">
          <span className="ft-route-dot" /> #oncall-retention · Slack
        </span>
      </div>
    </div>
  );
}

/* ════════ facet data ════════ */

type Palette = {
  block1: string;  // primary block
  block2: string;  // secondary block
  block3: string;  // accent block
  base: string;    // base wash
};

const FACETS: Array<{
  num: string;
  short: string;
  headline: string;
  description: string;
  bullets: string[];
  palette: Palette;
  mockup: React.ReactNode;
}> = [
  {
    num: "01",
    short: "Context In",
    headline: "Scrub before the model sees it.",
    description:
      "Pre-call hygiene runs in-process. Patterns get caught, secrets get redacted, tokens get counted — before a single byte hits the model.",
    bullets: [
      "Pattern-based prompt-injection detection",
      "PII redaction with audit trail",
      "Token + cost meter across GPT, Claude, Gemini",
    ],
    palette: { block1: "#fb923c", block2: "#b8442e", block3: "#f7d59b", base: "#7a2818" },
    mockup: <ContextMockup />,
  },
  {
    num: "02",
    short: "Action Out",
    headline: "Propose. Gate. Then execute.",
    description:
      "Every decorated function call is a proposal, not an action. Deterministic policy evaluates it; a distributed lock guarantees exactly-once even on retries.",
    bullets: [
      "Policy-as-code at the tool boundary",
      "Distributed lock — exactly-once across retries",
      "Kill-switch fires the moment something drifts",
    ],
    palette: { block1: "#f59e0b", block2: "#84cc16", block3: "#fde68a", base: "#365314" },
    mockup: <ActionMockup />,
  },
  {
    num: "03",
    short: "Receipt Through",
    headline: "Tamper-evident, by default.",
    description:
      "Every decision — approved, denied, kill-switched — emits a SHA-256 receipt linked to the previous one. Verifiable offline. No Statis required to audit later.",
    bullets: [
      "Per-tenant SHA-256 hash chain",
      "Ed25519-signed receipts — verifiable offline",
      "SOC 2 / HIPAA / SEC bundle exports on the roadmap",
    ],
    palette: { block1: "#dc2626", block2: "#f97316", block3: "#fda4af", base: "#7f1d1d" },
    mockup: <ReceiptMockup />,
  },
  {
    num: "04",
    short: "Escalations",
    headline: "Humans, only when it matters.",
    description:
      "When policy can't decide, route to a reviewer. Slack-button approval, signed single-use URL, or the kill-switch — your choice, not your agent's.",
    bullets: [
      "Slack, email, or signed URL — pick the channel",
      "Single-use approval URLs from any device",
      "Kill-switch in one click, receipted forever",
    ],
    palette: { block1: "#facc15", block2: "#a855f7", block3: "#fef3c7", base: "#581c87" },
    mockup: <EscalateMockup />,
  },
];

/* ════════ facet row ════════ */

function FacetRow({
  facet,
  index,
}: {
  facet: (typeof FACETS)[number];
  index: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <motion.article
      ref={ref}
      className="ft-row"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <aside className="ft-tab">
        <span className="ft-tab-num">{facet.num}</span>
        <span className="ft-tab-name">{facet.short}</span>
      </aside>

      <div className="ft-viz">
        <div
          className="ft-viz-blocks"
          style={
            {
              "--blk1": facet.palette.block1,
              "--blk2": facet.palette.block2,
              "--blk3": facet.palette.block3,
              "--base": facet.palette.base,
            } as React.CSSProperties
          }
        >
          <div className="ft-viz-grain" />
        </div>
        <div className="ft-viz-mockup-wrap">{facet.mockup}</div>
      </div>

      <div className="ft-copy">
        <span className="ft-copy-num">{facet.num}</span>
        <h3 className="ft-copy-headline">{facet.headline}</h3>
        <p className="ft-copy-desc">{facet.description}</p>
        <ul className="ft-bullets">
          {facet.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

/* ════════ section ════════ */

export default function PillarsGrid() {
  return (
    <section className="ft-section">
      <HalftoneBg />
      <div className="ft-shell">
        <header className="ft-header">
          <div className="eyebrow" style={{ justifyContent: "center" }}>
            <span className="ver">§ 05</span>
            <span>The four facets</span>
          </div>
          <h2 className="section-hed">
            One product.{" "}
            <span>Four pieces that compose into trust.</span>
          </h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>
            Statis is one platform — but it does four jobs across the agent loop.
            Each runs independently, each emits a receipt, each falls back gracefully.
          </p>
        </header>

        <div className="ft-rows">
          {FACETS.map((f, i) => (
            <FacetRow key={f.num} facet={f} index={i} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .ft-section {
          position: relative;
          padding: 120px 24px;
          isolation: isolate;
          overflow: hidden;
        }
        .ft-shell { max-width: 1280px; margin: 0 auto; position: relative; }
        .ft-header { max-width: 780px; margin: 0 auto 80px; text-align: center; }

        .ft-rows {
          display: flex;
          flex-direction: column;
          gap: 56px;
        }

        :global(.ft-row) {
          display: grid;
          grid-template-columns: 110px 1.05fr 1fr;
          gap: 32px;
          align-items: stretch;
          min-height: 360px;
        }
        @media (max-width: 980px) {
          :global(.ft-row) {
            grid-template-columns: 1fr;
            gap: 18px;
          }
        }
      `}</style>

      <style jsx global>{`
        /* ── halftone background pattern ── */
        .ft-halftone {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
        }
        .ft-halftone-layer {
          position: absolute;
          inset: 0;
        }
        .ft-halftone-layer-1 {
          background-image:
            radial-gradient(circle, rgba(184, 68, 46, 0.32) 1.4px, transparent 1.7px);
          background-size: 14px 14px;
          mask-image: radial-gradient(ellipse 60% 60% at 100% 0%, black 0%, transparent 65%);
          -webkit-mask-image: radial-gradient(ellipse 60% 60% at 100% 0%, black 0%, transparent 65%);
        }
        .ft-halftone-layer-2 {
          background-image:
            radial-gradient(circle, rgba(251, 146, 60, 0.22) 1px, transparent 1.4px);
          background-size: 8px 8px;
          mask-image: radial-gradient(ellipse 60% 60% at 0% 100%, black 0%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 60% 60% at 0% 100%, black 0%, transparent 70%);
        }

        /* ── left tab indicator ── */
        .ft-tab {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 18px 18px;
          border-left: 2px solid var(--accent);
          background: linear-gradient(90deg, rgba(251, 146, 60, 0.08) 0%, transparent 100%);
          align-self: flex-start;
          font-family: var(--mono);
          height: fit-content;
          position: sticky;
          top: 96px;
        }
        @media (max-width: 980px) {
          .ft-tab { position: static; padding: 12px 16px; }
        }
        .ft-tab-num {
          font-size: 22px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .ft-tab-name {
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 500;
        }

        /* ── center viz panel ── */
        .ft-viz {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          min-height: 360px;
          background: var(--base, #1a0808);
          box-shadow:
            0 28px 56px -28px rgba(0, 0, 0, 0.45),
            0 1px 0 rgba(255, 255, 255, 0.04) inset;
        }
        .ft-viz-blocks {
          position: absolute;
          inset: 0;
          background:
            /* color block 1 — top-left rectangle */
            linear-gradient(0deg, transparent 60%, var(--blk1) 60%, var(--blk1) 100%) 0% 0% / 38% 30%,
            /* color block 2 — middle wide */
            linear-gradient(0deg, transparent 65%, var(--blk2) 65%, var(--blk2) 95%) 50% 0% / 52% 40%,
            /* color block 3 — right small */
            linear-gradient(0deg, transparent 0%, var(--blk3) 0% 100%) 100% 100% / 28% 35%,
            /* base wash gradient */
            linear-gradient(135deg, var(--blk2) 0%, var(--base) 65%, var(--blk1) 100%);
          background-repeat: no-repeat;
          opacity: 0.95;
        }
        .ft-viz-grain {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.3 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          opacity: 0.45;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .ft-viz-mockup-wrap {
          position: absolute;
          inset: 28px 24px 28px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        /* ── floating dark mockup card ── */
        .ft-mockup {
          width: 100%;
          max-width: 440px;
          background: rgba(13, 13, 14, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px 18px;
          box-shadow:
            0 24px 50px -24px rgba(0, 0, 0, 0.65),
            0 1px 0 rgba(255, 255, 255, 0.05) inset;
          font-family: var(--mono);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
        }
        .ft-mockup-tall {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ft-mockup-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 11px;
          color: rgba(232, 228, 219, 0.55);
        }
        .ft-mockup-input {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(232, 228, 219, 0.75);
        }
        .ft-mockup-tag {
          padding: 2px 7px;
          border-radius: 3px;
          font-size: 9.5px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .ft-tag-blue { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
        .ft-tag-green { background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); }
        .ft-tag-yellow { background: rgba(250, 204, 21, 0.15); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.3); }

        .ft-mockup-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          color: #d4d4d8;
        }
        .ft-mockup-key { color: #71717a; min-width: 64px; }
        .ft-mockup-val { color: #fafafa; flex: 1; }
        .ft-mockup-redact {
          background: rgba(248, 113, 113, 0.18);
          border: 1px dashed rgba(248, 113, 113, 0.45);
          color: #fca5a5;
          padding: 0 4px;
          border-radius: 2px;
          text-decoration: line-through;
          margin-left: 4px;
          font-size: 10.5px;
        }
        .ft-mockup-bar {
          position: relative;
          flex: 1;
          height: 14px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }
        .ft-mockup-bar-fill {
          position: absolute;
          inset: 0 auto 0 0;
          background: linear-gradient(90deg, #fb923c, #b8442e);
        }
        .ft-mockup-bar-pct {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 9px;
          color: #fff;
          font-weight: 600;
        }
        .ft-mockup-foot {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-top: 8px;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          font-size: 10.5px;
          flex-wrap: wrap;
        }
        .ft-mockup-flow { gap: 5px; padding-top: 4px; }
        .ft-mockup-old { color: #71717a; text-decoration: line-through; }
        .ft-arrow { color: #52525b; }
        .ft-mockup-new { color: #fb923c; font-weight: 600; }
        .ft-mockup-cost { margin-left: auto; color: #71717a; }
        .ft-mockup-cost strong { color: #fb923c; font-weight: 600; }

        .ft-mockup-policy {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 11px;
          color: #a1a1aa;
          line-height: 1.7;
        }
        .ft-mockup-policy .y-k { color: #fb923c; }
        .ft-mockup-policy .y-v { color: #fafafa; }

        .ft-rcpt-block {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 8px 12px;
        }
        .ft-rcpt-curr {
          border-color: rgba(251, 146, 60, 0.45);
          box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.06);
        }
        .ft-rcpt-key {
          font-size: 9.5px;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 2px;
        }
        .ft-rcpt-hash { font-size: 11.5px; color: #fb923c; font-weight: 600; }
        .ft-rcpt-prev { color: rgba(232, 228, 219, 0.6); font-weight: 400; }
        .ft-rcpt-foot-label { color: #34d399; }
        .ft-rcpt-foot-count { margin-left: auto; color: #71717a; }

        .ft-esc-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(250, 204, 21, 0.30);
          border-radius: 8px;
          padding: 10px 12px;
          box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.06);
        }
        .ft-esc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }
        .ft-esc-title { font-size: 11px; color: #fafafa; font-weight: 600; }
        .ft-esc-meta { font-size: 10px; color: #a1a1aa; margin-bottom: 8px; }
        .ft-esc-actions { display: flex; gap: 6px; }
        .ft-esc-btn {
          flex: 1;
          padding: 5px 10px;
          font-size: 10.5px;
          font-family: var(--mono);
          border-radius: 4px;
          color: #fafafa;
          cursor: default;
        }
        .ft-esc-btn-approve {
          background: rgba(52, 211, 153, 0.16);
          border: 1px solid rgba(52, 211, 153, 0.4);
        }
        .ft-esc-btn-deny {
          background: rgba(248, 113, 113, 0.10);
          border: 1px solid rgba(248, 113, 113, 0.32);
        }
        .ft-mockup-route {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #a1a1aa;
        }
        .ft-route-dot {
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: #fb923c;
          box-shadow: 0 0 6px rgba(251, 146, 60, 0.6);
        }

        /* ── right copy column ── */
        .ft-copy {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 8px 0 0 0;
        }
        .ft-copy-num {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          color: var(--ink-muted);
        }
        .ft-copy-headline {
          font-family: var(--display);
          font-size: clamp(22px, 2vw, 32px);
          font-weight: 500;
          color: var(--ink);
          line-height: 1.18;
          letter-spacing: -0.022em;
          margin: 0;
        }
        .ft-copy-desc {
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--ink-soft);
          margin: 0;
          max-width: 460px;
        }
        .ft-bullets {
          list-style: none;
          padding: 0;
          margin: 8px 0 0 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-left: 16px;
          border-left: 1px solid var(--rule);
        }
        .ft-bullets li {
          position: relative;
          font-size: 13px;
          line-height: 1.55;
          color: var(--ink);
          padding-left: 4px;
        }
        .ft-bullets li::before {
          content: "";
          position: absolute;
          left: -17px;
          top: 8px;
          width: 6px;
          height: 1px;
          background: var(--accent);
        }
      `}</style>
    </section>
  );
}
