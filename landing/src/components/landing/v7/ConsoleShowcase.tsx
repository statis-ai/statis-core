"use client";

import { useEffect, useRef, useState } from "react";
import {
  CONSOLE_NAV,
  CONSOLE_KPIS,
  CONSOLE_HISTOGRAM,
  CONSOLE_ROWS,
  type ConsoleRow,
} from "@/data/consoleSeed";

/**
 * Tiny inline icon glyphs for the console sidebar items. Stroked, 14×14,
 * uses currentColor so they pick up active/inactive state from the parent.
 */
const NAV_ICONS: Record<string, React.ReactNode> = {
  Home: (
    <path d="M3 7l5-4 5 4v6H3z M6.5 13V9.5h3V13" />
  ),
  Actions: (
    <path d="M2.5 8h6 M5.5 5l3 3-3 3 M9.5 13.5h4M9.5 8h4" />
  ),
  Receipts: (
    <path d="M3.5 2v12l2-1.5 2 1.5 2-1.5 2 1.5V2zM5 5h6 M5 8h6 M5 11h4" />
  ),
  Escalations: (
    <path d="M8 2.5L1.5 13.5h13zM8 6.5v3.5 M8 12v0.5" />
  ),
  Policies: (
    <path d="M8 1.5L3 3.5v4.2c0 3.2 2 5.6 5 6.8 3-1.2 5-3.6 5-6.8V3.5z M5.5 8l1.7 1.7L10.5 6.5" />
  ),
  "Threat logs": (
    <path d="M8 1.5L2 4v3.5c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V4z M8 5.5v3.5 M8 11v0.5" />
  ),
  Events: (
    <path d="M2.5 4h11M2.5 8h11M2.5 12h11 M5 4v8M11 4v8" />
  ),
  Agents: (
    <path d="M5.5 6.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z M2.5 13.5c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" />
  ),
  Adapters: (
    <path d="M3 5.5h2.5v5H3z M10.5 5.5H13v5h-2.5z M5.5 8h5 M7 4v1.5 M9 4v1.5 M7 10.5V12 M9 10.5V12" />
  ),
  Developers: (
    <path d="M5.5 4L2.5 8l3 4 M10.5 4l3 4-3 4 M9.5 3.5l-3 9" />
  ),
  Entities: (
    <path d="M3 4h4v4H3z M9 4h4v4H9z M3 9h4v4H3z M9 9h4v4H9z" />
  ),
  Webhooks: (
    <path d="M5.5 9.5a2.5 2.5 0 1 1 4-2 M9 11l3-3 M11 14a2.5 2.5 0 1 1-2-4 M3 11a2.5 2.5 0 0 1 4-2L8 11" />
  ),
  "Kill-switch": (
    <path d="M8 2v6 M4.5 4.5a5 5 0 1 0 7 0" />
  ),
  Settings: (
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z M8 1v2 M8 13v2 M1 8h2 M13 8h2 M3 3l1.5 1.5 M11.5 11.5L13 13 M3 13l1.5-1.5 M11.5 4.5L13 3" />
  ),
};

function NavIcon({ name }: { name: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {NAV_ICONS[name] ?? <circle cx="8" cy="8" r="2" />}
    </svg>
  );
}

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
        padding: "8px 14px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        fontSize: 11,
        color: "#d4d4d8",
        background: highlight ? "rgba(251,146,60,0.04)" : "transparent",
        transition: "background 400ms ease",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--mono)", color: "#fafafa", fontWeight: 500, fontSize: 11 }}>
          {row.action}
        </div>
        <div style={{ fontSize: 10, color: "#71717a", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.detail}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#a1a1aa", fontFamily: "var(--mono)" }}>
        {row.agent}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Pill status={row.decision} />
        {row.decisionDetail && (
          <span style={{ fontSize: 9, color: "#71717a", fontFamily: "var(--mono)" }}>
            {row.decisionDetail}
          </span>
        )}
      </div>
      <div style={{ fontSize: 10, color: "#a1a1aa", fontFamily: "var(--mono)" }}>
        {row.latency}
      </div>
      <div style={{ fontSize: 10, color: row.receipt === "—" ? "#52525b" : "#fb923c", fontFamily: "var(--mono)" }}>
        {row.receipt}
      </div>
    </div>
  );
}

export default function ConsoleShowcase() {
  const [liveRow, setLiveRow] = useState<ConsoleRow>(CONSOLE_ROWS[6]);

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
        padding: "96px 24px 112px",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      {/* Linear-style backlight: layered radial gradients behind the console */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          background: [
            "radial-gradient(ellipse 80% 60% at 50% 38%, rgba(251,146,60,0.18) 0%, transparent 55%)",
            "radial-gradient(ellipse 60% 45% at 50% 60%, rgba(184,68,46,0.14) 0%, transparent 60%)",
            "radial-gradient(ellipse 100% 70% at 50% 100%, rgba(20,12,8,0.45) 0%, transparent 70%)",
          ].join(", "),
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "20%",
          transform: "translate(-50%, 0)",
          width: "min(880px, 90vw)",
          height: 240,
          zIndex: -1,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 50% 100% at 50% 50%, rgba(251,146,60,0.32) 0%, transparent 65%)",
          filter: "blur(36px)",
        }}
      />

      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <header style={{ maxWidth: 720, margin: "0 auto 44px", textAlign: "center" }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>
            <span className="ver">§ 04</span>
            <span>The console</span>
          </div>
          <h2 className="section-hed">
            Every action your agents take{" "}
            <span>lands here, with a receipt.</span>
          </h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>
            One pane for every gated tool call across every agent. Pillar pills tell you what
            happened, latency tells you how fast, the receipt hash tells you it&rsquo;s real.
          </p>
        </header>

        <div>
          <div
            style={{
              borderRadius: 14,
              boxShadow:
                "0 40px 80px -36px rgba(0,0,0,0.55), 0 20px 40px -24px rgba(184,68,46,0.22), 0 0 0 1px rgba(255,255,255,0.04) inset",
              background: "#0a0a0b",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              maxWidth: 1140,
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

            <div style={{ display: "grid", gridTemplateColumns: "188px 1fr", minHeight: 480 }}>
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
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 8px 6px 10px",
                            fontSize: 12,
                            color: active ? "#fafafa" : "#a1a1aa",
                            background: active ? "rgba(251,146,60,0.10)" : "transparent",
                            borderRadius: 4,
                            borderLeft: active ? "2px solid #fb923c" : "2px solid transparent",
                          }}
                        >
                          <span style={{ color: active ? "#fb923c" : "#71717a", display: "inline-flex" }}>
                            <NavIcon name={item} />
                          </span>
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
                          padding: "10px 12px",
                          background: "#101013",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 8,
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <div style={{ fontSize: 9, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {k.label}
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                          <div style={{ fontSize: 18, color: "#fafafa", fontWeight: 600, fontFamily: "var(--mono)" }}>
                            {k.value}
                          </div>
                          {i === 0 && <Histogram data={CONSOLE_HISTOGRAM} />}
                        </div>
                        <div style={{ fontSize: 9, color: "#52525b" }}>{k.hint}</div>
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
