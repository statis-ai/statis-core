"use client";

import { Section, Eyebrow, SectionReveal, StaggerContainer, StaggerItem } from "./shared";

/* ---------- Wireframe isometric illustrations ---------- */

function iso(cx: number, cy: number, S: number, x: number, y: number, z: number) {
  return [cx + (x - y) * 0.866 * S, cy + (x + y) * 0.5 * S - z * S] as const;
}

const STROKE = "rgba(255,255,255,0.5)";
const STROKE_HI = "rgba(255,255,255,0.95)";
const STROKE_GHOST = "rgba(255,255,255,0.2)";

function IsoSlab({
  cx, cy, S, w = 1, d = 1, h = 1, ox = 0, oy = 0, oz = 0, stroke = STROKE, strokeWidth = 1,
}: {
  cx: number; cy: number; S: number;
  w?: number; d?: number; h?: number;
  ox?: number; oy?: number; oz?: number;
  stroke?: string; strokeWidth?: number;
}) {
  const v = (dx: number, dy: number, dz: number) => iso(cx, cy, S, ox + dx, oy + dy, oz + dz);
  const v100 = v(w, 0, 0), v110 = v(w, d, 0), v010 = v(0, d, 0);
  const v001 = v(0, 0, h), v101 = v(w, 0, h), v111 = v(w, d, h), v011 = v(0, d, h);
  const props = { fill: "none", stroke, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <g {...props}>
      <path d={`M${v001[0]} ${v001[1]} L${v101[0]} ${v101[1]} L${v111[0]} ${v111[1]} L${v011[0]} ${v011[1]} Z`} />
      <line x1={v101[0]} y1={v101[1]} x2={v100[0]} y2={v100[1]} />
      <line x1={v111[0]} y1={v111[1]} x2={v110[0]} y2={v110[1]} />
      <line x1={v011[0]} y1={v011[1]} x2={v010[0]} y2={v010[1]} />
      <line x1={v100[0]} y1={v100[1]} x2={v110[0]} y2={v110[1]} />
      <line x1={v110[0]} y1={v110[1]} x2={v010[0]} y2={v010[1]} />
    </g>
  );
}

/* Pillar iso illustrations */

/* Context in — funnel: wide slab narrowing to small block */
function IsoFunnel() {
  const cx = 36, cy = 56, S = 20;
  return (
    <svg viewBox="0 0 120 100" className="w-full h-auto">
      <IsoSlab cx={cx} cy={cy} S={S} w={2} d={1.2} h={0.25} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} ox={0.55} oy={0.3} oz={0.35} w={0.9} d={0.6} h={0.25} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} ox={0.75} oy={0.45} oz={0.7} w={0.5} d={0.3} h={0.35} stroke={STROKE_HI} strokeWidth={1.2} />
    </svg>
  );
}

/* Action out — rule block with cross-subdivided top face */
function IsoRuleBlock() {
  const cx = 60, cy = 52, S = 24;
  const top = (fx: number, fy: number) => iso(cx, cy, S, fx, fy, 1);
  const mx0 = top(0.5, 0), mx1 = top(0.5, 1);
  const my0 = top(0, 0.5), my1 = top(1, 0.5);
  return (
    <svg viewBox="0 0 120 100" className="w-full h-auto">
      <IsoSlab cx={cx} cy={cy} S={S} stroke={STROKE_HI} strokeWidth={1.1} />
      <g stroke={STROKE_HI} strokeWidth={0.9} strokeLinecap="round">
        <line x1={mx0[0]} y1={mx0[1]} x2={mx1[0]} y2={mx1[1]} />
        <line x1={my0[0]} y1={my0[1]} x2={my1[0]} y2={my1[1]} />
      </g>
    </svg>
  );
}

/* Receipt through — horizontal chain of 4 linked cubes */
function IsoChain() {
  const cx = 18, cy = 54, S = 13, n = 4;
  return (
    <svg viewBox="0 0 120 100" className="w-full h-auto">
      {Array.from({ length: n }).map((_, i) => (
        <IsoSlab key={i} cx={cx} cy={cy} S={S} ox={i * 1.1} stroke={i === n - 1 ? STROKE_HI : STROKE} strokeWidth={i === n - 1 ? 1.2 : 1} />
      ))}
    </svg>
  );
}

/* Console slab */
function IsoConsole() {
  const cx = 36, cy = 56, S = 22;
  return (
    <svg viewBox="0 0 120 100" className="w-full h-auto">
      <IsoSlab cx={cx} cy={cy} S={S} w={2} d={1} h={0.28} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} ox={0.2} oy={0.3} oz={0.28} w={0.4} d={0.4} h={0.4} stroke={STROKE_HI} strokeWidth={1.2} />
    </svg>
  );
}

/* Tower stack */
function IsoTower() {
  const cx = 60, cy = 80, S = 20;
  return (
    <svg viewBox="0 0 120 100" className="w-full h-auto">
      <IsoSlab cx={cx} cy={cy} S={S} oz={0} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} oz={1} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} oz={2} stroke={STROKE_HI} strokeWidth={1.2} />
    </svg>
  );
}

/* Ghost state */
function IsoGhostState() {
  const cx = 56, cy = 56, S = 22;
  return (
    <svg viewBox="0 0 120 100" className="w-full h-auto">
      <IsoSlab cx={cx} cy={cy} S={S} ox={-0.35} oy={0.35} stroke={STROKE_GHOST} strokeWidth={1} />
      <IsoSlab cx={cx} cy={cy} S={S} stroke={STROKE_HI} strokeWidth={1.2} />
    </svg>
  );
}

/* ---------- Pillar cards ---------- */

const PILLARS = [
  {
    id: "context-in",
    num: "01",
    title: "Context in",
    headline: "Every context evaluated.",
    description: "Compress, meter, and guard before inference.",
    illustration: <IsoFunnel />,
  },
  {
    id: "action-out",
    num: "02",
    title: "Action out",
    headline: "Every action authorized.",
    description: "Policy engine decides. Nothing ships unchecked.",
    illustration: <IsoRuleBlock />,
  },
  {
    id: "receipt-through",
    num: "03",
    title: "Receipt through",
    headline: "Every execution receipted.",
    description: "SHA-256 chain. Replayable. Auditor-ready.",
    illustration: <IsoChain />,
  },
];

/* ---------- Principles ---------- */

const PRINCIPLES = [
  { num: "01", title: "Determinism over ML.", desc: "Your governance layer shouldn't hallucinate. Rules are versioned, testable, reversible \u2014 no magic, no prompts in the critical path.", illustration: <IsoRuleBlock /> },
  { num: "02", title: "Audit is the product.", desc: "The ledger isn't a feature, it's the thing you're paying for. Every receipt tamper-evident, queryable, and exportable.", illustration: <IsoChain /> },
  { num: "03", title: "Operator-first tooling.", desc: "SDKs, CLIs, and infrastructure-as-code. No required dashboard. Built for the people who actually own production.", illustration: <IsoConsole /> },
  { num: "04", title: "Self-hostable by default.", desc: "Docker Compose, bring your own database, run on your own metal. No vendor lock-in on the trust layer.", illustration: <IsoTower /> },
  { num: "05", title: "Reversible by design.", desc: "Every policy versioned, every decision explainable, every action undoable. Mistakes should be recoverable, not catastrophic.", illustration: <IsoGhostState /> },
];

export function Method() {
  return (
    <Section id="method">
      {/* Three pillars */}
      <SectionReveal>
        <div className="text-center mb-16">
          <Eyebrow>How it works</Eyebrow>
          <h2
            className="font-bold tracking-[-0.025em] mt-5 mb-5 max-w-3xl mx-auto"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", lineHeight: 1.05 }}
          >
            Three pillars, one loop.
          </h2>
          <p
            className="text-[15px] md:text-[17px] max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            Context in. Action out. Receipt through. The same guarantees every time an agent
            touches a model or a production system.
          </p>
        </div>
      </SectionReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-28">
        {PILLARS.map((p, i) => (
          <SectionReveal key={p.id} delay={i * 0.1}>
            <div
              id={p.id}
              className="group h-full rounded-2xl text-center transition-all duration-300 cursor-default overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(0,212,255,0.15)";
                e.currentTarget.style.boxShadow = "0 4px 50px -15px rgba(0,212,255,0.12)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Illustration area — large, centered */}
              <div
                className="relative flex items-center justify-center pt-10 pb-6"
                style={{ minHeight: 160 }}
              >
                {/* Subtle radial glow behind illustration on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at 50% 60%, rgba(0,212,255,0.06) 0%, transparent 70%)",
                  }}
                />
                <div className="relative w-[140px] opacity-50 group-hover:opacity-90 transition-opacity duration-400">
                  {p.illustration}
                </div>
              </div>

              {/* Text — minimal */}
              <div className="px-7 pb-8">
                <span
                  className="inline-block text-[10px] font-mono uppercase tracking-[0.25em] mb-3"
                  style={{ color: "#00D4FF" }}
                >
                  {p.num}
                </span>
                <h3
                  className="text-[20px] font-bold tracking-tight mb-2"
                  style={{ color: "var(--text)" }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-[24px] font-semibold tracking-[-0.02em] mb-3 leading-tight"
                  style={{ color: "var(--text)" }}
                >
                  {p.headline}
                </p>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {p.description}
                </p>
              </div>
            </div>
          </SectionReveal>
        ))}
      </div>

      {/* Principles */}
      <SectionReveal>
        <div className="text-center mb-20">
          <Eyebrow>Method</Eyebrow>
          <h2
            className="font-bold tracking-[-0.03em] mt-4 max-w-2xl mx-auto"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            How we think about governed execution.
          </h2>
          <p className="text-[15px] mt-4 max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
            Five principles that shape every decision in the Statis codebase. These aren&apos;t
            marketing &mdash; they&apos;re the trade-offs we refuse to make.
          </p>
        </div>
      </SectionReveal>

      <StaggerContainer>
        {PRINCIPLES.map((p, i) => (
          <StaggerItem key={p.num} index={i}>
            <div
              className="py-10 transition-colors"
              style={{ borderTop: "1px solid var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div className="grid grid-cols-12 gap-6 md:gap-10 items-center">
                <div className="col-span-12 md:col-span-3">
                  <div className="w-[120px]">{p.illustration}</div>
                  <span className="text-[11px] font-mono tracking-[0.2em] block mt-3" style={{ color: "var(--text-muted)" }}>{p.num}</span>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <h3 className="font-bold tracking-[-0.015em]" style={{ fontSize: "clamp(1.2rem, 2vw, 1.5rem)" }}>{p.title}</h3>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-2)" }}>{p.desc}</p>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
        <div style={{ borderTop: "1px solid var(--border)" }} />
      </StaggerContainer>
    </Section>
  );
}
