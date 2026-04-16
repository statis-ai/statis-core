/**
 * Shared isometric wireframe illustrations — the visual theme across all pages.
 * Built from the same iso() projection used in Enterprise.tsx and Method.tsx.
 */

function iso(cx: number, cy: number, S: number, x: number, y: number, z: number) {
  return [cx + (x - y) * 0.866 * S, cy + (x + y) * 0.5 * S - z * S] as const;
}

const STROKE = "rgba(255,255,255,0.45)";
const STROKE_HI = "rgba(255,255,255,0.9)";
const STROKE_ACCENT = "rgba(0,212,255,0.6)";

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

/* ────────────────────────────────────────────
   Pricing — three ascending tiers (staircase)
   ──────────────────────────────────────────── */
export function IsoPricingTiers() {
  const cx = 50, cy = 130, S = 28;
  return (
    <svg viewBox="0 0 240 160" className="w-full h-auto" aria-hidden>
      {/* Tier 1 — short */}
      <IsoSlab cx={cx} cy={cy} S={S} w={1.2} d={1.2} h={0.6} stroke={STROKE} />
      {/* Tier 2 — medium, offset right */}
      <IsoSlab cx={cx} cy={cy} S={S} ox={1.5} w={1.2} d={1.2} h={1.2} stroke={STROKE} />
      {/* Tier 3 — tall, offset further, highlighted */}
      <IsoSlab cx={cx} cy={cy} S={S} ox={3} w={1.2} d={1.2} h={2.0} stroke={STROKE_HI} strokeWidth={1.2} />
      {/* Accent line connecting tops */}
      {(() => {
        const a = iso(cx, cy, S, 0.6, 0.6, 0.6);
        const b = iso(cx, cy, S, 2.1, 0.6, 1.2);
        const c = iso(cx, cy, S, 3.6, 0.6, 2.0);
        return (
          <g stroke={STROKE_ACCENT} strokeWidth={0.8} strokeDasharray="3 3" fill="none">
            <polyline points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]}`} />
          </g>
        );
      })()}
    </svg>
  );
}

/* ────────────────────────────────────────────
   Debug — magnifying lens over a data slab
   ──────────────────────────────────────────── */
export function IsoDebugLens() {
  const cx = 60, cy = 100, S = 30;
  return (
    <svg viewBox="0 0 220 160" className="w-full h-auto" aria-hidden>
      {/* Flat data slab */}
      <IsoSlab cx={cx} cy={cy} S={S} w={2.5} d={1.8} h={0.2} stroke={STROKE} />
      {/* Grid lines on top face */}
      {[0.5, 1.0, 1.5, 2.0].map((t, i) => {
        const a = iso(cx, cy, S, t, 0, 0.2);
        const b = iso(cx, cy, S, t, 1.8, 0.2);
        return <line key={`v${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(255,255,255,0.08)" strokeWidth={0.8} />;
      })}
      {[0.45, 0.9, 1.35].map((t, i) => {
        const a = iso(cx, cy, S, 0, t, 0.2);
        const b = iso(cx, cy, S, 2.5, t, 0.2);
        return <line key={`h${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(255,255,255,0.08)" strokeWidth={0.8} />;
      })}
      {/* Highlighted inspection cube */}
      <IsoSlab cx={cx} cy={cy} S={S} ox={0.8} oy={0.5} oz={0.2} w={0.8} d={0.8} h={0.6} stroke={STROKE_ACCENT} strokeWidth={1.2} />
      {/* Lens circle floating above */}
      {(() => {
        const center = iso(cx, cy, S, 1.2, 0.9, 1.4);
        return (
          <g stroke={STROKE_HI} strokeWidth={1} fill="none">
            <circle cx={center[0]} cy={center[1]} r={18} />
            {/* Handle */}
            <line x1={center[0] + 12} y1={center[1] + 12} x2={center[0] + 24} y2={center[1] + 24} strokeWidth={2} />
          </g>
        );
      })()}
    </svg>
  );
}

/* ────────────────────────────────────────────
   MCP — gateway slab with multiple channels
   ──────────────────────────────────────────── */
export function IsoMcpGateway() {
  const cx = 55, cy = 110, S = 26;
  return (
    <svg viewBox="0 0 240 160" className="w-full h-auto" aria-hidden>
      {/* Incoming small cubes (MCP servers) */}
      <IsoSlab cx={cx} cy={cy} S={S} ox={-0.3} oy={-0.5} oz={1.4} w={0.5} d={0.5} h={0.5} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} ox={0.5} oy={-0.5} oz={1.4} w={0.5} d={0.5} h={0.5} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} ox={1.3} oy={-0.5} oz={1.4} w={0.5} d={0.5} h={0.5} stroke={STROKE} />
      {/* Dotted lines from cubes to gateway */}
      {[0, 0.8, 1.6].map((x, i) => {
        const from = iso(cx, cy, S, x, 0, 1.4);
        const to = iso(cx, cy, S, x * 0.6 + 0.3, 0.4, 0.7);
        return <line key={i} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={STROKE_ACCENT} strokeWidth={0.7} strokeDasharray="3 2" />;
      })}
      {/* Gateway slab — wide, highlighted */}
      <IsoSlab cx={cx} cy={cy} S={S} w={2.2} d={1.4} h={0.5} stroke={STROKE_HI} strokeWidth={1.2} />
      {/* Output cube */}
      <IsoSlab cx={cx} cy={cy} S={S} ox={3} oy={0.3} w={0.7} d={0.7} h={0.7} stroke={STROKE_ACCENT} strokeWidth={1} />
      {/* Arrow from gateway to output */}
      {(() => {
        const from = iso(cx, cy, S, 2.2, 0.7, 0.25);
        const to = iso(cx, cy, S, 3, 0.65, 0.35);
        return <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={STROKE_ACCENT} strokeWidth={0.8} strokeDasharray="3 2" />;
      })()}
    </svg>
  );
}

/* ────────────────────────────────────────────
   Integrations — grid of equal-weight cubes
   ──────────────────────────────────────────── */
export function IsoIntegrationGrid() {
  const cx = 40, cy = 110, S = 22;
  const grid = [
    [0, 0], [1.2, 0], [2.4, 0], [3.6, 0],
    [0, 1.2], [1.2, 1.2], [2.4, 1.2], [3.6, 1.2],
    [0, 2.4], [1.2, 2.4], [2.4, 2.4], [3.6, 2.4],
  ];
  return (
    <svg viewBox="0 0 240 160" className="w-full h-auto" aria-hidden>
      {grid.map(([x, y], i) => (
        <IsoSlab
          key={i}
          cx={cx} cy={cy} S={S}
          ox={x} oy={y}
          w={0.9} d={0.9} h={0.6}
          stroke={i === 5 ? STROKE_HI : STROKE}
          strokeWidth={i === 5 ? 1.2 : 0.8}
        />
      ))}
      {/* Subtle connecting line through center row */}
      {(() => {
        const a = iso(cx, cy, S, 0.45, 1.65, 0.6);
        const b = iso(cx, cy, S, 4.05, 1.65, 0.6);
        return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={STROKE_ACCENT} strokeWidth={0.6} strokeDasharray="2 3" />;
      })()}
    </svg>
  );
}

/* ────────────────────────────────────────────
   About — building blocks (team / mission)
   ──────────────────────────────────────────── */
export function IsoFoundation() {
  const cx = 55, cy = 120, S = 26;
  return (
    <svg viewBox="0 0 240 160" className="w-full h-auto" aria-hidden>
      {/* Base platform */}
      <IsoSlab cx={cx} cy={cy} S={S} w={3} d={2} h={0.25} stroke={STROKE} />
      {/* Three pillars rising */}
      <IsoSlab cx={cx} cy={cy} S={S} ox={0.3} oy={0.4} oz={0.25} w={0.6} d={0.6} h={1.2} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} ox={1.2} oy={0.4} oz={0.25} w={0.6} d={0.6} h={1.8} stroke={STROKE} />
      <IsoSlab cx={cx} cy={cy} S={S} ox={2.1} oy={0.4} oz={0.25} w={0.6} d={0.6} h={1.4} stroke={STROKE_HI} strokeWidth={1.2} />
      {/* Roof slab connecting tops */}
      <IsoSlab cx={cx} cy={cy} S={S} ox={0.1} oy={0.2} oz={2.05} w={2.8} d={1} h={0.15} stroke={STROKE_ACCENT} strokeWidth={0.8} />
    </svg>
  );
}
