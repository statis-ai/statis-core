"use client";

import { useEffect, useRef, useState } from "react";
import "./landing-v6.css";
import { StatisMark } from "@/components/brand/StatisMark";
import { BinaryField } from "@/components/ui/BinaryField";
import ConsoleShowcase from "@/components/landing/v7/ConsoleShowcase";
import PillarsGrid from "@/components/landing/v7/PillarsGrid";
import InTheWild from "@/components/landing/v7/InTheWild";
import BlogHighlights from "@/components/landing/v7/BlogHighlights";

const INSTALL_CMD = "pip install statis-ai";

type BetaStatus = "idle" | "submitting" | "ok" | "error";

const FRAMES = [
  {
    label: "01 · agent hits the gate",
    lines: [
      { k: "$", v: "python briefer.py" },
      { k: "→", v: "refund requested · cus_A1 · $427.00" },
      { k: "·", v: "statis.gate         waiting for approval…", muted: true },
    ],
  },
  {
    label: "02 · signed URL, single use",
    lines: [
      { k: "·", v: "statis.gate         approval required", muted: true },
      { k: " ", v: "  https://statis.dev/a/7b2c · expires 30m" },
      { k: " ", v: "  (open from any device — no account needed)", muted: true },
    ],
  },
  {
    label: "03 · you approve from your phone",
    lines: [
      { k: "·", v: "statis.gate         ✓ approved by aniket@acme.co" },
      { k: "·", v: "                    reason: routine refund, under $500", muted: true },
      { k: "·", v: "                    receipt: sha256:3c7e1a9f…a2f0", muted: true },
    ],
  },
  {
    label: "04 · agent unblocks · receipt written",
    lines: [
      { k: "→", v: "refund.complete     cus_A1 · $427.00" },
      { k: "·", v: "ledger              appended · chain #0847", muted: true },
      { k: "$", v: "_" },
    ],
  },
];

export default function LandingV6() {
  const [copyText, setCopyText] = useState("Copy");
  const [ctaCopyText, setCtaCopyText] = useState("Copy");

  const [betaOpen, setBetaOpen] = useState(false);
  const [betaEmail, setBetaEmail] = useState("");
  const [betaStatus, setBetaStatus] = useState<BetaStatus>("idle");
  const [betaError, setBetaError] = useState<string | null>(null);
  const betaInputRef = useRef<HTMLInputElement | null>(null);

  const [demoFrame, setDemoFrame] = useState(0);
  const [demoPaused, setDemoPaused] = useState(false);
  const demoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    let started = false;

    const node = demoRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            interval = setInterval(() => {
              setDemoFrame((f) => (f + 1) % FRAMES.length);
            }, 2600);
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(node);

    return () => {
      io.disconnect();
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!demoPaused) return;
    const t = setTimeout(() => setDemoPaused(false), 4000);
    return () => clearTimeout(t);
  }, [demoPaused, demoFrame]);

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
  const handleCtaCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    setCtaCopyText("Copied");
    setTimeout(() => setCtaCopyText("Copy"), 1200);
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
          <span className="brand-tag">v0.2 · beta</span>
        </div>
        <nav className="nav" aria-label="Primary">
          <a href="#demo">Demo</a>
          <a href="/blog">Blog</a>
          <a href="https://github.com/statis-ai" rel="noopener">GitHub</a>
          <a href="https://docs.statis.dev" rel="noopener">Docs</a>
        </nav>
        <div className="topbar-right">
          <a href="https://console.statis.dev" className="signin">Sign in</a>
        </div>
      </div>

      {/* ============ HERO ============ */}
      <main className="hero" style={{ position: "relative" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, transparent 0%, rgba(0,0,0,0.6) 60%, black 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, transparent 0%, rgba(0,0,0,0.6) 60%, black 100%)",
            opacity: 0.55,
          }}
        >
          <BinaryField
            cols={70}
            rows={26}
            color="var(--accent)"
            litRatio={0.025}
            flipRatio={0.012}
            baseOpacity={[0.18, 0.42]}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <section className="hero-copy" style={{ position: "relative", zIndex: 1 }}>
          <div className="eyebrow">
            <span className="ver">§ 01</span>
            <span>For teams shipping AI agents to production</span>
          </div>

          <h1 className="hed">
            One decorator.{" "}<br />
            Your agent asks permission{" "}<br />
            <strong>before it touches production.</strong>
          </h1>

          <p className="lede">
            An agent with production credentials hallucinated and deleted a table.
            Nobody wants to be on call for that again.{" "}
            <code>@statis.gate</code> is the decorator we wish we&rsquo;d had.
          </p>

          <div className="install">
            <div className="install-label">
              <span>Python · PyPI · open source</span>
            </div>
            <div className="install-box">
              <span className="install-prompt">$</span>
              <span className="install-cmd">
                pip install <span className="pkg">statis-ai</span>
              </span>
              <button className="copy-btn" onClick={handleCopy} aria-label="Copy install command">
                {copyText}
              </button>
            </div>
          </div>

          <div className="cta-row">
            <a href="#cta" className="btn btn-primary">Join the beta →</a>
            <a href="#demo" className="btn-secondary">See the 90-second demo →</a>
          </div>

          <div className="stack-tags">
            <span className="st-label">Works with</span>
            <span className="st-item">LangGraph</span>
            <span className="st-item">CrewAI</span>
            <span className="st-item">Anthropic SDK</span>
            <span className="st-item">OpenAI SDK</span>
            <span className="st-item muted">any Python agent</span>
          </div>
        </section>

        <aside className="hero-demo" ref={demoRef} style={{ position: "relative", zIndex: 1 }}>
          <div className="demo-code">
            <div className="editor-chrome">
              <span className="chrome-dot" />
              <span className="chrome-dot" />
              <span className="chrome-dot" />
              <span className="filename">refunds.py</span>
            </div>
            <pre className="code-block">
              <code>
                <span className="ln">1</span><span className="kw">import</span> statis{"\n"}
                <span className="ln">2</span><span className="kw">import</span> stripe{"\n"}
                <span className="ln">3</span>{"\n"}
                <span className="ln">4</span><span className="dec">@statis.gate</span>(<span className="str">&quot;stripe.refund&quot;</span>){"\n"}
                <span className="ln">5</span><span className="kw">def</span> <span className="fn">refund</span>(charge_id: <span className="ty">str</span>, cents: <span className="ty">int</span>) -&gt; <span className="ty">dict</span>:{"\n"}
                <span className="ln">6</span>    <span className="kw">return</span> stripe.Refund.create({"\n"}
                <span className="ln">7</span>        charge=charge_id,{"\n"}
                <span className="ln">8</span>        amount=cents,{"\n"}
                <span className="ln">9</span>    ){"\n"}
                <span className="ln">10</span>{"\n"}
                <span className="ln">11</span><span className="com"># first call blocks for a human. second identical call auto-approves</span>{"\n"}
                <span className="ln">12</span><span className="com"># if you&apos;ve approved three in 48h. every decision is receipted.</span>{"\n"}
              </code>
            </pre>
          </div>

          <div className="demo-terminal" data-frame={demoFrame}>
            <div className="term-chrome">
              <div className="term-dots">
                <span className="chrome-dot" />
                <span className="chrome-dot" />
                <span className="chrome-dot" />
              </div>
              <div className="term-frames">
                {FRAMES.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`term-frame-btn${i === demoFrame ? " active" : ""}`}
                    onClick={() => {
                      setDemoFrame(i);
                      setDemoPaused(true);
                    }}
                    aria-label={f.label}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
            <div className="term-body">
              <div className="term-frame-label">{FRAMES[demoFrame].label}</div>
              {FRAMES[demoFrame].lines.map((line, i) => (
                <div key={i} className={`term-line${line.muted ? " muted" : ""}`}>
                  <span className="term-k">{line.k}</span>
                  <span className="term-v">{line.v}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* ============ BINARY DIVIDER ============ */}
      <div
        aria-hidden="true"
        style={{
          width: "100%",
          height: 140,
          overflow: "hidden",
          position: "relative",
          borderTop: "1px solid var(--rule-soft)",
          borderBottom: "1px solid var(--rule-soft)",
        }}
      >
        <BinaryField
          cols={120}
          rows={10}
          seed={0xc0de}
          color="var(--accent)"
          litRatio={0.04}
          flipRatio={0.02}
          baseOpacity={[0.22, 0.5]}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

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

      {/* ============ GRADUATION ============ */}
      <section className="grad">
        <div className="grad-inner">
          <header className="section-header">
            <div className="eyebrow">
              <span className="ver">§ 06</span>
              <span>The retention mechanic</span>
            </div>
            <h2 className="section-hed">
              After the 3rd identical approval,{" "}
              <span>your agent offers you a policy.</span>
            </h2>
            <p className="section-sub">
              The approval page watches the patterns you approve. When you&rsquo;ve said yes three
              times to the same action shape in 48 hours, it drafts the YAML rule for you. Two
              edits, one click — and the 4th is auto-approved. You write policy without realizing.
            </p>
          </header>

          <div className="grad-grid">
            <article className="grad-card">
              <div className="grad-card-head">
                <span className="grad-kind">Approval · pattern detected</span>
                <span className="grad-seq">GRAD-014</span>
              </div>
              <div className="grad-callout">
                This is the <strong>4th</strong> <code>apply_discount</code> you&rsquo;ve approved
                for a customer under <strong>$500</strong> this week.
              </div>
              <div className="grad-question">Auto-approve these going forward?</div>
              <div className="grad-actions">
                <button type="button" className="grad-btn grad-btn-primary">Review policy →</button>
                <button type="button" className="grad-btn grad-btn-ghost">Not yet</button>
              </div>
            </article>

            <article className="grad-yaml">
              <div className="grad-yaml-head">
                <span className="grad-yaml-label">policies/apply_discount.yaml</span>
                <span className="grad-yaml-status">draft · editable</span>
              </div>
              <pre className="yaml-block">
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
            </article>
          </div>

          <div className="grad-footnote">
            Every graduation trigger — fired, accepted, dismissed, edited — is logged. You see the
            policies you&rsquo;re <em>actually</em> willing to automate, not the ones you imagined
            writing in a planning doc.
          </div>
        </div>
      </section>

      {/* ============ DOGFOOD ============ */}
      <section className="dogfood">
        <div className="dogfood-inner">
          <div className="dogfood-copy">
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
            <a href="/blog/statis-on-statis" className="dogfood-link">
              Read the full post →
            </a>
          </div>

          <div className="dogfood-metrics">
            <div className="metric">
              <div className="metric-n">104</div>
              <div className="metric-k">governed actions</div>
              <div className="metric-sub">GitHub merges · deploys · Alembic migrations</div>
            </div>
            <div className="metric">
              <div className="metric-n">0</div>
              <div className="metric-k">incidents</div>
              <div className="metric-sub">since the first receipt was written</div>
            </div>
            <div className="metric">
              <div className="metric-n">100%</div>
              <div className="metric-k">receipted</div>
              <div className="metric-sub">every decision in an unbroken hash chain</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ RECEIPT ============ */}
      <section className="receipt-sec">
        <div className="receipt-inner">
          <header className="section-header">
            <div className="eyebrow">
              <span className="ver">§ 08</span>
              <span>Every decision, receipted</span>
            </div>
            <h2 className="section-hed">
              A hash-chained record{" "}
              <span>for every gate your agent hits.</span>
            </h2>
            <p className="section-sub">
              Receipts are written from action one. The schema is immutable — what ships today will
              still verify in Q4. Signed-receipt verification and SOC 2 export bundles are on the
              roadmap; the chain they verify against starts now.
            </p>
          </header>

          <article className="receipt" aria-label="Example Statis receipt">
            <header className="receipt-header">
              <div>
                <div className="receipt-title">Execution Receipt</div>
                <div className="receipt-id">RCPT-000847 · gate · approved</div>
              </div>
              <div className="receipt-stamp">Authorized</div>
            </header>

            <div className="receipt-body">
              <div className="row">
                <span className="k">Action</span>
                <span className="v"><code>stripe.refund</code></span>
              </div>
              <div className="row">
                <span className="k">Agent</span>
                <span className="v mono">briefer.py · run_7b2c</span>
              </div>
              <div className="row">
                <span className="k">Args</span>
                <span className="v">
                  charge_id=<code>ch_3P…a9</code> · amount_cents=<code>42700</code>
                </span>
              </div>

              <div className="divider">Decision</div>

              <div className="row">
                <span className="k">Mode</span>
                <span className="v">human · single-use URL</span>
              </div>
              <div className="row">
                <span className="k">Approver</span>
                <span className="v mono">aniket@example.com</span>
              </div>
              <div className="row">
                <span className="k">Latency</span>
                <span className="v">38s · well under 5m timeout</span>
              </div>
              <div className="row">
                <span className="k">Result</span>
                <span className="v pass">✓ executed · stripe 2xx</span>
              </div>
            </div>

            <div className="receipt-hash">
              <div className="hash-label">SHA-256 · per-tenant chain</div>
              <div className="hash-value">
                <span className="prev">prev 9f4a2b8d17c0…e51f</span>
                <br />
                <span className="curr">curr 3c7e1a9f2d88b04c…a2f0</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ============ IN THE WILD ============ */}
      <InTheWild />

      {/* ============ BLOG HIGHLIGHTS ============ */}
      <BlogHighlights />

      {/* ============ CLOSING CTA ============ */}
      <section className="cta-wrap" id="cta">
        <div className="cta-inner">
          <div className="cta-left">
            <div className="eyebrow">
              <span className="ver">§ 11</span>
              <span>Start in under a minute</span>
            </div>
            <h2 className="cta-hed">
              One decorator.{" "}<br />
              Your agent asks permission{" "}<br />
              <strong>before it touches production.</strong>
            </h2>
            <p className="cta-sub">
              <code>pip install statis-ai</code>, drop{" "}
              <code>@statis.gate</code> on the function that scares you, push. The first call in
              production waits for a human. The next thousand write the receipts your compliance
              team is going to ask for.
            </p>
          </div>

          <div className="cta-right">
            <div className="cta-card">
              <div className="cta-card-label">Open source · MIT · Python</div>
              <div className="cta-card-install">
                <span className="prompt">$</span>
                <span className="cmd">
                  pip install <span className="pkg">statis-ai</span>
                </span>
                <button className="copy-btn" onClick={handleCtaCopy} aria-label="Copy install command">
                  {ctaCopyText}
                </button>
              </div>
            </div>

            <div className="cta-form-wrap">
              <div className="cta-form-label">Design-partner beta — 12 months free</div>
              {betaStatus === "ok" ? (
                <div className="cta-beta-ok" role="status" aria-live="polite">
                  You&rsquo;re on the list. We&rsquo;ll reach out this week.
                </div>
              ) : !betaOpen ? (
                <button
                  type="button"
                  className="btn btn-primary full"
                  onClick={() => {
                    setBetaOpen(true);
                    setTimeout(() => betaInputRef.current?.focus(), 0);
                  }}
                >
                  Join the design-partner beta →
                </button>
              ) : (
                <form className="beta-form" onSubmit={submitBeta} noValidate>
                  <input
                    ref={betaInputRef}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@work.com"
                    value={betaEmail}
                    onChange={(e) => {
                      setBetaEmail(e.target.value);
                      if (betaStatus === "error") {
                        setBetaStatus("idle");
                        setBetaError(null);
                      }
                    }}
                    aria-label="Work email"
                    aria-invalid={betaStatus === "error"}
                    disabled={betaStatus === "submitting"}
                  />
                  <button
                    type="submit"
                    disabled={betaStatus === "submitting" || betaEmail.trim().length === 0}
                  >
                    {betaStatus === "submitting" ? "…" : "Join →"}
                  </button>
                  {betaStatus === "error" && betaError ? (
                    <div className="beta-error" role="alert">{betaError}</div>
                  ) : null}
                </form>
              )}
            </div>
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
