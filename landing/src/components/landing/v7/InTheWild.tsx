"use client";

import { INCIDENTS } from "@/data/incidents";

/**
 * In the wild — incident ledger. Each incident is one row in a vertical
 * journalistic feed: severity stripe, type icon, date, title, damage line,
 * and source link. No card art — the focus is text + density.
 */

type Severity = "data-loss" | "compliance" | "self-pres" | "fabrication" | "credential" | "default";

const TYPE_META: Record<string, { label: string; severity: Severity; tint: string }> = {
  "replit-prod-db":   { label: "Data loss",      severity: "data-loss",   tint: "#dc2626" },
  "claude-blackmail": { label: "Self-preservation", severity: "self-pres", tint: "#a855f7" },
  "mata-avianca":     { label: "Fabrication",    severity: "fabrication", tint: "#f59e0b" },
  "pocketos":         { label: "Data loss",      severity: "data-loss",   tint: "#dc2626" },
  "yoshua-blackmail": { label: "Self-preservation", severity: "self-pres", tint: "#a855f7" },
  "agent-credential": { label: "Credential abuse", severity: "credential", tint: "#ef4444" },
};

function fallbackTypeMeta(slug: string): { label: string; severity: Severity; tint: string } {
  // pick deterministic fallback if slug isn't in the map
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = ((h << 5) - h + slug.charCodeAt(i)) | 0;
  const variants: Array<{ label: string; severity: Severity; tint: string }> = [
    { label: "Data loss",         severity: "data-loss",   tint: "#dc2626" },
    { label: "Compliance breach", severity: "compliance",  tint: "#f59e0b" },
    { label: "Self-preservation", severity: "self-pres",   tint: "#a855f7" },
    { label: "Fabrication",       severity: "fabrication", tint: "#facc15" },
    { label: "Credential abuse",  severity: "credential",  tint: "#ef4444" },
  ];
  return variants[Math.abs(h) % variants.length];
}

function TypeIcon({ severity }: { severity: Severity }) {
  const stroke = "currentColor";
  switch (severity) {
    case "data-loss":
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="8" cy="4" rx="5" ry="2" />
          <path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4" />
          <path d="M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" />
          <path d="M11.5 11.5l3 3M14.5 11.5l-3 3" />
        </svg>
      );
    case "self-pres":
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1.5L3 3.5v4.2c0 3.2 2 5.6 5 6.8 3-1.2 5-3.6 5-6.8V3.5z" />
          <path d="M8 5.5v3.5M8 11v0.5" />
        </svg>
      );
    case "fabrication":
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 13l4-9 2 5 1-2 3 6z" />
          <path d="M2 14h12" />
        </svg>
      );
    case "credential":
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="10" height="7" rx="1.5" />
          <path d="M5.5 7V4.5a2.5 2.5 0 0 1 5 0V7" />
          <circle cx="8" cy="10.5" r="1" fill={stroke} />
        </svg>
      );
    case "compliance":
    default:
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v3.5M8 9v0.5M3 8a5 5 0 1 0 10 0 5 5 0 0 0-10 0z" />
        </svg>
      );
  }
}

export default function InTheWild() {
  return (
    <section className="itw-section">
      <div aria-hidden="true" className="itw-bg" />
      <div className="itw-shell">
        <header className="itw-header">
          <div className="itw-header-left">
            <div className="eyebrow itw-eyebrow">
              <span className="ver">§ 08</span>
              <span>In the wild</span>
              <span className="itw-live">
                <span className="itw-live-dot" /> 6 logged
              </span>
            </div>
            <h2 className="section-hed">
              Agents are already doing things{" "}
              <span>they shouldn&rsquo;t.</span>
            </h2>
          </div>
          <p className="itw-header-right">
            A non-exhaustive feed of public incidents. Each one is a place where a
            propose-gate-receipt loop would have caught the agent before damage
            was done.
          </p>
        </header>

        <ol className="itw-feed">
          {INCIDENTS.map((inc, i) => {
            const meta = TYPE_META[inc.slug] ?? fallbackTypeMeta(inc.slug);
            const idx = String(i + 1).padStart(2, "0");
            return (
              <li key={inc.slug} className="itw-row">
                <div className="itw-stripe" style={{ background: meta.tint }} aria-hidden="true" />
                <div className="itw-row-inner">
                  <div className="itw-row-meta">
                    <span className="itw-idx">{idx}</span>
                    <span className="itw-date">{inc.date}</span>
                    <span
                      className="itw-type"
                      style={{ color: meta.tint, borderColor: `${meta.tint}66`, background: `${meta.tint}14` }}
                    >
                      <TypeIcon severity={meta.severity} />
                      {meta.label}
                    </span>
                  </div>

                  <div className="itw-row-body">
                    <h3 className="itw-title">{inc.title}</h3>
                    <p className="itw-quote">
                      &ldquo;{inc.quote}&rdquo;
                    </p>
                    <div className="itw-row-footer">
                      <span className="itw-attr">{inc.attribution}</span>
                      <a
                        href={inc.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="itw-source"
                      >
                        {inc.source} →
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="itw-footnote">
          <span className="itw-footnote-arrow">↳</span>
          Have one we missed?{" "}
          <a href="mailto:hello@statis.dev?subject=In%20the%20wild%20incident">
            send it to hello@statis.dev
          </a>
        </div>
      </div>

      <style jsx>{`
        .itw-section {
          position: relative;
          padding: 120px 24px;
          isolation: isolate;
        }
        .itw-bg {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(ellipse 50% 30% at 100% 0%, rgba(220,38,38,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 50% 30% at 0% 100%, rgba(168,85,247,0.04) 0%, transparent 60%);
        }
        .itw-shell { max-width: 1080px; margin: 0 auto; }

        .itw-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: end;
          margin-bottom: 56px;
        }
        @media (max-width: 880px) {
          .itw-header { grid-template-columns: 1fr; gap: 24px; }
        }
        .itw-eyebrow {
          align-items: center;
          flex-wrap: wrap;
        }
        .itw-live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: 4px;
          padding: 3px 8px;
          background: rgba(220,38,38,0.10);
          border: 1px solid rgba(220,38,38,0.25);
          border-radius: 999px;
          color: #b91c1c;
          font-size: 9px;
          letter-spacing: 0.10em;
        }
        .itw-live-dot {
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: #dc2626;
          box-shadow: 0 0 6px rgba(220,38,38,0.6);
          animation: itw-blink 1.6s ease-in-out infinite;
        }
        @keyframes itw-blink {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .itw-header-right {
          font-size: clamp(14px, 1.05vw, 16px);
          line-height: 1.6;
          color: var(--ink-soft);
          max-width: 460px;
          margin: 0 0 0 auto;
        }

        /* Feed */
        .itw-feed {
          list-style: none;
          margin: 0;
          padding: 0;
          border-top: 1px solid var(--rule);
        }
        .itw-row {
          position: relative;
          display: flex;
          align-items: stretch;
          border-bottom: 1px solid var(--rule);
          background: transparent;
          transition: background 220ms ease;
        }
        .itw-row:hover { background: rgba(251, 248, 241, 0.55); }
        .itw-stripe {
          width: 3px;
          flex-shrink: 0;
          opacity: 0.85;
          transition: width 220ms ease, opacity 220ms ease;
        }
        .itw-row:hover .itw-stripe { width: 5px; opacity: 1; }

        .itw-row-inner {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 32px;
          padding: 28px 24px 28px 28px;
          flex: 1;
          align-items: start;
        }
        @media (max-width: 720px) {
          .itw-row-inner {
            grid-template-columns: 1fr;
            gap: 14px;
            padding: 24px 20px;
          }
        }

        .itw-row-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-family: var(--mono);
        }
        .itw-idx {
          font-size: 11px;
          color: var(--ink-muted);
          letter-spacing: 0.18em;
        }
        .itw-date {
          font-size: 12px;
          color: var(--ink);
          font-weight: 500;
        }
        .itw-type {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 9px;
          border-radius: 3px;
          border: 1px solid;
          font-size: 10.5px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 600;
          align-self: flex-start;
        }

        .itw-row-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .itw-title {
          font-family: var(--display);
          font-size: clamp(17px, 1.45vw, 22px);
          font-weight: 500;
          color: var(--ink);
          line-height: 1.28;
          letter-spacing: -0.018em;
          margin: 0;
        }
        .itw-quote {
          font-style: italic;
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--ink-soft);
          margin: 0;
          padding: 0 0 0 14px;
          border-left: 2px solid var(--rule);
        }
        .itw-row:hover .itw-quote { border-left-color: var(--accent); }

        .itw-row-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-top: 4px;
          flex-wrap: wrap;
        }
        .itw-attr {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--ink-muted);
          letter-spacing: 0.02em;
        }
        .itw-source {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink);
          text-decoration: none;
          padding-bottom: 1px;
          border-bottom: 1px solid var(--rule);
          transition: color 0.18s, border-color 0.18s;
        }
        .itw-source:hover { color: var(--accent); border-color: var(--accent); }

        .itw-footnote {
          margin-top: 28px;
          font-family: var(--mono);
          font-size: 12px;
          color: var(--ink-muted);
        }
        .itw-footnote a { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
        .itw-footnote a:hover { color: var(--accent); }
        .itw-footnote-arrow { color: var(--accent); margin-right: 8px; }
      `}</style>
    </section>
  );
}
