"use client";

import { Section, SectionReveal, StaggerContainer, StaggerItem } from "./shared";

/* ---------- Wireframe isometric illustrations ---------- */

// Shared isometric math: unit coords (x,y,z) → 2D (X, Y)
// x axis → right-and-down, y axis → left-and-down, z axis → up
function iso(cx: number, cy: number, S: number, x: number, y: number, z: number) {
  return [cx + (x - y) * 0.866 * S, cy + (x + y) * 0.5 * S - z * S] as const;
}

const STROKE = "rgba(255,255,255,0.55)";
const STROKE_HI = "rgba(255,255,255,0.95)";

/* Generic isometric unit cube, offset by (ox, oy, oz) in cube units */
function IsoCube({
  cx,
  cy,
  S,
  ox = 0,
  oy = 0,
  oz = 0,
  size = 1,
  stroke = STROKE,
  strokeWidth = 1,
}: {
  cx: number;
  cy: number;
  S: number;
  ox?: number;
  oy?: number;
  oz?: number;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  const v = (dx: number, dy: number, dz: number) =>
    iso(cx, cy, S, ox + dx * size, oy + dy * size, oz + dz * size);
  const v000 = v(0, 0, 0);
  const v100 = v(1, 0, 0);
  const v110 = v(1, 1, 0);
  const v010 = v(0, 1, 0);
  const v001 = v(0, 0, 1);
  const v101 = v(1, 0, 1);
  const v111 = v(1, 1, 1);
  const v011 = v(0, 1, 1);
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
      {/* Three vertical edges */}
      <line x1={v101[0]} y1={v101[1]} x2={v100[0]} y2={v100[1]} />
      <line x1={v111[0]} y1={v111[1]} x2={v110[0]} y2={v110[1]} />
      <line x1={v011[0]} y1={v011[1]} x2={v010[0]} y2={v010[1]} />
      {/* Bottom visible edges */}
      <line x1={v100[0]} y1={v100[1]} x2={v110[0]} y2={v110[1]} />
      <line x1={v110[0]} y1={v110[1]} x2={v010[0]} y2={v010[1]} />
    </g>
  );
}

/* 1) Sovereign — outer container with inner highlighted cube */
function IsoNestedContainer() {
  return (
    <svg viewBox="0 0 220 180" className="w-full h-auto">
      {/* Faint ground grid inside outer cube */}
      <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none">
        {[0.2, 0.4, 0.6, 0.8, 1].map((t, i) => {
          const a = iso(110, 120, 56, 0, t, 0);
          const b = iso(110, 120, 56, 1, t, 0);
          return <line key={`h${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
        })}
        {[0.2, 0.4, 0.6, 0.8, 1].map((t, i) => {
          const a = iso(110, 120, 56, t, 0, 0);
          const b = iso(110, 120, 56, t, 1, 0);
          return <line key={`v${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
        })}
      </g>
      {/* Outer cube */}
      <IsoCube cx={110} cy={120} S={56} stroke={STROKE} />
      {/* Inner highlighted cube, offset to sit nicely inside */}
      <IsoCube cx={110} cy={120} S={56} ox={0.25} oy={0.25} oz={0.1} size={0.5} stroke={STROKE_HI} strokeWidth={1.2} />
    </svg>
  );
}

/* 2) Tamper-evident — centered stack of isometric plates (no hash glyph) */
function IsoLedgerStack() {
  const cx = 110;
  const baseY = 108;
  const S = 62;
  const layers = [0, 0.18, 0.36, 0.54, 0.72, 0.9];
  return (
    <svg viewBox="0 0 220 180" className="w-full h-auto">
      {layers.map((z, i) => {
        const isTop = i === layers.length - 1;
        const s = isTop ? STROKE_HI : STROKE;
        const sw = isTop ? 1.2 : 1;
        const a = iso(cx, baseY, S, 0, 0, z);
        const b = iso(cx, baseY, S, 1, 0, z);
        const c = iso(cx, baseY, S, 1, 1, z);
        const d = iso(cx, baseY, S, 0, 1, z);
        return (
          <g key={i} fill="none" stroke={s} strokeWidth={sw} strokeLinejoin="round">
            <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]} L${d[0]} ${d[1]} Z`} />
          </g>
        );
      })}
    </svg>
  );
}

/* 3) Policy gate — 3 ascending cubes in staircase formation */
function IsoPolicyStairs() {
  const cx = 78;
  const cy = 128;
  const S = 32;
  return (
    <svg viewBox="0 0 220 180" className="w-full h-auto">
      {/* Step 0 */}
      <IsoCube cx={cx} cy={cy} S={S} ox={0} oy={0} oz={0} size={1} stroke={STROKE} />
      {/* Step 1 — one right, one up */}
      <IsoCube cx={cx} cy={cy} S={S} ox={1} oy={0} oz={1} size={1} stroke={STROKE} />
      {/* Step 2 — two right, two up — highlighted */}
      <IsoCube cx={cx} cy={cy} S={S} ox={2} oy={0} oz={2} size={1} stroke={STROKE_HI} strokeWidth={1.2} />
    </svg>
  );
}

/* ---------- Content ---------- */

type Feature = {
  title: string;
  desc: string;
  illustration: React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Deploy inside your perimeter.",
    desc:
      "Self-hostable on Docker, Kubernetes, or bare metal. Bring your own Postgres, bring your own keys. Nothing about your agents leaves your VPC.",
    illustration: <IsoNestedContainer />,
  },
  {
    title: "Cryptographically provable.",
    desc:
      "Every action produces a SHA-256 signed receipt, chained into an immutable ledger. Auditors verify what ran, when, and why — in minutes, not months.",
    illustration: <IsoLedgerStack />,
  },
  {
    title: "Policy gates every action.",
    desc:
      "Rules evaluate in under 40ms before execution. Deterministic, versioned, reversible. No prompts in the critical path, no ML surprises.",
    illustration: <IsoPolicyStairs />,
  },
];

export function Enterprise() {
  return (
    <Section>
      <SectionReveal>
        <div className="max-w-[780px] mb-20">
          <h2
            className="font-bold tracking-[-0.03em] leading-[1.15]"
            style={{ fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)" }}
          >
            <span style={{ color: "var(--text)" }}>A new standard for agents in production.</span>{" "}
            <span style={{ color: "var(--text-2)" }}>
              Purpose-built for regulated teams that can&apos;t afford a rogue action, with
              cryptographic guarantees and zero data egress.
            </span>
          </h2>
        </div>
      </SectionReveal>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-16">
        {FEATURES.map((f, i) => (
          <StaggerItem key={f.title} index={i}>
            <div className="flex flex-col">
              <div className="h-[200px] flex items-end justify-center mb-8">
                {f.illustration}
              </div>
              <h3
                className="text-[15px] font-semibold tracking-tight mb-2.5"
                style={{ color: "var(--text)" }}
              >
                {f.title}
              </h3>
              <p className="text-[13.5px] leading-[1.6]" style={{ color: "var(--text-2)" }}>
                {f.desc}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Section>
  );
}
