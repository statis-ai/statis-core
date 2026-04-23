import "./brand.css";

export const metadata = {
  title: "Brand — Statis",
  description: "The Statis mark, lockups, palette, and voice.",
};

export default function BrandPage() {
  return (
    <div className="brand-page">
      <div className="page">

        {/* ===== HEADER ===== */}
        <header className="doc-head">
          <div>
            <h1 className="doc-title">The Statis <strong>brand reference.</strong></h1>
            <p className="doc-lede">
              A single page covering the mark, lockups, color, type, voice, and
              application rules. When you&apos;re producing anything that carries the
              Statis name — a website, a slide, a README, a pitch deck, an email
              signature — this is the reference.
            </p>
          </div>
          <div className="doc-meta">
            <span className="ver">VERSION 1.0</span><br />
            2026-04-21<br />
            STATIS · INTERNAL
          </div>
        </header>


        {/* ===== § 01 · THE MARK ===== */}
        <section>
          <div className="section-head">
            <span className="section-num">§ 01</span>
            <h2>The mark <span>— D · 04 Threshold.</span></h2>
          </div>
          <p className="section-desc">
            Two verticals form a threshold. The top bar covers only the right half,
            colored rust — one side has been stamped, the other is open. The small
            tick at the bottom of the gap is the admission point where a request
            enters to be evaluated. <strong>Threshold, admission, authorization</strong> — the
            three things Statis does, in a shape you can draw in five seconds.
          </p>

          <div className="card">
            <div className="card-head">
              <span><strong>Primary mark</strong></span>
              <span>240 × 240 viewbox · 24-unit grid</span>
            </div>
            <div className="mark-hero">
              <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="40" width="40" height="180" fill="#111111" />
                <rect x="180" y="40" width="40" height="180" fill="#111111" />
                <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                <rect x="110" y="200" width="20" height="20" fill="#111111" />
              </svg>
            </div>

            <div className="anatomy">
              <div className="anatomy-diagram">
                <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                  {/* construction grid */}
                  <g stroke="rgba(17,17,17,0.1)" strokeWidth="0.5" fill="none">
                    <line x1="20" y1="0" x2="20" y2="240" />
                    <line x1="60" y1="0" x2="60" y2="240" />
                    <line x1="110" y1="0" x2="110" y2="240" />
                    <line x1="130" y1="0" x2="130" y2="240" />
                    <line x1="180" y1="0" x2="180" y2="240" />
                    <line x1="220" y1="0" x2="220" y2="240" />
                    <line x1="0" y1="40" x2="240" y2="40" />
                    <line x1="0" y1="70" x2="240" y2="70" />
                    <line x1="0" y1="200" x2="240" y2="200" />
                    <line x1="0" y1="220" x2="240" y2="220" />
                  </g>
                  <rect x="20" y="40" width="40" height="180" fill="#111111" />
                  <rect x="180" y="40" width="40" height="180" fill="#111111" />
                  <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                  <rect x="110" y="200" width="20" height="20" fill="#111111" />
                  {/* measurement lines */}
                  <g stroke="#b8442e" strokeWidth="0.8" opacity="0.8">
                    <line x1="20" y1="230" x2="60" y2="230" />
                    <line x1="110" y1="230" x2="130" y2="230" />
                    <line x1="180" y1="230" x2="220" y2="230" />
                  </g>
                </svg>
              </div>
              <div className="anatomy-labels">
                <div className="label">
                  <span className="k">4u</span>
                  <span className="v"><strong>Vertical width.</strong><span className="secondary">40 / 240 of the canvas</span></span>
                </div>
                <div className="label">
                  <span className="k">12u</span>
                  <span className="v"><strong>Gap between verticals.</strong><span className="secondary">The admission aperture</span></span>
                </div>
                <div className="label">
                  <span className="k">11u × 3u</span>
                  <span className="v"><strong>Top bar.</strong><span className="secondary">Rust accent, right half only</span></span>
                </div>
                <div className="label">
                  <span className="k">2u × 2u</span>
                  <span className="v"><strong>Admission tick.</strong><span className="secondary">Centered in the gap, bottom</span></span>
                </div>
                <div className="label">
                  <span className="k">2u</span>
                  <span className="v"><strong>Safe area.</strong><span className="secondary">Minimum padding all sides</span></span>
                </div>
                <div className="label">
                  <span className="k">4:3</span>
                  <span className="v"><strong>Vertical : top bar ratio.</strong><span className="secondary">Vertical must read as dominant form</span></span>
                </div>
              </div>
            </div>
          </div>

          <h3>Minimum size</h3>
          <p className="section-desc" style={{ marginBottom: "18px" }}>
            Below 24px the standard mark needs a heavy variant with chunkier strokes.
            Two SVGs ship: <code style={{ fontFamily: "var(--mono)", fontSize: "12.5px", background: "var(--paper)", padding: "1px 6px", borderRadius: "2px" }}>favicon.svg</code> for 24px+ and <code style={{ fontFamily: "var(--mono)", fontSize: "12.5px", background: "var(--paper)", padding: "1px 6px", borderRadius: "2px" }}>favicon-heavy.svg</code> for anything smaller.
          </p>
        </section>


        {/* ===== § 02 · LOCKUPS ===== */}
        <section>
          <div className="section-head">
            <span className="section-num">§ 02</span>
            <h2>Lockups <span>— six configurations.</span></h2>
          </div>
          <p className="section-desc">
            Primary horizontal is the default for web, docs, and product. Stacked
            is reserved for tight spaces and covers. Mark-only is for avatars,
            favicons, and app icons — never write &quot;Statis&quot; next to a mark-only in
            another font. On dark backgrounds the verticals invert to paper; the
            <strong> rust top bar is constant</strong> across all modes.
          </p>

          <div className="lockup-grid">

            <div className="lockup-tile">
              <div className="lockup-stage">
                <div className="lockup-h">
                  <svg viewBox="0 0 240 240" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="40" width="40" height="180" fill="#111111" />
                    <rect x="180" y="40" width="40" height="180" fill="#111111" />
                    <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                    <rect x="110" y="200" width="20" height="20" fill="#111111" />
                  </svg>
                  <span className="wm">Statis</span>
                </div>
              </div>
              <div className="lockup-meta"><strong>Primary · horizontal</strong><span>default</span></div>
            </div>

            <div className="lockup-tile">
              <div className="lockup-stage">
                <div className="lockup-h">
                  <svg viewBox="0 0 240 240" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="40" width="40" height="180" fill="#111111" />
                    <rect x="180" y="40" width="40" height="180" fill="#111111" />
                    <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                    <rect x="110" y="200" width="20" height="20" fill="#111111" />
                  </svg>
                  <span className="wm" style={{ fontSize: "26px" }}>Statis</span>
                  <span className="tag">v0.1.1 · beta</span>
                </div>
              </div>
              <div className="lockup-meta"><strong>Topbar · with beta tag</strong><span>site header until GA</span></div>
            </div>

            <div className="lockup-tile">
              <div className="lockup-stage">
                <div className="lockup-s">
                  <svg viewBox="0 0 240 240" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="40" width="40" height="180" fill="#111111" />
                    <rect x="180" y="40" width="40" height="180" fill="#111111" />
                    <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                    <rect x="110" y="200" width="20" height="20" fill="#111111" />
                  </svg>
                  <span className="wm">Statis</span>
                </div>
              </div>
              <div className="lockup-meta"><strong>Stacked</strong><span>slides, covers</span></div>
            </div>

            <div className="lockup-tile">
              <div className="lockup-stage">
                <svg viewBox="0 0 240 240" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="40" width="40" height="180" fill="#111111" />
                  <rect x="180" y="40" width="40" height="180" fill="#111111" />
                  <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                  <rect x="110" y="200" width="20" height="20" fill="#111111" />
                </svg>
              </div>
              <div className="lockup-meta"><strong>Mark only</strong><span>avatars, favicons, icons</span></div>
            </div>

            <div className="lockup-tile dark">
              <div className="lockup-stage">
                <div className="lockup-h">
                  <svg viewBox="0 0 240 240" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="40" width="40" height="180" fill="#fbf8f1" />
                    <rect x="180" y="40" width="40" height="180" fill="#fbf8f1" />
                    <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                    <rect x="110" y="200" width="20" height="20" fill="#fbf8f1" />
                  </svg>
                  <span className="wm">Statis</span>
                </div>
              </div>
              <div className="lockup-meta"><strong>Primary · dark</strong><span>verticals invert; accent constant</span></div>
            </div>

            <div className="lockup-tile">
              <div className="lockup-stage">
                <div className="lockup-h">
                  <svg viewBox="0 0 240 240" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="40" width="40" height="180" fill="#b8442e" />
                    <rect x="180" y="40" width="40" height="180" fill="#b8442e" />
                    <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                    <rect x="110" y="200" width="20" height="20" fill="#b8442e" />
                  </svg>
                  <span className="wm" style={{ fontSize: "22px", color: "var(--accent)" }}>Signed · Chained · Audited</span>
                </div>
              </div>
              <div className="lockup-meta"><strong>Monochrome rust · stamp</strong><span>footer seal, decorative only</span></div>
            </div>

          </div>
        </section>


        {/* ===== § 03 · COLOR ===== */}
        <section>
          <div className="section-head">
            <span className="section-num">§ 03</span>
            <h2>Color <span>— a small, disciplined palette.</span></h2>
          </div>
          <p className="section-desc">
            Seven tokens carry the whole system. Paper and ink are the structural pair;
            rust is the single accent that does all the work of &quot;this is the moment
            that matters.&quot; Seal green appears only in receipt artifacts (pass
            indicators, verification stamps). Never add a new color to solve a
            design problem — use weight, space, and rule treatment instead.
          </p>

          <div className="colors">
            <div className="color-chip">
              <div className="chip-swatch" style={{ background: "#f3efe7" }}></div>
              <div className="chip-meta">
                <div className="chip-name">Bone</div>
                <div className="chip-hex">#f3efe7</div>
                <div className="chip-role">Page background. Default canvas.</div>
              </div>
            </div>
            <div className="color-chip">
              <div className="chip-swatch" style={{ background: "#fbf8f1" }}></div>
              <div className="chip-meta">
                <div className="chip-name">Paper</div>
                <div className="chip-hex">#fbf8f1</div>
                <div className="chip-role">Cards, artifacts, receipts.</div>
              </div>
            </div>
            <div className="color-chip">
              <div className="chip-swatch" style={{ background: "#111111" }}></div>
              <div className="chip-meta">
                <div className="chip-name">Ink</div>
                <div className="chip-hex">#111111</div>
                <div className="chip-role">Headlines, mark structure, dark sections.</div>
              </div>
            </div>
            <div className="color-chip">
              <div className="chip-swatch" style={{ background: "#4a4a4a" }}></div>
              <div className="chip-meta">
                <div className="chip-name">Ink soft</div>
                <div className="chip-hex">#4a4a4a</div>
                <div className="chip-role">Body copy, secondary text.</div>
              </div>
            </div>
            <div className="color-chip">
              <div className="chip-swatch" style={{ background: "#b8442e" }}></div>
              <div className="chip-meta">
                <div className="chip-name">Rust</div>
                <div className="chip-hex">#b8442e</div>
                <div className="chip-role">The single accent. CTAs, emphasis, mark top bar.</div>
              </div>
            </div>
            <div className="color-chip">
              <div className="chip-swatch" style={{ background: "#8a2f1f" }}></div>
              <div className="chip-meta">
                <div className="chip-name">Rust deep</div>
                <div className="chip-hex">#8a2f1f</div>
                <div className="chip-role">Hover states, pressed CTAs.</div>
              </div>
            </div>
            <div className="color-chip">
              <div className="chip-swatch" style={{ background: "#1d3a2e" }}></div>
              <div className="chip-meta">
                <div className="chip-name">Seal green</div>
                <div className="chip-hex">#1d3a2e</div>
                <div className="chip-role">Receipt &quot;pass&quot; stamps only.</div>
              </div>
            </div>
            <div className="color-chip">
              <div className="chip-swatch" style={{ background: "#d6cfbe" }}></div>
              <div className="chip-meta">
                <div className="chip-name">Rule</div>
                <div className="chip-hex">#d6cfbe</div>
                <div className="chip-role">Dividers, borders, table rules.</div>
              </div>
            </div>
          </div>
        </section>


        {/* ===== § 04 · TYPE ===== */}
        <section>
          <div className="section-head">
            <span className="section-num">§ 04</span>
            <h2>Typography <span>— Inter + JetBrains Mono, nothing else.</span></h2>
          </div>
          <p className="section-desc">
            <strong>Inter</strong> with OpenType features <code style={{ fontFamily: "var(--mono)", fontSize: "12px", background: "var(--paper)", padding: "1px 5px", borderRadius: "2px" }}>cv11, ss01, ss03, cv02</code> handles everything
            from 11px eyebrows to 72px headlines. <strong>JetBrains Mono</strong>
            handles code, receipts, labels, and anywhere the reader should feel
            &quot;this is a machine output.&quot; Weight contrast (300 vs 600) carries emphasis —
            <strong> never italics.</strong>
          </p>

          <div className="type-row">
            <div className="type-label"><strong>Display</strong><span>Inter 300 / 600 · letter-spacing -0.035em</span></div>
            <div className="type-spec display">
              <h4>Every context evaluated.<br />Every action authorized.<br /><strong>Every execution receipted.</strong></h4>
            </div>
          </div>

          <div className="type-row">
            <div className="type-label"><strong>Body</strong><span>Inter 400 · 16 / 1.6 · letter-spacing -0.005em</span></div>
            <div className="type-spec body">
              <p>
                Statis sits between your agents and the world — admitting context,
                authorizing actions, and issuing cryptographically signed receipts
                for every decision made in between.
              </p>
            </div>
          </div>

          <div className="type-row">
            <div className="type-label"><strong>Mono</strong><span>JetBrains Mono 400 · 13 / 1.7</span></div>
            <div className="type-spec mono">
              <code>
                <span className="com"># pip install statis-kit</span><br />
                <span className="accent">from</span> statis <span className="accent">import</span> Kit, Guard, Meter<br /><br />
                kit = Kit()<br />
                <span className="accent">with</span> kit.session(agent=<span style={{ color: "#6b8a57" }}>&quot;nexus.briefer&quot;</span>) <span className="accent">as</span> s:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;ctx = s.admit(prompt, guard=Guard.strict())<br />
                &nbsp;&nbsp;&nbsp;&nbsp;receipt = s.receipt(response)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="com"># receipt.hash = 3c7e1a9f…a2f0</span>
              </code>
            </div>
          </div>

          <div className="type-row">
            <div className="type-label"><strong>Eyebrow</strong><span>JetBrains Mono 400 · 11 · uppercase · letter-spacing 0.18em</span></div>
            <div className="type-spec" style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-muted)", padding: "28px 32px" }}>
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>§ 01</span> &nbsp;&nbsp;— &nbsp;&nbsp;Context in &nbsp;·&nbsp; admission
            </div>
          </div>
        </section>


        {/* ===== § 05 · VOICE ===== */}
        <section>
          <div className="section-head">
            <span className="section-num">§ 05</span>
            <h2>Voice <span>— declarative, precise, slightly severe.</span></h2>
          </div>
          <p className="section-desc">
            Statis sells to platform teams and compliance leaders who are suspicious
            of hype. The voice is calm, technical, and slightly clipped — the
            tone of documentation written by an engineer who has had to live
            with the consequences. <strong>Short sentences. Active verbs.
            Specifics over adjectives.</strong>
          </p>

          <div className="voice-grid">
            <div className="voice-box yes">
              <div className="voice-head">✓ Sounds like Statis</div>
              <ul>
                <li>&quot;Every context evaluated. Every action authorized. Every execution receipted.&quot; <em>— triadic, declarative</em></li>
                <li>&quot;Drop it in today. Light up correlation tomorrow.&quot; <em>— time-stamped, specific</em></li>
                <li>&quot;Hash-chained, Ed25519-signed receipts for every decision.&quot; <em>— names the primitives</em></li>
                <li>&quot;The dividing rule is sharp: single-call stays local, cross-call goes cloud.&quot; <em>— precise</em></li>
              </ul>
            </div>
            <div className="voice-box no">
              <div className="voice-head">✗ Doesn&apos;t sound like Statis</div>
              <ul>
                <li>&quot;Unleash the power of AI governance.&quot; <em>— hype verb, empty noun</em></li>
                <li>&quot;Our solution empowers teams to…&quot; <em>— &quot;solution&quot;, &quot;empowers&quot;, both banned</em></li>
                <li>&quot;Revolutionary guardrails for your AI.&quot; <em>— &quot;revolutionary&quot; is a red flag</em></li>
                <li>&quot;Seamlessly integrate with your existing stack.&quot; <em>— &quot;seamlessly&quot; is never seamless</em></li>
              </ul>
            </div>
          </div>

          <h3 style={{ marginTop: "40px" }}>Vocabulary</h3>
          <p className="section-desc" style={{ marginBottom: "20px" }}>
            Words to use consistently across the product, site, docs, and comms.
            The struck-through column is words that will feel &quot;right&quot; when you&apos;re
            drafting — those are exactly the ones to replace.
          </p>

          <div className="vocab">
            <div className="vocab-row head">
              <div>Concept</div>
              <div>Use</div>
              <div>Don&apos;t use</div>
            </div>
            <div className="vocab-row">
              <div className="term">The category</div>
              <div className="yes">agent runtime trust layer</div>
              <div className="no">guardrails / safety net / wrapper</div>
            </div>
            <div className="vocab-row">
              <div className="term">The artifact</div>
              <div className="yes">receipt</div>
              <div className="no">log / record / entry</div>
            </div>
            <div className="vocab-row">
              <div className="term">Input handling</div>
              <div className="yes">admit / admission</div>
              <div className="no">ingest / process / consume</div>
            </div>
            <div className="vocab-row">
              <div className="term">Output handling</div>
              <div className="yes">authorize / authorization</div>
              <div className="no">approve / sanction / gatekeep</div>
            </div>
            <div className="vocab-row">
              <div className="term">The verification</div>
              <div className="yes">signed · chained · audited</div>
              <div className="no">secure / verified / tracked</div>
            </div>
            <div className="vocab-row">
              <div className="term">Multi-agent</div>
              <div className="yes">broadcast / envelope</div>
              <div className="no">message / event / pub-sub</div>
            </div>
            <div className="vocab-row">
              <div className="term">Tiers</div>
              <div className="yes">Kit / Cloud / Enterprise</div>
              <div className="no">Free / Pro / Business</div>
            </div>
            <div className="vocab-row">
              <div className="term">Sections / docs</div>
              <div className="yes">§ 01 Context In · § 02 Action Out</div>
              <div className="no">Part 1 / Chapter 1 / Feature A</div>
            </div>
          </div>
        </section>


        {/* ===== § 06 · DO / DON'T ===== */}
        <section>
          <div className="section-head">
            <span className="section-num">§ 06</span>
            <h2>Do and don&apos;t <span>— mark application rules.</span></h2>
          </div>
          <p className="section-desc">
            The four most common failure modes when applying the mark. When in doubt:
            <strong> use the mark as shipped, at sufficient size, with safe-area
            padding, on paper or ink backgrounds only.</strong>
          </p>

          <div className="dodont">

            <div className="dodont-tile yes">
              <div className="example" style={{ background: "var(--paper)" }}>
                <svg viewBox="0 0 240 240" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="40" width="40" height="180" fill="#111111" />
                  <rect x="180" y="40" width="40" height="180" fill="#111111" />
                  <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                  <rect x="110" y="200" width="20" height="20" fill="#111111" />
                </svg>
              </div>
              <div className="caption"><span><strong>Do:</strong> use the mark as shipped, on paper, with at least 2u safe-area padding.</span></div>
            </div>

            <div className="dodont-tile no">
              <div className="example" style={{ background: "linear-gradient(135deg, #8a2fff 0%, #ff6b6b 100%)" }}>
                <svg viewBox="0 0 240 240" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="40" width="40" height="180" fill="#ffffff" />
                  <rect x="180" y="40" width="40" height="180" fill="#ffffff" />
                  <rect x="110" y="40" width="110" height="30" fill="#ffff00" />
                  <rect x="110" y="200" width="20" height="20" fill="#ffffff" />
                </svg>
              </div>
              <div className="caption"><span><strong>Don&apos;t:</strong> place on gradient / photographic / branded backgrounds. Paper or ink only.</span></div>
            </div>

            <div className="dodont-tile yes">
              <div className="example" style={{ background: "var(--ink)" }}>
                <svg viewBox="0 0 240 240" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="40" width="40" height="180" fill="#fbf8f1" />
                  <rect x="180" y="40" width="40" height="180" fill="#fbf8f1" />
                  <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                  <rect x="110" y="200" width="20" height="20" fill="#fbf8f1" />
                </svg>
              </div>
              <div className="caption"><span><strong>Do:</strong> on dark ink, invert the verticals and tick to paper. The rust top bar stays rust.</span></div>
            </div>

            <div className="dodont-tile no">
              <div className="example" style={{ background: "var(--paper)" }}>
                <svg viewBox="0 0 240 240" width="72" height="72" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(12deg) scaleX(-1)" }}>
                  <rect x="20" y="40" width="40" height="180" fill="#111111" />
                  <rect x="180" y="40" width="40" height="180" fill="#111111" />
                  <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                  <rect x="110" y="200" width="20" height="20" fill="#111111" />
                </svg>
              </div>
              <div className="caption"><span><strong>Don&apos;t:</strong> rotate, flip, skew, or re-proportion the mark. The asymmetry is deliberate.</span></div>
            </div>

            <div className="dodont-tile yes">
              <div className="example" style={{ background: "var(--paper)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <svg viewBox="0 0 240 240" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="40" width="40" height="180" fill="#111111" />
                    <rect x="180" y="40" width="40" height="180" fill="#111111" />
                    <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                    <rect x="110" y="200" width="20" height="20" fill="#111111" />
                  </svg>
                  <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: "30px", letterSpacing: "-0.035em" }}>Statis</span>
                </div>
              </div>
              <div className="caption"><span><strong>Do:</strong> pair mark with Inter 600 wordmark at the specified ratio (mark height = wordmark cap height × 1.8).</span></div>
            </div>

            <div className="dodont-tile no">
              <div className="example" style={{ background: "var(--paper)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <svg viewBox="0 0 240 240" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="40" width="40" height="180" fill="#111111" />
                    <rect x="180" y="40" width="40" height="180" fill="#111111" />
                    <rect x="110" y="40" width="110" height="30" fill="#b8442e" />
                    <rect x="110" y="200" width="20" height="20" fill="#111111" />
                  </svg>
                  <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400, fontSize: "30px" }}>Statis</span>
                </div>
              </div>
              <div className="caption"><span><strong>Don&apos;t:</strong> pair with a different typeface, italic styling, or a script. Never italicize the wordmark.</span></div>
            </div>

          </div>
        </section>


        {/* ===== § 07 · APPLICATION SIGNALS ===== */}
        <section>
          <div className="section-head">
            <span className="section-num">§ 07</span>
            <h2>Application signals <span>— the § numbering device.</span></h2>
          </div>
          <p className="section-desc">
            The <strong>§ section-mark</strong> is part of the brand, not a typographic accident.
            Use it as a prefix for section headers, pillar labels, documentation
            anchors, code comments, and CLI output. It does the work that most
            companies use decorative icons for — signaling hierarchy — while
            reinforcing the &quot;document / record / receipt&quot; through-line of the
            entire Statis identity.
          </p>

          <div className="card">
            <div className="card-head"><span><strong>Section numbering in the wild</strong></span><span>examples</span></div>
            <div style={{ padding: "28px 32px", background: "var(--paper)", fontFamily: "var(--mono)", fontSize: "13px", lineHeight: 1.8, color: "var(--ink)" }}>
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>§ 01</span>  Context In · admission<br />
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>§ 02</span>  Action Out · authorization<br />
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>§ 03</span>  Receipt Through · verification<br />
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>§ 04</span>  Broadcast · state sync<br />
              <br />
              <span style={{ color: "var(--ink-muted)" }}># Also in CLI output:</span><br />
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>§</span> statis admit <span style={{ color: "#6b8a57" }}>&quot;draft briefing&quot;</span> --guard strict<br />
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>§</span> RCPT-2026-04-21-a3f9c17e  ·  <span style={{ color: "var(--seal)", fontWeight: 500 }}>admitted</span><br />
            </div>
          </div>
        </section>


        {/* ===== FOOTER NOTE ===== */}
        <div className="doc-footer">
          <div className="fl">Maintaining this document</div>
          <p>
            This is a living reference. Changes to any primitive — mark, color,
            type scale, voice, vocabulary — are version-incremented and dated. The
            current version is stamped at the top of this page.
          </p>
          <p>
            Canonical asset files live at <code>/public/</code> on the marketing site:
            <code>favicon.svg</code>, <code>favicon.ico</code>, <code>apple-touch-icon.png</code>, <code>og-image.png</code>,
            and the full favicon set. Do not redraw the mark in other tools;
            copy from the canonical SVG.
          </p>
        </div>

      </div>
    </div>
  );
}
