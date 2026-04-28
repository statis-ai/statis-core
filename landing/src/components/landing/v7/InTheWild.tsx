"use client";

import { INCIDENTS } from "@/data/incidents";

export default function InTheWild() {
  return (
    <section style={{ padding: "120px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <header style={{ maxWidth: 780, marginBottom: 56 }}>
          <div className="eyebrow">
            <span className="ver">§ 09</span>
            <span>In the wild</span>
          </div>
          <h2 className="section-hed">
            Agents are already doing things{" "}
            <span>they shouldn&rsquo;t.</span>
          </h2>
          <p className="section-sub">
            A non-exhaustive list of incidents in production. Each one is a place where a propose-gate-receipt
            loop would have caught the agent before damage was done.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
          className="wild-grid"
        >
          {INCIDENTS.map((inc) => (
            <article
              key={inc.slug}
              style={{
                background: "#0a0a0b",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  aspectRatio: "16 / 9",
                  background: inc.gradient,
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 16,
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
                    pointerEvents: "none",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.85)",
                    background: "rgba(0,0,0,0.35)",
                    padding: "4px 8px",
                    borderRadius: 2,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {inc.date}
                </span>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#fafafa",
                    lineHeight: 1.3,
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {inc.title}
                </h3>

                <blockquote
                  style={{
                    fontStyle: "italic",
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: "#fca5a5",
                    margin: 0,
                    padding: "0 0 0 12px",
                    borderLeft: "2px solid rgba(248,113,113,0.45)",
                  }}
                >
                  &ldquo;{inc.quote}&rdquo;
                </blockquote>

                <div style={{ fontSize: 11, color: "#71717a", fontFamily: "var(--mono)" }}>
                  {inc.attribution}
                </div>

                <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <a
                    href={inc.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--mono)",
                      color: "#a1a1aa",
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {inc.source} →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .wild-grid {
            grid-auto-flow: column;
            grid-auto-columns: 80%;
            grid-template-columns: none;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 8px;
          }
          .wild-grid > article {
            scroll-snap-align: start;
          }
        }
      `}</style>
    </section>
  );
}
