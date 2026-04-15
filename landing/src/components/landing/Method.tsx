"use client";

import { Section, Eyebrow, SectionReveal, StaggerContainer, StaggerItem } from "./shared";

/* ---------- Wireframe isometric illustrations ---------- */

// Shared iso projection (matches Enterprise.tsx)
function iso(cx: number, cy: number, S: number, x: number, y: number, z: number) {
  return [cx + (x - y) * 0.866 * S, cy + (x + y) * 0.5 * S - z * S] as const;
}

const STROKE = "rgba(255,255,255,0.5)";
const STROKE_HI = "rgba(255,255,255,0.95)";
const STROKE_GHOST = "rgba(255,255,255,0.2)";

/* Generic isometric slab (non-uniform w/d/h), offset by (ox, oy, oz) in units */
function IsoSlab({
  cx,
  cy,
  S,
  w = 1,
  d = 1,
  h = 1,
  ox = 0,
  oy = 0,
  oz = 0,
  stroke = STROKE,
  strokeWidth = 1,
}: {
  cx: number;
  cy: number;
  S: number;
  w?: number;
  d?: number;
  h?: number;
  ox?: number;
  oy?: number;
  oz?: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  const v = (dx: number, dy: number, dz: number) =>
    iso(cx, cy, S, ox + dx, oy + dy, oz + dz);
  const v100 = v(w, 0, 0);
  const v110 = v(w, d, 0);
  const v010 = v(0, d, 0);
  const v001 = v(0, 0, h);
  const v101 = v(w, 0, h);
  const v111 = v(w, d, h);
  const v011 = v(0, d, h);
  const props = {
    fill: "none",
    stroke,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <g {...props}>
      {/* Top face */}
      <path d={`M${v001[0]} ${v001[1]} L${v101[0]} ${v101[1]} L${v111[0]} ${v111[1]} L${v011[0]} ${v011[1]} Z`} />
      {/* Vertical edges */}
      <line x1={v101[0]} y1={v101[1]} x2={v100[0]} y2={v100[1]} />
      <line x1={v111[0]} y1={v111[1]} x2={v110[0]} y2={v110[1]} />
      <line x1={v011[0]} y1={v011[1]} x2={v010[0]} y2={v010[1]} />
      {/* Bottom visible edges */}
      <line x1={v100[0]} y1={v100[1]} x2={v110[0]} y2={v110[1]} />
      <line x1={v110[0]} y1={v110[1]} x2={v010[0]} y2={v010[1]} />
    </g>
  );
}

/* 01 Determinism — single cube with cross-subdivided top face (rule lattice) */
function IsoRuleBlock() {
  const cx = 60;
  const cy = 52;
  const S = 24;
  const top = (fx: number, fy: number) => iso(cx, cy, S, fx, fy, 1);
  const mx0 = top(0.5, 0);
  const mx1 = top(0.5, 1);
  const my0 = top(0, 0.5);
  const my1 = top(1, 0.5);
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

/* 02 Audit — horizontal chain of 4 linked cubes */
function IsoChain() {
  const cx = 18;
  const cy = 54;
  const S = 13;
  const n = 4;
  return (
    <svg viewBox="0 0 120 100" className="w-full h-auto">
      {Array.from({ length: n }).map((_, i) => {
        const isLast = i === n - 1;
        return (
          <IsoSlab
            key={i}
            cx={cx}
            cy={cy}
            S={S}
            ox={i * 1.1}
            stroke={isLast ? STROKE_HI : STROKE}
            strokeWidth={isLast ? 1.2 : 1}
          />
        );
      })}
    </svg>
  );
}

/* 03 Operator — wide flat console slab with a cursor cube on top */
function IsoConsole() {
  const cx = 36;
  const cy = 56;
  const S = 22;
  return (
    <svg viewBox="0 0 120 100" className="w-full h-auto">
      {/* Wide flat slab */}
      <IsoSlab cx={cx} cy={cy} S={S} w={2} d={1} h={0.28} stroke={STROKE} />
      {/* Cursor block on top */}
      <IsoSlab
        cx={cx}
        cy={cy}
        S={S}
        ox={0.2}
        oy={0.3}
        oz={0.28}
        w={0.4}
        d={0.4}
        h={0.4}
        stroke={STROKE_HI}
        strokeWidth={1.2}
      />
    </svg>
  );
}

/* 04 Self-hostable — vertical tower of 3 cubes (rack/server) */
function IsoTower() {
  const cx = 60;
  const cy = 80;
  const S = 20;
  return (
    <svg viewBox="0 0 120 100" className="w-full h-auto">
      <IsoSlab cx={cx} cy={cy} S={S} oz={0} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} oz={1} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} oz={2} stroke={STROKE_HI} strokeWidth={1.2} />
    </svg>
  );
}

/* 05 Reversible — current cube with a ghosted prior-state offset behind */
function IsoGhostState() {
  const cx = 56;
  const cy = 56;
  const S = 22;
  return (
    <svg viewBox="0 0 120 100" className="w-full h-auto">
      {/* Ghost prior state */}
      <IsoSlab
        cx={cx}
        cy={cy}
        S={S}
        ox={-0.35}
        oy={0.35}
        stroke={STROKE_GHOST}
        strokeWidth={1}
      />
      {/* Current state */}
      <IsoSlab cx={cx} cy={cy} S={S} stroke={STROKE_HI} strokeWidth={1.2} />
    </svg>
  );
}

/* ---------- Content ---------- */

const PRINCIPLES = [
  {
    num: "01",
    title: "Determinism over ML.",
    desc: "Your governance layer shouldn't hallucinate. Rules are versioned, testable, reversible \u2014 no magic, no prompts in the critical path.",
    illustration: <IsoRuleBlock />,
  },
  {
    num: "02",
    title: "Audit is the product.",
    desc: "The ledger isn't a feature, it's the thing you're paying for. Every receipt tamper-evident, queryable, and exportable.",
    illustration: <IsoChain />,
  },
  {
    num: "03",
    title: "Operator-first tooling.",
    desc: "SDKs, CLIs, and infrastructure-as-code. No required dashboard. Built for the people who actually own production.",
    illustration: <IsoConsole />,
  },
  {
    num: "04",
    title: "Self-hostable by default.",
    desc: "Docker Compose, bring your own database, run on your own metal. No vendor lock-in on the trust layer.",
    illustration: <IsoTower />,
  },
  {
    num: "05",
    title: "Reversible by design.",
    desc: "Every policy versioned, every decision explainable, every action undoable. Mistakes should be recoverable, not catastrophic.",
    illustration: <IsoGhostState />,
  },
];

export function Method() {
  return (
    <Section id="method">
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
                  <span
                    className="text-[11px] font-mono tracking-[0.2em] block mt-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {p.num}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <h3
                    className="font-bold tracking-[-0.015em]"
                    style={{ fontSize: "clamp(1.2rem, 2vw, 1.5rem)" }}
                  >
                    {p.title}
                  </h3>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-2)" }}>
                    {p.desc}
                  </p>
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
