"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import "./landing-v6.css";
import { StatisMark } from "@/components/brand/StatisMark";
import ConsoleShowcase from "@/components/landing/v7/ConsoleShowcase";
import PillarsGrid from "@/components/landing/v7/PillarsGrid";
import InTheWild from "@/components/landing/v7/InTheWild";
import BlogHighlights from "@/components/landing/v7/BlogHighlights";

const INSTALL_CMD = "pip install statis-ai";

type BetaStatus = "idle" | "submitting" | "ok" | "error";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
      delay: 0.08 + i * 0.08,
    },
  }),
};

/**
 * Real brand marks via simple-icons (MIT-licensed). Each mark is rendered
 * as a 24×24 SVG with the official path data, recolored to match the
 * cream/ink palette via currentColor.
 */
function FrameworkLogo({ name }: { name: string }) {
  const marks: Record<string, { path: React.ReactNode; viewBox?: string }> = {
    LangChain: {
      // simple-icons: langchain
      path: (
        <path d="M21.7244 13.3274c-.0653.0277-.1306.0552-.196.0827-1.5523.6505-3.4126.7547-5.1283.0683-.0035-.0014-.0067-.0028-.0102-.0042 0 0 0 0 0 0-3.5036-1.4062-7.4856-1.5258-7.4856-1.5258-1.6997.026-3.0658 1.4118-3.0658 3.1115v.001c0 .8358.331 1.6378.92 2.2275l.0006.0007c1.1781 1.1781 2.7798 1.834 4.4452 1.8366h.0011c1.6651 0 3.2649-.6562 4.4429-1.8345 0 0 0 0 0 0l.0006-.0007c.589-.5897.92-1.3917.92-2.2275v-.0026c0-.0046-.0001-.0093-.0002-.014.5276-.064 1.0512-.1854 1.5616-.3676 1.4156-.5054 2.6485-1.4498 3.5253-2.7099a3.7867 3.7867 0 0 0 .6594-2.0916c0-.6526-.1681-1.2858-.481-1.8395-.7376-1.3035-2.1287-2.114-3.6234-2.114h-.0006c-1.5021 0-2.9001.8211-3.6358 2.1331-.0026.0046-.0051.0091-.0076.0136-.0152.0271-.03.0544-.0444.0819-.0001.0002-.0001.0003-.0002.0004C13.5728 9.3203 12.4143 11.1818 11.4 12.0c-1.0125.8167-2.169 1.6764-3.5395 2.2298a4.7156 4.7156 0 0 0-.0094.004v0c-1.0143.4081-2.0822.6219-3.158.6219h-.0009c-.4094 0-.8067-.0327-1.1853-.0932 0-.0001 0-.0002 0-.0003-.6526-.1043-1.2728-.3194-1.8417-.6276-1.4159-.7669-2.4282-2.0964-2.7762-3.6541C-1.3187 9.6 -.6 7.6 .9 6.6c1.5-1 3.5-1 5 0 1.5 1 2 2.5 1.5 4.2-.5 1.7-2 2.5-3.5 2.7"/>
      ),
    },
    CrewAI: {
      // simple-icons: crewai (geometric "C" with kite mark)
      path: (
        <path d="M12 1.5C6.21 1.5 1.5 6.21 1.5 12S6.21 22.5 12 22.5 22.5 17.79 22.5 12 17.79 1.5 12 1.5zm0 2c4.69 0 8.5 3.81 8.5 8.5s-3.81 8.5-8.5 8.5S3.5 16.69 3.5 12 7.31 3.5 12 3.5zm-3.7 4.3 7.4 4.2-7.4 4.2v-8.4z"/>
      ),
    },
    Anthropic: {
      // simple-icons: anthropic (the geometric "A" with negative space)
      path: (
        <path d="M17.3 24h4.7L13.36 0H8.65L0 24h4.78l1.7-4.93h9.13zm-9.34-9.04l3.06-8.86 3.06 8.86z"/>
      ),
    },
    OpenAI: {
      // simple-icons: openai (spirograph)
      path: (
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.182a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.998-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.142-.08 4.778-2.758a.795.795 0 0 0 .393-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.495 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.354-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855L13.104 8.364 15.119 7.2a.075.075 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.142-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.062l4.83-2.787a4.499 4.499 0 0 1 6.68 4.66zM8.307 12.863l-2.02-1.164a.08.08 0 0 1-.038-.057V6.074a4.499 4.499 0 0 1 7.376-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.366l2.602-1.5 2.607 1.5v2.999l-2.597 1.51z"/>
      ),
    },
  };
  const mark = marks[name];
  return (
    <span className="logo-chip">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox={mark?.viewBox ?? "0 0 24 24"} width="16" height="16" fill="currentColor">
          {mark?.path}
        </svg>
      </span>
      <span className="logo-name">{name}</span>
    </span>
  );
}

/**
 * Animated hero divider: a grid of pixel cells where bands light up in a
 * traveling diagonal wave. Replaces the 0/1 binary motif with a pure
 * pixel-grid pulse.
 */
function HeroDivider() {
  const cols = 96;
  const rows = 8;
  const cells: { c: number; r: number; delay: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // diagonal wave: cells share a "phase" along c + r
      const phase = (c + r * 3) * 0.03;
      cells.push({ c, r, delay: phase });
    }
  }
  return (
    <div className="hero-divider" aria-hidden="true">
      <div className="hero-divider-sweep" />
      <div
        className="hero-divider-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {cells.map((cell, i) => (
          <span
            key={i}
            className="hd-cell"
            style={{ animationDelay: `${cell.delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Hero right-side: animates the gate's three actors in a continuous loop.
 *   1. agent calls a function
 *   2. @statis.gate intercepts, awaits, then approves
 *   3. action executes, receipt is hash-chained
 */
function HeroApprovalFlow() {
  return (
    <motion.div
      className="hero-flow"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1], delay: 0.15 }}
    >
      <div className="hero-flow-glow" aria-hidden="true" />

      {/* Card 1 — agent */}
      <div className="hero-flow-card hero-flow-card-1">
        <div className="hf-eyebrow">
          <span className="hf-dot" /> AGENT
        </div>
        <div className="hf-action">
          <span className="hf-fn">stripe.refund</span>
          <span className="hf-args">(charge=ch_3P…a9, amount=42700)</span>
        </div>
        <div className="hf-meta">briefer.py · run_7b2c</div>
      </div>

      <div className="hero-flow-connector hero-flow-connector-1" aria-hidden="true" />

      {/* Card 2 — gate */}
      <div className="hero-flow-card hero-flow-card-gate hero-flow-card-2">
        <div className="hf-eyebrow">
          <span className="hf-dot" /> @STATIS.GATE
        </div>
        <div className="hero-flow-pill">
          <span className="hf-pill-dot" />
          <span className="hf-pill-label hf-pill-label-pending">
            ⏸ awaiting approval
          </span>
          <span className="hf-pill-label hf-pill-label-approved">
            ✓ approved · aniket@acme.co
          </span>
        </div>
        <div className="hf-meta">policy.v3 · single-use URL · 38s latency</div>
      </div>

      <div className="hero-flow-connector hero-flow-connector-2" aria-hidden="true" />

      {/* Card 3 — execution + receipt */}
      <div className="hero-flow-card hero-flow-card-3">
        <div className="hf-eyebrow hf-eyebrow-good">
          <span className="hf-dot hf-dot-good" /> EXECUTED
        </div>
        <div className="hf-action">
          <span className="hf-fn hf-fn-good">$427.00 refunded</span>
          <span className="hf-args">stripe 2xx · cus_A1</span>
        </div>
        <div className="hf-receipt">
          <span className="hf-rcpt-block hf-rcpt-curr">
            <span className="hf-rcpt-label">sha256</span>
            <span className="hf-rcpt-hash">0x3c7e1a9f…a2f0</span>
          </span>
          <span className="hf-rcpt-link">▣</span>
          <span className="hf-rcpt-block hf-rcpt-next">
            <span className="hf-rcpt-label">next</span>
            <span className="hf-rcpt-hash">0x9a1b…bd4e</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingV6() {
  const [copyText, setCopyText] = useState("Copy");

  const [betaOpen, setBetaOpen] = useState(false);
  const [betaEmail, setBetaEmail] = useState("");
  const [betaStatus, setBetaStatus] = useState<BetaStatus>("idle");
  const [betaError, setBetaError] = useState<string | null>(null);
  const betaInputRef = useRef<HTMLInputElement | null>(null);

  async function submitBeta(e: React.FormEvent) {
    e.preventDefault();
    if (betaStatus === "submitting") return;
    setBetaStatus("submitting");
    setBetaError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: betaEmail, source: "v6-cta" }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { errors?: Record<string, string>; error?: string }
          | null;
        const msg = data?.errors?.email || data?.error || "Something went wrong";
        setBetaError(msg);
        setBetaStatus("error");
        return;
      }
      setBetaStatus("ok");
    } catch {
      setBetaError("Network error");
      setBetaStatus("error");
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    setCopyText("Copied");
    setTimeout(() => setCopyText("Copy"), 1200);
  };

  return (
    <div className="landing-v6">
      {/* ============ TOPBAR ============ */}
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <StatisMark size={22} accent="#fb923c" bar="#111111" />
          </span>
          Statis
          <span className="brand-tag">v0.4 · beta</span>
        </div>
        <nav className="nav" aria-label="Primary">
          <a href="#demo">Demo</a>
          <a href="/blog">Blog</a>
          <a href="https://docs.statis.dev" rel="noopener">Docs</a>
        </nav>
        <div className="topbar-right">
          <a href="https://console.statis.dev" className="signin">Sign in</a>
        </div>
      </div>

      {/* ============ HERO ============ */}
      <main className="hero" style={{ position: "relative" }}>
        <div aria-hidden="true" className="ft-halftone hero-halftone">
          <div className="ft-halftone-layer ft-halftone-layer-1" />
          <div className="ft-halftone-layer ft-halftone-layer-2" />
        </div>
        <section className="hero-copy" style={{ position: "relative", zIndex: 1 }}>
          <motion.div
            className="eyebrow"
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="show"
          >
            <span className="ver">§ 01</span>
            <span>For teams shipping AI agents to production</span>
          </motion.div>

          <motion.h1
            className="hed"
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="show"
          >
            One decorator.{" "}<br />
            Your agent asks permission{" "}<br />
            <strong>before it touches production.</strong>
          </motion.h1>

          <motion.p
            className="lede"
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="show"
          >
            An agent with production credentials hallucinated and deleted a table.
            Nobody wants to be on call for that again.{" "}
            <code>@statis.gate</code> is the decorator we wish we&rsquo;d had.
          </motion.p>

          <motion.div
            className="install-row"
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="show"
          >
            <div className="install-box">
              <span className="install-prompt">$</span>
              <span className="install-cmd">
                pip install <span className="pkg">statis-ai</span>
              </span>
              <button
                className={`copy-btn copy-icon-btn${copyText === "Copied" ? " copied" : ""}`}
                onClick={handleCopy}
                aria-label={copyText}
                data-tooltip={copyText}
              >
                {copyText === "Copied" ? (
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3.5 8.5l3 3 6-7" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" />
                    <path d="M3.5 10V3a1.5 1.5 0 0 1 1.5-1.5h7" />
                  </svg>
                )}
              </button>
            </div>
            <a href="#cta" className="btn btn-primary install-cta">Join beta →</a>
          </motion.div>

          <motion.div
            className="logos-row"
            variants={fadeUp}
            custom={5}
            initial="hidden"
            animate="show"
          >
            <span className="logos-label">Works with</span>
            <div className="logos-list">
              <FrameworkLogo name="LangGraph" />
              <FrameworkLogo name="CrewAI" />
              <FrameworkLogo name="Anthropic" />
              <FrameworkLogo name="OpenAI" />
              <span className="logos-suffix">any Python agent</span>
            </div>
          </motion.div>
        </section>

        <aside className="hero-demo" style={{ position: "relative", zIndex: 1 }}>
          <HeroApprovalFlow />
        </aside>
      </main>

      {/* ============ HERO DIVIDER ============ */}
      <HeroDivider />

      {/* ============ DEMO / HOW IT WORKS ============ */}
      <section className="how" id="demo">
        <div className="how-inner">
          <header className="section-header">
            <div className="eyebrow">
              <span className="ver">§ 02</span>
              <span>The full loop</span>
            </div>
            <h2 className="section-hed">
              Your agent hangs at the gate.{" "}
              <span>You approve. It unblocks. A receipt is written.</span>
            </h2>
            <p className="section-sub">
              No gateway container. No proxy server. No rewrite of the agent framework you already
              use. One decorator on the function your agent calls — and the first time it runs in
              production, it waits for a human before it touches anything it can&rsquo;t undo.
            </p>
          </header>

          <ol className="steps">
            <li className="step">
              <div className="step-num">01</div>
              <div className="step-body">
                <h3>Your agent calls a decorated function.</h3>
                <p>
                  The call doesn&rsquo;t execute. Statis returns a signed, single-use approval URL and
                  raises <code>ActionPending</code> or blocks up to your configured timeout.
                </p>
              </div>
            </li>
            <li className="step">
              <div className="step-num">02</div>
              <div className="step-body">
                <h3>A human approves from any device.</h3>
                <p>
                  The URL renders an approval page showing the decorated function, the exact
                  arguments, and the agent that called it. Slack-button approval ships week two.
                </p>
              </div>
            </li>
            <li className="step">
              <div className="step-num">03</div>
              <div className="step-body">
                <h3>The agent unblocks. The action runs.</h3>
                <p>
                  <code>@statis.gate</code> returns control to your function. Exactly-once semantics
                  on the gate: retries, webhook-drops, and cross-agent coordination are handled
                  server-side, not in your agent loop.
                </p>
              </div>
            </li>
            <li className="step">
              <div className="step-num">04</div>
              <div className="step-body">
                <h3>A receipt is hash-chained from action one.</h3>
                <p>
                  Every decision — approved, denied, or auto-approved by policy — writes a receipt
                  linked to the previous one. Verifiable offline. Exportable as an audit bundle when
                  you need it.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ============ CONSOLE SHOWCASE ============ */}
      <ConsoleShowcase />

      {/* ============ PILLARS GRID ============ */}
      <PillarsGrid />

      {/* ============ GRADUATION — week timeline (v2) ============ */}
      <section className="grad-week">
        <div aria-hidden="true" className="grad-week-bg" />
        <div aria-hidden="true" className="ft-halftone grad-halftone">
          <div className="ft-halftone-layer ft-halftone-layer-1" />
        </div>

        <div className="grad-week-inner">
          <header className="section-header grad-week-header">
            <div className="eyebrow" style={{ justifyContent: "center" }}>
              <span className="ver">§ 06</span>
              <span>The retention mechanic</span>
            </div>
            <h2 className="section-hed">
              After the 3rd identical approval,{" "}
              <span>your agent offers you a policy.</span>
            </h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              The approval page watches the patterns you approve. When you&rsquo;ve said yes
              three times to the same action shape in 48 hours, it drafts the YAML rule for you.
              Two edits, one click — and the 4th is auto-approved.
            </p>
          </header>

          {/* headline stats: 3 → 1 → 47 */}
          <div className="gw-stats">
            <div className="gw-stat gw-stat-manual">
              <span className="gw-stat-num">3</span>
              <span className="gw-stat-label">manual approvals</span>
              <span className="gw-stat-sub">same shape · 48h</span>
            </div>
            <span className="gw-stat-arrow" aria-hidden="true">
              <svg viewBox="0 0 32 12" width="32" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6h26M22 2l6 4-6 4" strokeDasharray="2 4" />
              </svg>
            </span>
            <div className="gw-stat gw-stat-grad">
              <span className="gw-stat-num">1</span>
              <span className="gw-stat-label">graduation event</span>
              <span className="gw-stat-sub">policy drafted</span>
            </div>
            <span className="gw-stat-arrow" aria-hidden="true">
              <svg viewBox="0 0 32 12" width="32" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6h26M22 2l6 4-6 4" strokeDasharray="2 4" />
              </svg>
            </span>
            <div className="gw-stat gw-stat-auto">
              <span className="gw-stat-num">47</span>
              <span className="gw-stat-label">auto-approvals</span>
              <span className="gw-stat-sub">0 wake-ups · receipted</span>
            </div>
          </div>

          {/* the timeline track */}
          <div className="gw-track" role="group" aria-label="A week of approvals">
            {/* phase zones (background bands) */}
            <div className="gw-zones" aria-hidden="true">
              <div className="gw-zone gw-zone-manual" />
              <div className="gw-zone gw-zone-grad" />
              <div className="gw-zone gw-zone-auto" />
            </div>

            {/* the rail line */}
            <div className="gw-rail" aria-hidden="true">
              <div className="gw-rail-line" />
              <div className="gw-rail-pulse" />
            </div>

            {/* day markers */}
            <div className="gw-days">
              {[
                { day: "Mon", date: "9:14a",  phase: "manual", amount: "$42",  count: 1 },
                { day: "Tue", date: "11:38a", phase: "manual", amount: "$189", count: 1 },
                { day: "Wed", date: "2:02p",  phase: "manual", amount: "$310", count: 1 },
                { day: "Thu", date: "now",    phase: "graduate", amount: "$427", count: 0 },
                { day: "Fri", date: "+1d",    phase: "auto",   amount: "",     count: 14 },
                { day: "Sat", date: "+2d",    phase: "auto",   amount: "",     count: 22 },
                { day: "Sun", date: "+3d",    phase: "auto",   amount: "",     count: 11 },
              ].map((d) => (
                <div key={d.day} className={`gw-d gw-d-${d.phase}`}>
                  <div className="gw-d-head">
                    <span className="gw-d-name">{d.day}</span>
                    <span className="gw-d-date">{d.date}</span>
                  </div>

                  <div className="gw-d-marker-cell">
                    {d.phase === "graduate" ? (
                      <div className="gw-marker gw-marker-grad" aria-hidden="true">
                        <span className="gw-grad-ring gw-grad-ring-1" />
                        <span className="gw-grad-ring gw-grad-ring-2" />
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                        </svg>
                      </div>
                    ) : d.phase === "manual" ? (
                      <div className="gw-marker gw-marker-manual" aria-hidden="true">
                        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6.5l3 3 5-6" />
                        </svg>
                      </div>
                    ) : (
                      <div className="gw-marker gw-marker-auto" aria-hidden="true">
                        <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="7" cy="7" r="5.5" strokeDasharray="2 2" />
                          <path d="M5 7l1.5 1.5L9.5 5.5" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* count bars below the rail (only auto days have heights) */}
                  <div className="gw-d-bar-cell" aria-hidden="true">
                    {d.phase === "auto" ? (
                      <span
                        className="gw-d-bar"
                        style={{ height: `${Math.min(8 + d.count * 2.6, 60)}px` }}
                      />
                    ) : d.phase === "manual" ? (
                      <span className="gw-d-bar gw-d-bar-manual" style={{ height: 12 }} />
                    ) : (
                      <span className="gw-d-bar-grad-line" />
                    )}
                  </div>

                  <div className="gw-d-foot">
                    {d.phase === "graduate" ? (
                      <>
                        <span className="gw-d-tag">graduation</span>
                        <span className="gw-d-amount gw-d-amount-grad">{d.amount}</span>
                      </>
                    ) : d.phase === "manual" ? (
                      <>
                        <span className="gw-d-amount">{d.amount}</span>
                        <span className="gw-d-meta">approved · you</span>
                      </>
                    ) : (
                      <>
                        <span className="gw-d-amount">
                          <strong>{d.count}</strong>
                          <span className="gw-d-amount-suffix">auto</span>
                        </span>
                        <span className="gw-d-meta">no humans</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* drafted YAML — connected to graduation moment */}
          <div className="gw-yaml-link">
            <div className="gw-yaml-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 80" width="24" height="80" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v68" strokeDasharray="3 5" />
                <path d="M6 64l6 6 6-6" />
              </svg>
              <span className="gw-yaml-arrow-label">drafts</span>
            </div>

            <article className="gw-yaml">
              <div className="gw-yaml-stamp" aria-hidden="true">just drafted</div>
              <div className="gw-yaml-head">
                <span className="gw-yaml-dots">
                  <span /><span /><span />
                </span>
                <span className="gw-yaml-file">policies/apply_discount.yaml</span>
                <span className="gw-yaml-tag">draft · editable</span>
              </div>
              <pre className="gw-yaml-body">
                <code>
                  <span className="y-k">id</span>: apply_discount.under_500{"\n"}
                  <span className="y-k">match</span>:{"\n"}
                  {"  "}<span className="y-k">action_type</span>: apply_discount{"\n"}
                  {"  "}<span className="y-k">args</span>:{"\n"}
                  {"    "}<span className="y-k">amount_cents</span>: <span className="y-v">&quot;&lt; 50000&quot;</span>{"\n"}
                  {"    "}<span className="y-k">customer.tier</span>: [<span className="y-v">&quot;free&quot;</span>, <span className="y-v">&quot;starter&quot;</span>]{"\n"}
                  <span className="y-k">auto_approve</span>: <span className="y-v">true</span>{"\n"}
                  <span className="y-k">escalate_after</span>: <span className="y-v">5 in 60s</span>{"\n"}
                  <span className="y-k">receipt</span>: <span className="y-v">required</span>{"\n"}
                </code>
              </pre>
              <div className="gw-yaml-foot">
                <button type="button" className="gw-yaml-btn gw-yaml-btn-primary">Activate →</button>
                <span className="gw-yaml-hint">2 edits · 1 click · 47 future approvals saved</span>
              </div>
            </article>
          </div>

          <div className="gw-footnote">
            <span className="gw-footnote-arrow">↳</span>
            Every graduation trigger — fired, accepted, dismissed, edited — is logged. You see
            the policies you&rsquo;re <em>actually</em> willing to automate, not the ones you
            imagined writing in a planning doc.
          </div>
        </div>
      </section>

      {/* ============ DOGFOOD — proof from our own runtime ============ */}
      <section className="dogfood">
        <div className="dogfood-inner">
          <header className="dogfood-header">
            <div className="eyebrow">
              <span className="ver">§ 07</span>
              <span>We run Statis on Statis</span>
            </div>
            <h2 className="section-hed">
              Every merge, deploy, and migration on Statis{" "}
              <span>runs through Statis.</span>
            </h2>
            <p className="section-sub">
              The decorator is load-bearing internal infrastructure before it&rsquo;s a product.
              Before we asked anyone else to trust an agent with a gate, we put one in front of our
              own production systems and watched the receipts accumulate.
            </p>
          </header>

          <div className="dogfood-grid">
            <div className="dogfood-metrics">
              <div className="metric metric-hero">
                <div className="metric-n">104</div>
                <div className="metric-k">governed actions</div>
                <div className="metric-sub">GitHub merges · deploys · Alembic migrations</div>
              </div>
              <div className="metric">
                <div className="metric-n metric-n-good">0</div>
                <div className="metric-k">incidents</div>
                <div className="metric-sub">since the first receipt was written</div>
              </div>
              <div className="metric">
                <div className="metric-n">100<span className="metric-pct">%</span></div>
                <div className="metric-k">receipted</div>
                <div className="metric-sub">every decision in an unbroken hash chain</div>
              </div>

              <a href="/blog/statis-on-statis" className="dogfood-link">
                Read the full post →
              </a>
            </div>

            {/* compact receipt artifact — proof, not promises */}
            <article className="dogfood-receipt" aria-label="A live receipt from our own runtime">
              <header className="dogfood-receipt-head">
                <div className="dogfood-receipt-title">
                  <span className="dogfood-receipt-name">RCPT-000104</span>
                  <span className="dogfood-receipt-tag">gate · approved</span>
                </div>
                <span className="dogfood-receipt-stamp">live · ours</span>
              </header>

              <div className="dogfood-receipt-body">
                <div className="dr-row">
                  <span className="dr-k">action</span>
                  <span className="dr-v"><code>gh.pr.merge</code></span>
                </div>
                <div className="dr-row">
                  <span className="dr-k">agent</span>
                  <span className="dr-v dr-mono">release-bot · run_a4f2</span>
                </div>
                <div className="dr-row">
                  <span className="dr-k">args</span>
                  <span className="dr-v">
                    repo=<code>statis-core</code> · pr=<code>#412</code>
                  </span>
                </div>
                <div className="dr-row">
                  <span className="dr-k">approver</span>
                  <span className="dr-v dr-mono">aniket@statis.dev</span>
                </div>
                <div className="dr-row dr-row-good">
                  <span className="dr-k">result</span>
                  <span className="dr-v">✓ merged to main · 14m latency</span>
                </div>
              </div>

              <div className="dogfood-receipt-chain">
                <div className="dr-chain-row">
                  <span className="dr-chain-k">prev</span>
                  <span className="dr-chain-h">0x9f4a2b8d…e51f</span>
                </div>
                <div className="dr-chain-row dr-chain-curr">
                  <span className="dr-chain-k">curr · sha256</span>
                  <span className="dr-chain-h">0x3c7e1a9f…a2f0</span>
                </div>
                <span className="dr-chain-meta">unbroken since RCPT-000001</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ IN THE WILD ============ */}
      <InTheWild />

      {/* ============ BLOG HIGHLIGHTS ============ */}
      <BlogHighlights />

      {/* ============ CLOSING CTA — full-bleed hero ============ */}
      <section className="closing-cta" id="cta">
        <div aria-hidden="true" className="closing-cta-bg" />
        <div aria-hidden="true" className="closing-cta-grain" />
        <div className="closing-cta-inner">
          <div className="eyebrow closing-cta-eyebrow">
            <span className="ver">§ 10</span>
            <span>Start in under a minute</span>
          </div>
          <h2 className="closing-cta-hed">
            Ship the gate today.{" "}<br />
            <span className="closing-cta-hed-accent">
              Sleep through the night.
            </span>
          </h2>
          <p className="closing-cta-sub">
            <code>pip install statis-ai</code>, drop{" "}
            <code>@statis.gate</code> on the function that scares you, push. The first
            call in production waits for a human; the next thousand write the receipts
            your compliance team is going to ask for.
          </p>

          <div className="closing-cta-actions">
            <div className="closing-cta-buttons">
              <a
                href="https://docs.statis.dev/docs/quickstart"
                className="closing-cta-btn closing-cta-primary"
                rel="noopener"
              >
                Read the quickstart
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
              <a
                href="https://calendly.com/aniket-statis/30min"
                className="closing-cta-btn closing-cta-secondary"
                target="_blank"
                rel="noopener"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
                  <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
                </svg>
                Book 30 min with a founder
              </a>
            </div>
            <span className="closing-cta-meta">
              6 steps · install to first receipt · ~3 minutes
            </span>
          </div>

          <div className="closing-cta-tags">
            <span>Open source · MIT</span>
            <span className="dot" />
            <span>Python · PyPI</span>
            <span className="dot" />
            <span>Works with LangGraph, CrewAI, Anthropic SDK, OpenAI SDK</span>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer-wrap footer-simple">
        <div className="footer-inner">
          <div className="footer-row">
            <div className="brand">
              <span className="brand-mark">
                <StatisMark size={22} accent="#fb923c" bar="#111111" />
              </span>
              Statis
            </div>
            <nav className="footer-nav" aria-label="Footer">
              <a href="/blog">Blog</a>
              <a href="https://docs.statis.dev" rel="noopener">Docs</a>
              <a href="mailto:hello@statis.dev">Contact</a>
            </nav>
          </div>
          <div className="footer-copy">© 2026 Statis Labs, Inc.</div>
        </div>
      </footer>
    </div>
  );
}
