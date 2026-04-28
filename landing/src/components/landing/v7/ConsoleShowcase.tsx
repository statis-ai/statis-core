"use client";

import { useEffect, useRef, useState } from "react";
import {
  CONSOLE_NAV,
  CONSOLE_KPIS,
  CONSOLE_HISTOGRAM,
  CONSOLE_ROWS,
  type ConsoleRow,
} from "@/data/consoleSeed";

const PALETTES: Record<string, { color: string; bg: string; border: string }> = {
  COMPLETED: { color: "#34D399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.28)" },
  ESCALATED: { color: "#FACC15", bg: "rgba(250,204,21,0.10)", border: "rgba(250,204,21,0.28)" },
  PENDING:   { color: "#FACC15", bg: "rgba(250,204,21,0.10)", border: "rgba(250,204,21,0.28)" },
  DENIED:    { color: "#F87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.28)" },
};

function Pill({ status, children }: { status: string; children?: React.ReactNode }) {
  const p = PALETTES[status] ?? PALETTES.COMPLETED;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: p.color,
        background: p.bg,
        border: `1px solid ${p.border}`,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: 999, background: p.color }} />
      {children ?? status}
    </span>
  );
}

function Histogram({ data }: { data: number[] }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setAnimated(true); },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const max = Math.max(...data, 1);
  const w = 220, h = 38, gap = 2;
  const bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg ref={ref} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <linearGradient id="cs-hist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB923C" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FB923C" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const bh = animated ? Math.max((v / max) * h, 2) : 1;
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={h - bh}
            width={bw}
            height={bh}
            rx={1}
            fill="url(#cs-hist)"
            style={{ transition: `all 600ms cubic-bezier(0.2,0.6,0.2,1) ${i * 18}ms` }}
          />
        );
      })}
    </svg>
  );
}

function Row({ row, highlight }: { row: ConsoleRow; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 0.9fr 1fr 0.5fr 0.7fr",
        gap: 12,
        alignItems: "center",
        padding: "10px 16px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        fontSize: 12,
        color: "#d4d4d8",
        background: highlight ? "rgba(251,146,60,0.04)" : "transparent",
        transition: "background 400ms ease",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--mono)", color: "#fafafa", fontWeight: 500 }}>
          {row.action}
        </div>
        <div style={{ fontSize: 11, color: "#71717a", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.detail}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#a1a1aa", fontFamily: "var(--mono)" }}>
        {row.agent}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Pill status={row.decision} />
        {row.decisionDetail && (
          <span style={{ fontSize: 10, color: "#71717a", fontFamily: "var(--mono)" }}>
            {row.decisionDetail}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: "#a1a1aa", fontFamily: "var(--mono)" }}>
        {row.latency}
      </div>
      <div style={{ fontSize: 11, color: row.receipt === "—" ? "#52525b" : "#fb923c", fontFamily: "var(--mono)" }}>
        {row.receipt}
      </div>
    </div>
  );
}

export default function ConsoleShowcase() {
  const [liveRow, setLiveRow] = useState<ConsoleRow>(CONSOLE_ROWS[6]);
  const [tilt, setTilt] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const variants: ConsoleRow[] = [
      CONSOLE_ROWS[6],
      {
        ...CONSOLE_ROWS[6],
        decision: "COMPLETED",
        decisionDetail: undefined,
        latency: "8m 42s",
        receipt: "0xa12c…7e30",
      },
    ];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % variants.length;
      setLiveRow(variants[i]);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const rows = CONSOLE_ROWS.map((r, i) => (i === 6 ? liveRow : r));

  return (
    <section
      style={{
        position: "relative",
        padding: "120px 24px 140px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(184,68,46,0.10) 0%, transparent 55%)",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <header style={{ maxWidth: 780, marginBottom: 48 }}>
          <div className="eyebrow">
            <span className="ver">§ 04</span>
            <span>The console</span>
          </div>
          <h2 className="section-hed">
            Every action your agents take{" "}
            <span>lands here, with a receipt.</span>
          </h2>
          <p className="section-sub">
            One pane for every gated tool call across every agent. Pillar pills tell you what
            happened, latency tells you how fast, the receipt hash tells you it&rsquo;s real.
          </p>
        </header>

        <div
          style={{ perspective: 2400, perspectiveOrigin: "50% 0%" }}
          onMouseEnter={() => setTilt(false)}
          onMouseLeave={() => setTilt(true)}
        >
          <div
            style={{
              transform: tilt ? "rotateX(6deg) rotateY(-2deg)" : "rotateX(0deg) rotateY(0deg)",
              transformOrigin: "50% 0%",
              transition: "transform 700ms cubic-bezier(0.2,0.7,0.2,1)",
              borderRadius: 14,
              boxShadow:
                "0 60px 120px -40px rgba(0,0,0,0.55), 0 30px 60px -30px rgba(184,68,46,0.18)",
              background: "#0a0a0b",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              maxWidth: 1180,
              margin: "0 auto",
            }}
          >
            {/* window chrome */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: "#111113",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 999, background: "#3f3f46" }} />
              <span style={{ width: 10, height: 10, borderRadius: 999, background: "#3f3f46" }} />
              <span style={{ width: 10, height: 10, borderRadius: 999, background: "#3f3f46" }} />
              <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#71717a", fontFamily: "var(--mono)" }}>
                console.statis.dev/actions
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: 620 }}>
              {/* sidebar */}
              <aside
                style={{
                  background: "#0c0c0e",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                  padding: "16px 12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 14px" }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: "#fb923c",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa" }}>statis-prod</span>
                  <span style={{ fontSize: 10, color: "#71717a", marginLeft: "auto" }}>▾</span>
                </div>

                {CONSOLE_NAV.map((group) => (
                  <div key={group.section} style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "#52525b",
                        padding: "8px 8px 4px",
                      }}
                    >
                      {group.section}
                    </div>
                    {group.items.map((item) => {
                      const active = item === "Actions";
                      return (
                        <div
                          key={item}
                          style={{
                            padding: "6px 8px",
                            fontSize: 12,
                            color: active ? "#fafafa" : "#a1a1aa",
                            background: active ? "rgba(251,146,60,0.10)" : "transparent",
                            borderRadius: 4,
                            borderLeft: active ? "2px solid #fb923c" : "2px solid transparent",
                            paddingLeft: 10,
                          }}
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </aside>

              {/* main */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {/* header */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fafafa", margin: 0 }}>
                      Actions
                    </h3>
                    <div style={{ display: "flex", gap: 4, fontSize: 11, color: "#a1a1aa" }}>
                      {["Actions", "Receipts", "Escalations", "Threat logs"].map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            background: t === "Actions" ? "rgba(255,255,255,0.06)" : "transparent",
                            color: t === "Actions" ? "#fafafa" : "#71717a",
                            cursor: "default",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: "#a1a1aa", fontFamily: "var(--mono)" }}>
                      24 Apr → now
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 10,
                        color: "#34D399",
                        fontFamily: "var(--mono)",
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: "#34D399" }} />
                      live
                    </span>
                  </div>

                  {/* KPIs */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 12,
                    }}
                  >
                    {CONSOLE_KPIS.map((k, i) => (
                      <div
                        key={k.label}
                        style={{
                          padding: "12px 14px",
                          background: "#101013",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 8,
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {k.label}
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                          <div style={{ fontSize: 22, color: "#fafafa", fontWeight: 600, fontFamily: "var(--mono)" }}>
                            {k.value}
                          </div>
                          {i === 0 && <Histogram data={CONSOLE_HISTOGRAM} />}
                        </div>
                        <div style={{ fontSize: 10, color: "#52525b" }}>{k.hint}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* table head */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.6fr 0.9fr 1fr 0.5fr 0.7fr",
                    gap: 12,
                    padding: "10px 16px",
                    fontSize: 10,
                    color: "#52525b",
                    textTransform: "uppercase",
                    letterSpacing: "0.10em",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div>Action</div>
                  <div>Agent</div>
                  <div>Decision</div>
                  <div>Latency</div>
                  <div>Receipt</div>
                </div>

                {/* rows */}
                <div>
                  {rows.map((r, i) => (
                    <Row key={i} row={r} highlight={i === 6} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
