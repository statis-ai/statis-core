"use client";

import { useEffect, useRef, useState } from "react";
import "./landing-v5.css";

type Lang = "python" | "typescript" | "cli";
type Tier = "kit" | "cloud";

const FILENAMES: Record<Lang, string> = {
  python: "app.py",
  typescript: "app.ts",
  cli: "terminal",
};

export default function LandingV5() {
  const [lang, setLang] = useState<Lang>("python");
  const [tier, setTier] = useState<Tier>("kit");
  const [copyText, setCopyText] = useState("Copy");
  const [ctaCopyText, setCtaCopyText] = useState("Copy");
  const [chainCount, setChainCount] = useState(847);
  const [chainAnimated, setChainAnimated] = useState(false);

  const [betaOpen, setBetaOpen] = useState(false);
  const [betaEmail, setBetaEmail] = useState("");
  const [betaStatus, setBetaStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [betaError, setBetaError] = useState<string | null>(null);

  const chainRef = useRef<HTMLDivElement | null>(null);
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
        body: JSON.stringify({ email: betaEmail, source: "tier-beta-cta" }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { errors?: Record<string, string>; error?: string } | null;
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

  // Hash-chain scroll reveal + counter ticker
  useEffect(() => {
    const node = chainRef.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setChainAnimated(true);
      return;
    }

    let tickerTimeout: ReturnType<typeof setTimeout> | null = null;
    let tickerInterval: ReturnType<typeof setInterval> | null = null;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setChainAnimated(true);

            // start ticker ~1.8s after the last node appears (~860ms delay)
            tickerTimeout = setTimeout(() => {
              tickerInterval = setInterval(() => {
                // 1-3 new receipts every 3.5-6.5 seconds
                setChainCount((c) => c + Math.floor(Math.random() * 3) + 1);
              }, 3500 + Math.random() * 3000);
            }, 1800);

            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );

    io.observe(node);

    return () => {
      io.disconnect();
      if (tickerTimeout) clearTimeout(tickerTimeout);
      if (tickerInterval) clearInterval(tickerInterval);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("pip install statis-kit");
    setCopyText("Copied");
    setTimeout(() => setCopyText("Copy"), 1200);
  };

  const handleCtaCopy = () => {
    navigator.clipboard.writeText("pip install statis-kit");
    setCtaCopyText("Copied");
    setTimeout(() => setCtaCopyText("Copy"), 1200);
  };

  const isActiveBlock = (blockLang: Lang, blockTier: Tier) =>
    blockLang === lang && blockTier === tier;

  return (
    <div className="landing-v5">
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <svg
              viewBox="0 0 240 240"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Statis mark"
            >
              <rect x="20" y="40" width="40" height="180" fill="#111111" />
              <rect x="180" y="40" width="40" height="180" fill="#111111" />
              <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
              <rect x="110" y="200" width="20" height="20" fill="#111111" />
            </svg>
          </span>
          Statis
          <span className="brand-tag">v0.1.1 · beta</span>
        </div>
        <nav className="nav">
          <a href="#">Context Kit</a>
          <a href="#">Cloud</a>
          <a href="#">Enterprise</a>
          <a href="#">Docs</a>
          <a href="#">Receipts</a>
          <a href="#">Changelog</a>
        </nav>
        <div className="topbar-right">
          <a href="#">Sign in</a>
        </div>
      </div>

      <main className="hero">
        <section>
          <div className="eyebrow">
            <span className="ver">§ 01</span>
            <span>For teams shipping AI agents to production</span>
          </div>

          <h1 className="hed">
            Every context evaluated.<br />
            Every action authorized.<br />
            <strong>Every execution receipted.</strong>
          </h1>

          <p className="triad">
            When your compliance team asks what your agents did, Statis hands them a{" "}
            <strong>signed, hash-chained receipt</strong> for every decision — not a log file to grep through.
          </p>

          <div className="install">
            <div className="install-label">
              <span>Install the Context Kit — OSS, local, zero-auth</span>
              <span className="badge">PyPI · npm</span>
            </div>
            <div className="install-box">
              <span className="install-prompt">$</span>
              <span className="install-cmd">
                pip install <span className="pkg">statis-kit</span>
              </span>
              <button className="copy-btn" onClick={handleCopy}>
                {copyText}
              </button>
            </div>
            <div className="install-alt">
              <span>
                or <a href="#">npm i @statis/kit</a>
              </span>
              <span className="dot-sep">·</span>
              <a href="#">Read the docs →</a>
            </div>
          </div>

          <div className="trust">
            <span className="trust-label">Compliance · roadmap</span>
            <span className="trust-item pending">SOC 2</span>
            <span className="trust-item pending">HIPAA</span>
            <span className="trust-item pending">SEC 17a-4</span>
            <span className="trust-item pending">GDPR</span>
          </div>
        </section>

        <section className="receipt-wrap">
          <div className="annot annot-1">
            <span className="num">01</span>
            <span>context admitted</span>
          </div>
          <div className="annot annot-2">
            <span className="num">02</span>
            <span>action authorized</span>
          </div>
          <div className="annot annot-3">
            <span className="num">03</span>
            <span>hash-chained · signed</span>
          </div>

          <article className="receipt" aria-label="Example Statis execution receipt">
            <header className="receipt-header">
              <div>
                <div className="receipt-title">Execution Receipt</div>
                <div className="receipt-id">RCPT-2026-04-21-a3f9c17e · seq 000847</div>
              </div>
              <div className="receipt-stamp">Authorized</div>
            </header>

            <div className="receipt-body">
              <div className="row">
                <span className="k">Agent</span>
                <span className="v">
                  <code>nexus.account-briefer</code> · run_id 7b2c
                </span>
              </div>
              <div className="row">
                <span className="k">Tenant</span>
                <span className="v">org_surveymonkey · prod</span>
              </div>

              <div className="divider">Context In — admission</div>

              <div className="row">
                <span className="k">Compressed</span>
                <span className="v">
                  18,420 → 4,112 tokens{" "}
                  <span style={{ color: "var(--ink-muted)" }}>(4.48× · 77.7%)</span>
                </span>
              </div>
              <div className="row">
                <span className="k">Guard</span>
                <span className="v pass">✓ clean · PII redacted (3) · no prompt-inject detected</span>
              </div>
              <div className="row">
                <span className="k">Cost meter</span>
                <span className="v">$0.0041 · budget 94% remaining</span>
              </div>

              <div className="divider">Action Out — authorization</div>

              <div className="row">
                <span className="k">Policy</span>
                <span className="v">
                  <code>policy.v3.slack-write</code> matched{" "}
                  <span style={{ color: "var(--ink-muted)" }}>(rule #12)</span>
                </span>
              </div>
              <div className="row">
                <span className="k">Adapter</span>
                <span className="v">slack.postMessage → #cs-briefings</span>
              </div>
              <div className="row">
                <span className="k">Approval</span>
                <span className="v pass">✓ auto · within-policy · kill-switch armed</span>
              </div>
            </div>

            <div className="receipt-hash">
              <div className="hash-label">Hash chain — SHA-256</div>
              <div className="hash-value">
                <span className="prev">prev 9f4a2b8d17c0…e51f</span>
                <br />
                <span className="curr">curr 3c7e1a9f2d88b04c…a2f0</span>
              </div>
            </div>

            <footer className="signature">
              <div>
                <div className="sig-block">
                  <div className="algo">Ed25519 · signed</div>
                  2026-04-21T14:22:07Z
                </div>
                <div className="sig-value" style={{ marginTop: 8 }}>
                  MEUCIQDp4z…k3Vb / QCnL9Xf…a7Tm
                </div>
              </div>
              <div className="sig-seal">S</div>
            </footer>
          </article>
        </section>
      </main>

      <section className="pillars">
        <div className="pillar">
          <div className="num">§ 01 — Context In</div>
          <h3>
            Admit, <span>don&apos;t assume.</span>
          </h3>
          <p>
            Compress prompts, redact PII, catch injection, meter spend — before a single token reaches your model.
          </p>
          <div className="parts">compressor · guard · meter · sanitization · admission</div>
        </div>
        <div className="pillar">
          <div className="num">§ 02 — Action Out</div>
          <h3>
            Authorize <span>every call.</span>
          </h3>
          <p>
            Policy-as-code at the tool boundary. Human approvals for high-risk actions. Kill-switch the moment something drifts.
          </p>
          <div className="parts">policies · approvals · adapters · kill switch</div>
        </div>
        <div className="pillar">
          <div className="num">§ 03 — Receipt Through</div>
          <h3>
            Prove <span>what happened.</span>
          </h3>
          <p>
            Hash-chained, Ed25519-signed receipts for every decision. SOC 2, HIPAA, and SEC bundle exports on the roadmap.
          </p>
          <div className="parts">hash chain · signing · immutable audit · compliance export</div>
        </div>
        <div className="pillar">
          <div className="num">§ 04 — Broadcast</div>
          <h3>
            Agents, <span>in concert.</span>
          </h3>
          <p>
            First-class state sync between agents. Share compressed context envelopes without re-admitting from scratch.
          </p>
          <div className="parts">state sync · envelope exchange · fan-out · coordination</div>
        </div>
      </section>

      <section className="tiers-wrap">
        <div className="tiers-inner">
          <header className="tiers-header">
            <div className="eyebrow">
              <span className="ver">§ 02</span>
              <span>Three tiers, one SDK</span>
            </div>
            <h2 className="section-hed">
              Install locally. <span>Upgrade when you need correlation.</span>
            </h2>
            <p className="section-sub">
              The dividing rule is sharp: if a decision lives inside a single call, the open-source Kit handles it on your machine. The moment you need to correlate across calls, agents, or tenants — identity, storage, audit — Cloud and Enterprise take over.
            </p>
          </header>

          <div className="tiers-rule">
            <div className="rule-col">
              <span className="rule-label">Single call</span>
              <span className="rule-arrow">→</span>
              <span className="rule-target">Kit</span>
            </div>
            <div className="rule-sep"></div>
            <div className="rule-col">
              <span className="rule-label">Cross-call · identity · storage</span>
              <span className="rule-arrow">→</span>
              <span className="rule-target">Cloud / Enterprise</span>
            </div>
          </div>

          <div className="tiers">
            {/* KIT */}
            <article className="tier">
              <div className="tier-top">
                <div className="tier-num">§ 01</div>
                <h3 className="tier-name">Context Kit</h3>
                <div className="tier-kind">Open source · MIT</div>
                <p className="tier-desc">
                  Local, zero-auth. Drop it into any agent today. No account, no egress, no telemetry — just the compressor, guard, meter, and a playground.
                </p>
              </div>

              <div className="tier-price">
                <span className="price-amt">Free</span>
                <span className="price-unit">forever</span>
              </div>

              <div className="tier-install">
                <span className="prompt">$</span>
                <span className="cmd">
                  pip install <span className="pkg">statis-kit</span>
                </span>
              </div>

              <ul className="tier-list">
                <li>
                  <span className="dot"></span> Prompt compressor
                </li>
                <li>
                  <span className="dot"></span> Guard (PII, injection, toxicity)
                </li>
                <li>
                  <span className="dot"></span> Cost meter + budget
                </li>
                <li>
                  <span className="dot"></span> Local playground
                </li>
                <li className="muted">
                  <span className="dot empty"></span> No cross-call tracing
                </li>
                <li className="muted">
                  <span className="dot empty"></span> No persisted receipts
                </li>
              </ul>

              <a href="#" className="tier-cta outline">
                Read the Kit docs →
              </a>
            </article>

            {/* CLOUD (featured) */}
            <article className="tier featured">
              <div className="tier-ribbon">Free during beta</div>
              <div className="tier-top">
                <div className="tier-num">§ 02</div>
                <h3 className="tier-name">Developer Cloud</h3>
                <div className="tier-kind">Hosted · managed</div>
                <p className="tier-desc">
                  Add one line to the Kit and cross-call tracing lights up. Policy UI, execution history, semantic guard, multi-agent receipts — all stored, all searchable, all yours.
                </p>
              </div>

              <div className="tier-price">
                <span className="price-amt">$0</span>
                <span className="price-unit">beta · usage-based at GA</span>
              </div>

              <div className="tier-install">
                <span className="prompt">$</span>
                <span className="cmd">
                  export STATIS_KEY=<span className="pkg">sk_…</span>
                </span>
              </div>

              <ul className="tier-list">
                <li>
                  <span className="dot"></span> Everything in Kit
                </li>
                <li>
                  <span className="dot"></span> Policy-as-code UI
                </li>
                <li>
                  <span className="dot"></span> Semantic guard (LLM-judge)
                </li>
                <li>
                  <span className="dot"></span> Multi-agent tracing
                </li>
                <li>
                  <span className="dot"></span> Execution history (90d)
                </li>
                <li>
                  <span className="dot"></span> Hash-chained receipts
                </li>
              </ul>

              {betaStatus === "ok" ? (
                <div className="tier-cta filled beta-ok" role="status" aria-live="polite">
                  You&rsquo;re on the list ✓
                </div>
              ) : !betaOpen ? (
                <button
                  type="button"
                  className="tier-cta filled"
                  onClick={() => {
                    setBetaOpen(true);
                    // focus after render
                    setTimeout(() => betaInputRef.current?.focus(), 0);
                  }}
                >
                  Join the beta →
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
                    <div className="beta-error" role="alert">
                      {betaError}
                    </div>
                  ) : null}
                </form>
              )}
            </article>

            {/* ENTERPRISE */}
            <article className="tier">
              <div className="tier-top">
                <div className="tier-num">§ 03</div>
                <h3 className="tier-name">Enterprise Governance</h3>
                <div className="tier-kind">VPC · self-hosted · SLA</div>
                <p className="tier-desc">
                  The full admission engine, immutable audit, and approval workflows — deployed in your VPC or self-hosted. SOC 2, HIPAA, and SEC 17a-4 export bundles on the roadmap.
                </p>
              </div>

              <div className="tier-price">
                <span className="price-amt">Custom</span>
                <span className="price-unit">annual contract</span>
              </div>

              <div className="tier-install">
                <span className="prompt">→</span>
                <span className="cmd">talk to the team</span>
              </div>

              <ul className="tier-list">
                <li>
                  <span className="dot"></span> Everything in Cloud
                </li>
                <li>
                  <span className="dot"></span> Admission engine
                </li>
                <li>
                  <span className="dot"></span> Immutable audit (WORM)
                </li>
                <li>
                  <span className="dot"></span> Human approval workflows
                </li>
                <li>
                  <span className="dot"></span> VPC + self-host + BYO-KMS
                </li>
                <li>
                  <span className="dot"></span> SOC 2 · HIPAA · SEC exports
                </li>
              </ul>

              <a href="#" className="tier-cta outline">
                Book a call →
              </a>
            </article>
          </div>

          <div className="tiers-footnote">
            <span className="foot-label">One SDK across all three.</span>
            <span>
              The same <code>statis-kit</code> import powers Kit, Cloud, and Enterprise. You write the integration once; the tier changes what lights up.
            </span>
          </div>
        </div>
      </section>

      {/* ========== LIVE CODE SECTION ========== */}
      <section className="code-wrap">
        <div className="code-inner">
          <header className="code-header">
            <div className="eyebrow">
              <span className="ver">§ 03</span>
              <span>Guard, meter, receipt — in ten lines</span>
            </div>
            <h2 className="section-hed">
              Drop it in today. <span>Light up correlation tomorrow.</span>
            </h2>
            <p className="section-sub">
              The Kit runs entirely on your machine — no account, no egress. When you&apos;re ready for cross-call tracing and persisted receipts, set one environment variable and the same code keeps working.
            </p>
          </header>

          <div className="code-stage" data-tier={tier}>
            {/* TAB BAR */}
            <div className="code-tabs" role="tablist">
              <div className="tab-group">
                <button
                  className={`tab${lang === "python" ? " active" : ""}`}
                  data-lang="python"
                  onClick={() => setLang("python")}
                >
                  Python
                </button>
                <button
                  className={`tab${lang === "typescript" ? " active" : ""}`}
                  data-lang="typescript"
                  onClick={() => setLang("typescript")}
                >
                  TypeScript
                </button>
                <button
                  className={`tab${lang === "cli" ? " active" : ""}`}
                  data-lang="cli"
                  onClick={() => setLang("cli")}
                >
                  CLI
                </button>
              </div>
              <div className="tab-toggle">
                <span className="toggle-label">Tier</span>
                <button
                  className={`toggle-btn${tier === "kit" ? " active" : ""}`}
                  data-tier="kit"
                  onClick={() => setTier("kit")}
                >
                  <span className="dot"></span> Kit <span className="tag">local</span>
                </button>
                <button
                  className={`toggle-btn${tier === "cloud" ? " active" : ""}`}
                  data-tier="cloud"
                  onClick={() => setTier("cloud")}
                >
                  <span className="dot accent"></span> Cloud <span className="tag">+ correlation</span>
                </button>
              </div>
            </div>

            {/* EDITOR + OUTPUT SPLIT */}
            <div className="code-split">
              {/* EDITOR */}
              <div className="editor">
                <div className="editor-chrome">
                  <span className="chrome-dot"></span>
                  <span className="chrome-dot"></span>
                  <span className="chrome-dot"></span>
                  <span className="filename" id="filename">
                    {FILENAMES[lang]}
                  </span>
                </div>

                {/* Python / Kit */}
                <pre
                  className={`code-block${isActiveBlock("python", "kit") ? " active" : ""}`}
                  data-lang="python"
                  data-tier="kit"
                >
                  <code>
                    <span className="ln">1</span><span className="com"># pip install statis-kit</span>{"\n"}
                    <span className="ln">2</span><span className="kw">from</span> statis <span className="kw">import</span> Kit, Guard, Meter{"\n"}
                    <span className="ln">3</span>{"\n"}
                    <span className="ln">4</span>kit = Kit(){"\n"}
                    <span className="ln">5</span>{"\n"}
                    <span className="ln">6</span><span className="kw">with</span> kit.session(agent=<span className="str">&quot;nexus.briefer&quot;</span>) <span className="kw">as</span> s:{"\n"}
                    <span className="ln">7</span>    ctx = s.admit(prompt, guard=Guard.strict(), meter=Meter(budget=<span className="num">0.05</span>)){"\n"}
                    <span className="ln">8</span>{"\n"}
                    <span className="ln">9</span>    response = llm.complete(ctx.compressed){"\n"}
                    <span className="ln">10</span>{"\n"}
                    <span className="ln">11</span>    receipt = s.receipt(response, <span className="arg">adapter</span>=<span className="str">&quot;slack.post&quot;</span>){"\n"}
                    <span className="ln">12</span>    <span className="fn">print</span>(receipt.hash)  <span className="com"># 3c7e1a9f…a2f0</span>{"\n"}
                  </code>
                </pre>

                {/* Python / Cloud */}
                <pre
                  className={`code-block${isActiveBlock("python", "cloud") ? " active" : ""}`}
                  data-lang="python"
                  data-tier="cloud"
                >
                  <code>
                    <span className="ln">1</span><span className="com"># pip install statis-kit</span>{"\n"}
                    <span className="ln">2</span><span className="com"># export STATIS_KEY=sk_live_...</span>{"\n"}
                    <span className="ln">3</span><span className="kw">from</span> statis <span className="kw">import</span> Kit, Guard, Meter{"\n"}
                    <span className="ln">4</span>{"\n"}
                    <span className="ln">5</span>kit = Kit(<span className="arg">cloud</span>=<span className="kw">True</span>)  <span className="com"># ← one line, correlation lights up</span>{"\n"}
                    <span className="ln">6</span>{"\n"}
                    <span className="ln">7</span><span className="kw">with</span> kit.session(agent=<span className="str">&quot;nexus.briefer&quot;</span>, tenant=<span className="str">&quot;org_sm&quot;</span>) <span className="kw">as</span> s:{"\n"}
                    <span className="ln">8</span>    ctx = s.admit(prompt, guard=Guard.semantic(), meter=Meter(budget=<span className="num">0.05</span>)){"\n"}
                    <span className="ln">9</span>{"\n"}
                    <span className="ln">10</span>    response = llm.complete(ctx.compressed){"\n"}
                    <span className="ln">11</span>{"\n"}
                    <span className="ln">12</span>    receipt = s.receipt(response, <span className="arg">adapter</span>=<span className="str">&quot;slack.post&quot;</span>, <span className="arg">policy</span>=<span className="str">&quot;v3&quot;</span>){"\n"}
                    <span className="ln">13</span>    <span className="fn">print</span>(receipt.trace_url)  <span className="com"># https://statis.cloud/t/7b2c…</span>{"\n"}
                  </code>
                </pre>

                {/* TypeScript / Kit */}
                <pre
                  className={`code-block${isActiveBlock("typescript", "kit") ? " active" : ""}`}
                  data-lang="typescript"
                  data-tier="kit"
                >
                  <code>
                    <span className="ln">1</span><span className="com">// npm i @statis/kit</span>{"\n"}
                    <span className="ln">2</span><span className="kw">import</span> {"{ Kit, Guard, Meter }"} <span className="kw">from</span> <span className="str">&quot;@statis/kit&quot;</span>;{"\n"}
                    <span className="ln">3</span>{"\n"}
                    <span className="ln">4</span><span className="kw">const</span> kit = <span className="kw">new</span> Kit();{"\n"}
                    <span className="ln">5</span>{"\n"}
                    <span className="ln">6</span><span className="kw">const</span> s = kit.session({"{ agent: "}<span className="str">&quot;nexus.briefer&quot;</span>{" }"});{"\n"}
                    <span className="ln">7</span><span className="kw">const</span> ctx = <span className="kw">await</span> s.admit(prompt, {"{"}{"\n"}
                    <span className="ln">8</span>    guard: Guard.strict(), meter: <span className="kw">new</span> Meter({"{ budget: "}<span className="num">0.05</span>{" }"}){"\n"}
                    <span className="ln">9</span>{"}"});{"\n"}
                    <span className="ln">10</span>{"\n"}
                    <span className="ln">11</span><span className="kw">const</span> response = <span className="kw">await</span> llm.complete(ctx.compressed);{"\n"}
                    <span className="ln">12</span><span className="kw">const</span> receipt = <span className="kw">await</span> s.receipt(response, {"{ adapter: "}<span className="str">&quot;slack.post&quot;</span>{" }"});{"\n"}
                    <span className="ln">13</span>console.log(receipt.hash);  <span className="com">// 3c7e1a9f…a2f0</span>{"\n"}
                  </code>
                </pre>

                {/* TypeScript / Cloud */}
                <pre
                  className={`code-block${isActiveBlock("typescript", "cloud") ? " active" : ""}`}
                  data-lang="typescript"
                  data-tier="cloud"
                >
                  <code>
                    <span className="ln">1</span><span className="com">// npm i @statis/kit</span>{"\n"}
                    <span className="ln">2</span><span className="com">// STATIS_KEY=sk_live_... in .env</span>{"\n"}
                    <span className="ln">3</span><span className="kw">import</span> {"{ Kit, Guard, Meter }"} <span className="kw">from</span> <span className="str">&quot;@statis/kit&quot;</span>;{"\n"}
                    <span className="ln">4</span>{"\n"}
                    <span className="ln">5</span><span className="kw">const</span> kit = <span className="kw">new</span> Kit({"{ cloud: "}<span className="kw">true</span>{" }"});  <span className="com">// ← correlation on</span>{"\n"}
                    <span className="ln">6</span>{"\n"}
                    <span className="ln">7</span><span className="kw">const</span> s = kit.session({"{ agent: "}<span className="str">&quot;nexus.briefer&quot;</span>, tenant: <span className="str">&quot;org_sm&quot;</span>{" }"});{"\n"}
                    <span className="ln">8</span><span className="kw">const</span> ctx = <span className="kw">await</span> s.admit(prompt, {"{"}{"\n"}
                    <span className="ln">9</span>    guard: Guard.semantic(), meter: <span className="kw">new</span> Meter({"{ budget: "}<span className="num">0.05</span>{" }"}){"\n"}
                    <span className="ln">10</span>{"}"});{"\n"}
                    <span className="ln">11</span>{"\n"}
                    <span className="ln">12</span><span className="kw">const</span> response = <span className="kw">await</span> llm.complete(ctx.compressed);{"\n"}
                    <span className="ln">13</span><span className="kw">const</span> receipt = <span className="kw">await</span> s.receipt(response, {"{ adapter: "}<span className="str">&quot;slack.post&quot;</span>, policy: <span className="str">&quot;v3&quot;</span>{" }"});{"\n"}
                    <span className="ln">14</span>console.log(receipt.traceUrl);{"\n"}
                  </code>
                </pre>

                {/* CLI / Kit */}
                <pre
                  className={`code-block${isActiveBlock("cli", "kit") ? " active" : ""}`}
                  data-lang="cli"
                  data-tier="kit"
                >
                  <code>
                    <span className="ln">1</span><span className="com"># install</span>{"\n"}
                    <span className="ln">2</span><span className="prompt-sign">$</span> pip install statis-kit{"\n"}
                    <span className="ln">3</span>{"\n"}
                    <span className="ln">4</span><span className="com"># inspect a prompt locally — no account needed</span>{"\n"}
                    <span className="ln">5</span><span className="prompt-sign">$</span> statis admit <span className="str">&quot;draft a Q3 briefing for Acme&quot;</span> --guard strict{"\n"}
                    <span className="ln">6</span>{"\n"}
                    <span className="ln">7</span>  compressed  18,420 → 4,112 tokens  (4.48×){"\n"}
                    <span className="ln">8</span>  guard       clean · pii redacted (3) · no inject{"\n"}
                    <span className="ln">9</span>  meter       $0.0041{"\n"}
                    <span className="ln">10</span>{"\n"}
                    <span className="ln">11</span><span className="prompt-sign">$</span> statis playground   <span className="com"># local UI on :4011</span>{"\n"}
                  </code>
                </pre>

                {/* CLI / Cloud */}
                <pre
                  className={`code-block${isActiveBlock("cli", "cloud") ? " active" : ""}`}
                  data-lang="cli"
                  data-tier="cloud"
                >
                  <code>
                    <span className="ln">1</span><span className="com"># upgrade in place — same binary, new tier</span>{"\n"}
                    <span className="ln">2</span><span className="prompt-sign">$</span> <span className="kw">export</span> STATIS_KEY=sk_live_...{"\n"}
                    <span className="ln">3</span>{"\n"}
                    <span className="ln">4</span><span className="prompt-sign">$</span> statis admit <span className="str">&quot;draft a Q3 briefing for Acme&quot;</span> --policy v3{"\n"}
                    <span className="ln">5</span>{"\n"}
                    <span className="ln">6</span>  compressed  18,420 → 4,112 tokens  (4.48×){"\n"}
                    <span className="ln">7</span>  guard       clean · semantic · no inject{"\n"}
                    <span className="ln">8</span>  meter       $0.0041  ·  budget 94%{"\n"}
                    <span className="ln">9</span>  trace       https://statis.cloud/t/7b2c…{"\n"}
                    <span className="ln">10</span>  receipt     sha256:3c7e1a9f…a2f0  (chained){"\n"}
                    <span className="ln">11</span>{"\n"}
                    <span className="ln">12</span><span className="prompt-sign">$</span> statis export --format soc2 --since 7d{"\n"}
                  </code>
                </pre>
              </div>

              {/* OUTPUT SIDEBAR */}
              <div className="output">
                <div className="output-head">
                  <span className="o-label">What you get back</span>
                  <span className="o-tier" id="output-tier">
                    {tier === "kit" ? "Kit · local" : "Cloud · correlated"}
                  </span>
                </div>

                <div className="output-body">
                  <div className="o-row">
                    <span className="o-k">Compressed</span>
                    <span className="o-v">18,420 → 4,112 tokens</span>
                  </div>
                  <div className="o-row">
                    <span className="o-k">Guard</span>
                    <span className="o-v pass">✓ clean · 3 redactions</span>
                  </div>
                  <div className="o-row">
                    <span className="o-k">Meter</span>
                    <span className="o-v">$0.0041</span>
                  </div>
                  <div className="o-row">
                    <span className="o-k">Receipt</span>
                    <span className="o-v mono">sha256:3c7e…a2f0</span>
                  </div>

                  <div className="o-divider kit-only">End of Kit output</div>

                  <div className="o-row cloud-only">
                    <span className="o-k">Trace</span>
                    <span className="o-v link">statis.cloud/t/7b2c…</span>
                  </div>
                  <div className="o-row cloud-only">
                    <span className="o-k">Chain</span>
                    <span className="o-v">linked · prev 9f4a…</span>
                  </div>
                  <div className="o-row cloud-only">
                    <span className="o-k">Signed</span>
                    <span className="o-v pass">Ed25519 ✓</span>
                  </div>
                  <div className="o-row cloud-only">
                    <span className="o-k">Tenant</span>
                    <span className="o-v">org_sm · prod</span>
                  </div>

                  <div className="o-cta cloud-only">
                    <a href="#">Open trace in Cloud →</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Framework row */}
            <div className="framework-row">
              <span className="fr-label">Works with</span>
              <div className="fr-list">
                <span className="fr-item">OpenAI</span>
                <span className="fr-item">Anthropic</span>
                <span className="fr-item">Mistral</span>
                <span className="fr-item">LangChain</span>
                <span className="fr-item">LlamaIndex</span>
                <span className="fr-item">CrewAI</span>
                <span className="fr-item">AutoGen</span>
                <span className="fr-item fr-item-muted">any Python / TS agent</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== RECEIPTS GALLERY ========== */}
      <section className="gallery-wrap">
        <div className="gallery-inner">
          <header className="gallery-header">
            <div className="eyebrow">
              <span className="ver">§ 04</span>
              <span>A receipt for every decision</span>
            </div>
            <h2 className="section-hed">
              Proof, <span>not promises.</span>
            </h2>
            <p className="section-sub">
              Every context admitted, every action authorized, every kill-switch fired — each one emits a hash-chained, Ed25519-signed receipt. Here are four, pulled verbatim from a running Statis deployment.
            </p>
          </header>

          <div className="gallery-grid">
            {/* 1. ADMISSION */}
            <article className="card card-admit">
              <div className="card-head">
                <div className="card-meta">
                  <span className="card-kind">Context In</span>
                  <span className="card-seq">§ 01 · ADMIT-0842</span>
                </div>
                <div className="card-stamp stamp-pass">Admitted</div>
              </div>

              <div className="card-title">Prompt passed admission</div>
              <div className="card-sub">14:22:07 UTC · 2026-04-21</div>

              <div className="card-body">
                <div className="c-row">
                  <span className="c-k">Input</span>
                  <span className="c-v">18,420 tokens</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Output</span>
                  <span className="c-v">
                    4,112 tokens <span className="c-muted">(4.48×)</span>
                  </span>
                </div>
                <div className="c-row">
                  <span className="c-k">PII</span>
                  <span className="c-v">
                    3 redacted <span className="c-muted">(email, phone, SSN)</span>
                  </span>
                </div>
                <div className="c-row">
                  <span className="c-k">Injection</span>
                  <span className="c-v good">none detected</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Budget</span>
                  <span className="c-v">
                    $0.0041 / $0.05 <span className="c-muted">· 92% left</span>
                  </span>
                </div>
              </div>

              <div className="card-chain">
                <span className="chain-label">SHA-256</span>
                <span className="chain-hash">3c7e1a9f2d88…a2f0</span>
              </div>
            </article>

            {/* 2. POLICY DENIAL */}
            <article className="card card-deny">
              <div className="card-head">
                <div className="card-meta">
                  <span className="card-kind">Action Out</span>
                  <span className="card-seq">§ 02 · DENY-0199</span>
                </div>
                <div className="card-stamp stamp-deny">Denied</div>
              </div>

              <div className="card-title">Policy refused a tool call</div>
              <div className="card-sub">14:22:09 UTC · 2026-04-21</div>

              <div className="card-body">
                <div className="c-row">
                  <span className="c-k">Agent</span>
                  <span className="c-v mono">nexus.briefer</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Tool</span>
                  <span className="c-v mono">salesforce.update</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Policy</span>
                  <span className="c-v mono">policy.v3#rule-04</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Reason</span>
                  <span className="c-v bad">write scope exceeds briefer role</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Escalate</span>
                  <span className="c-v">human approval queued</span>
                </div>
              </div>

              <div className="card-chain">
                <span className="chain-label">SHA-256</span>
                <span className="chain-hash">9a1b83c4e712…bd4e</span>
              </div>
            </article>

            {/* 3. KILL SWITCH */}
            <article className="card card-kill">
              <div className="card-head">
                <div className="card-meta">
                  <span className="card-kind">Action Out</span>
                  <span className="card-seq">§ 02 · KILL-0007</span>
                </div>
                <div className="card-stamp stamp-kill">Halted</div>
              </div>

              <div className="card-title">Kill-switch fired mid-run</div>
              <div className="card-sub">14:23:41 UTC · 2026-04-21</div>

              <div className="card-body">
                <div className="c-row">
                  <span className="c-k">Trigger</span>
                  <span className="c-v">cost drift · 3.2× baseline</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Run</span>
                  <span className="c-v mono">run_7b2c · step 14/∞</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Action</span>
                  <span className="c-v bad">halted · state persisted</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Refund</span>
                  <span className="c-v">$1.24 spend capped</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Notify</span>
                  <span className="c-v">#eng-alerts · paged oncall</span>
                </div>
              </div>

              <div className="card-chain">
                <span className="chain-label">SHA-256</span>
                <span className="chain-hash">2f90a67b8cd1…41c3</span>
              </div>
            </article>

            {/* 4. BROADCAST */}
            <article className="card card-bcast">
              <div className="card-head">
                <div className="card-meta">
                  <span className="card-kind">Broadcast</span>
                  <span className="card-seq">§ 04 · BCAST-0231</span>
                </div>
                <div className="card-stamp stamp-pass">Synced</div>
              </div>

              <div className="card-title">Context envelope handed off</div>
              <div className="card-sub">14:24:02 UTC · 2026-04-21</div>

              <div className="card-body">
                <div className="c-row">
                  <span className="c-k">From</span>
                  <span className="c-v mono">nexus.briefer</span>
                </div>
                <div className="c-row">
                  <span className="c-k">To</span>
                  <span className="c-v mono">prism.researcher</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Envelope</span>
                  <span className="c-v">
                    4,112 tokens <span className="c-muted">· already admitted</span>
                  </span>
                </div>
                <div className="c-row">
                  <span className="c-k">Re-admit</span>
                  <span className="c-v good">skipped · envelope verified</span>
                </div>
                <div className="c-row">
                  <span className="c-k">Saved</span>
                  <span className="c-v">$0.0038 · 2.1s</span>
                </div>
              </div>

              <div className="card-chain">
                <span className="chain-label">SHA-256</span>
                <span className="chain-hash">8e4d2b7f1a95…0c89</span>
              </div>
            </article>
          </div>

          <div className="gallery-footer">
            <div
              ref={chainRef}
              className={`chain-visual${chainAnimated ? " animated" : ""}`}
            >
              <span className="chain-node">ADMIT-0842</span>
              <span className="chain-link">→</span>
              <span className="chain-node">DENY-0199</span>
              <span className="chain-link">→</span>
              <span className="chain-node">KILL-0007</span>
              <span className="chain-link">→</span>
              <span className="chain-node">BCAST-0231</span>
              <span className="chain-link">→</span>
              <span className="chain-node chain-more">
                …<span className="chain-counter" data-count="847">
                  {chainCount.toLocaleString()}
                </span>{" "}
                more today
              </span>
            </div>
            <div className="gallery-cta">
              <a href="#" className="secondary-link">
                Export as SOC 2 bundle →
              </a>
              <a href="#" className="secondary-link">
                View receipt schema →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CLOSING CTA ========== */}
      <section className="cta-wrap">
        <div className="cta-inner">
          <div className="cta-left">
            <div className="eyebrow">
              <span className="ver">§ 05</span>
              <span>Start in under a minute</span>
            </div>
            <h2 className="cta-hed">
              Every context evaluated.<br />
              Every action authorized.<br />
              <strong>Every execution receipted.</strong>
            </h2>
            <p className="cta-sub">
              Install the Kit and build against it locally. Join the Cloud beta when you need cross-call correlation. Talk to us when it&apos;s time for the audit.
            </p>
          </div>

          <div className="cta-right">
            <div className="cta-card">
              <div className="cta-card-label">Open source · MIT</div>
              <div className="cta-card-install">
                <span className="prompt">$</span>
                <span className="cmd">
                  pip install <span className="pkg">statis-kit</span>
                </span>
                <button className="copy-btn" onClick={handleCtaCopy}>
                  {ctaCopyText}
                </button>
              </div>
              <div className="cta-card-alt">
                or <a href="#">npm i @statis/kit</a>
              </div>
            </div>

            <div className="cta-buttons">
              <a href="#" className="btn btn-primary">
                Join the Cloud beta →
              </a>
              <a href="#" className="btn btn-ghost">
                Book an enterprise call →
              </a>
            </div>

            <div className="cta-trust">
              <span className="trust-label">Compliance · roadmap</span>
              <span className="trust-item pending">SOC 2</span>
              <span className="trust-item pending">HIPAA</span>
              <span className="trust-item pending">SEC 17a-4</span>
              <span className="trust-item pending">GDPR</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="footer-wrap">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="brand">
                <span className="brand-mark">
                  <svg
                    viewBox="0 0 240 240"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Statis mark"
                  >
                    <rect x="20" y="40" width="40" height="180" fill="#111111" />
                    <rect x="180" y="40" width="40" height="180" fill="#111111" />
                    <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                    <rect x="110" y="200" width="20" height="20" fill="#111111" />
                  </svg>
                </span>
                Statis
                <span className="brand-tag">v0.1.1 · beta</span>
              </div>
              <p className="footer-tag">
                The agent runtime trust layer. Every context evaluated. Every action authorized. Every execution receipted.
              </p>
              <div className="footer-social">
                <a href="#" aria-label="GitHub">
                  GitHub
                </a>
                <a href="#" aria-label="Discord">
                  Discord
                </a>
                <a href="#" aria-label="X">
                  X / Twitter
                </a>
                <a href="#" aria-label="Status">
                  Status
                </a>
              </div>
            </div>

            <div className="footer-cols">
              <div className="footer-col">
                <div className="footer-col-head">Product</div>
                <a href="#">Context Kit</a>
                <a href="#">Developer Cloud</a>
                <a href="#">Enterprise</a>
                <a href="#">Pricing</a>
                <a href="#">Changelog</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-head">Pillars</div>
                <a href="#">§ 01 Context In</a>
                <a href="#">§ 02 Action Out</a>
                <a href="#">§ 03 Receipt Through</a>
                <a href="#">§ 04 Broadcast</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-head">Developers</div>
                <a href="#">Documentation</a>
                <a href="#">Receipt schema</a>
                <a href="#">Policy reference</a>
                <a href="#">SDK (Python)</a>
                <a href="#">SDK (TypeScript)</a>
                <a href="#">CLI</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-head">Compliance</div>
                <a href="#">SOC 2 Type II</a>
                <a href="#">HIPAA</a>
                <a href="#">SEC 17a-4 exports</a>
                <a href="#">GDPR · DPA</a>
                <a href="#">Security</a>
                <a href="#">Trust Center</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-head">Company</div>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
                <a href="#">Brand</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-legal">
              <span className="copyright">© 2026 Statis · FoundryLabs</span>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">DPA</a>
              <a href="#">Sub-processors</a>
            </div>
            <div className="footer-seal">
              <span className="seal-circle" aria-hidden="true">
                <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="40" width="40" height="180" fill="#b8442e" />
                  <rect x="180" y="40" width="40" height="180" fill="#b8442e" />
                  <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                  <rect x="110" y="200" width="20" height="20" fill="#b8442e" />
                </svg>
              </span>
              <span className="seal-text">Signed · Chained · Audited</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
