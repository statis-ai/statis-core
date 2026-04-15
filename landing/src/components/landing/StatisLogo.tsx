"use client";

/**
 * Statis mark — isometric nested-cube glyph.
 *
 * Wireframe outer cube with a solid inner cube. Echoes the
 * "Deploy inside your perimeter" illustration and reads from
 * nav size (~24px) up to hero sizes. Uses `currentColor` so the
 * mark inherits the surrounding text color.
 */

function iso(cx: number, cy: number, S: number, x: number, y: number, z: number) {
  return [cx + (x - y) * 0.866 * S, cy + (x + y) * 0.5 * S - z * S] as const;
}

export function StatisGlyph({
  size = 28,
  strokeWidth = 1.3,
  className = "",
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const cx = 16;
  const cy = 17;
  const S = 10.5;
  const p = (x: number, y: number, z: number) => iso(cx, cy, S, x, y, z);

  // Outer unit cube
  const o100 = p(1, 0, 0);
  const o110 = p(1, 1, 0);
  const o010 = p(0, 1, 0);
  const o001 = p(0, 0, 1);
  const o101 = p(1, 0, 1);
  const o111 = p(1, 1, 1);
  const o011 = p(0, 1, 1);

  // Inner cube — 50% size, centered, slightly raised
  const ox = 0.25;
  const oy = 0.25;
  const oz = 0.2;
  const sz = 0.5;
  const i = (dx: number, dy: number, dz: number) =>
    p(ox + dx * sz, oy + dy * sz, oz + dz * sz);
  const i000 = i(0, 0, 0);
  const i100 = i(1, 0, 0);
  const i110 = i(1, 1, 0);
  const i010 = i(0, 1, 0);
  const i001 = i(0, 0, 1);
  const i101 = i(1, 0, 1);
  const i111 = i(1, 1, 1);
  const i011 = i(0, 1, 1);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Outer wireframe cube — subdued */}
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      >
        <path d={`M${o001[0]} ${o001[1]} L${o101[0]} ${o101[1]} L${o111[0]} ${o111[1]} L${o011[0]} ${o011[1]} Z`} />
        <line x1={o101[0]} y1={o101[1]} x2={o100[0]} y2={o100[1]} />
        <line x1={o111[0]} y1={o111[1]} x2={o110[0]} y2={o110[1]} />
        <line x1={o011[0]} y1={o011[1]} x2={o010[0]} y2={o010[1]} />
        <line x1={o100[0]} y1={o100[1]} x2={o110[0]} y2={o110[1]} />
        <line x1={o110[0]} y1={o110[1]} x2={o010[0]} y2={o010[1]} />
      </g>

      {/* Inner solid cube */}
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Front-left face (darker shade) */}
        <path
          d={`M${i001[0]} ${i001[1]} L${i011[0]} ${i011[1]} L${i010[0]} ${i010[1]} L${i000[0]} ${i000[1]} Z`}
          fill="currentColor"
          fillOpacity={0.45}
        />
        {/* Front-right face (medium shade) */}
        <path
          d={`M${i101[0]} ${i101[1]} L${i100[0]} ${i100[1]} L${i110[0]} ${i110[1]} L${i111[0]} ${i111[1]} Z`}
          fill="currentColor"
          fillOpacity={0.7}
        />
        {/* Top face (full fill) */}
        <path
          d={`M${i001[0]} ${i001[1]} L${i101[0]} ${i101[1]} L${i111[0]} ${i111[1]} L${i011[0]} ${i011[1]} Z`}
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export function StatisWordmark({
  size = 28,
  className = "",
  gap = 8,
}: {
  size?: number;
  className?: string;
  gap?: number;
}) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap, lineHeight: 1 }}
    >
      <StatisGlyph size={size} />
      <span
        style={{
          fontWeight: 700,
          fontSize: Math.round(size * 0.64),
          letterSpacing: "-0.02em",
        }}
      >
        statis
      </span>
    </span>
  );
}
