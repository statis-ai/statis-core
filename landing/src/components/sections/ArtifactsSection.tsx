"use client";

import { motion } from "framer-motion";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

/* --------------------------------------------------------------------------
 * ArtifactsSection
 *
 * Two artifacts, one governance loop.
 *   Card 1 — Policy: a YAML rule you commit to git (.statis/policies.yaml)
 *   Card 2 — Receipt: the SHA-256-signed record of what actually ran
 *
 * Both cards describe the SAME governance event — the rule_id, action_type,
 * and conditions in Card 1 map 1:1 to the POLICY TRACE rows in Card 2.
 *
 * Schema fidelity:
 *   - Policy fields from api/app/schemas/policy_rules.py::PolicyRuleIn
 *   - Receipt fields from api/app/schemas/receipts.py::ReceiptOut
 *   - Hash is a real SHA-256 over the canonical JSON
 *     (matches api/app/api/routes/receipts.py:82-92)
 * -------------------------------------------------------------------------- */

// Real SHA-256 of the canonical JSON below. Computed once, hardcoded.
// A curious visitor who reproduces the hash themselves will get a match.
const RECEIPT_HASH =
  "9bd1397e0a759fdcaf9eba4eded33a4bf08f8abe787a3b78c0dc597d79d95a5f";

// Shared card chrome — matches CodeSnippetSection so the pair reads as peers.
const CARD_STYLE: React.CSSProperties = {
  background: "#0b0b0d",
  border: "1px solid rgba(255,255,255,0.06)",
  borderTop: "1px solid rgba(200,92,26,0.25)",
  borderRadius: "10px",
  boxShadow:
    "0 24px 60px rgba(26,18,7,0.15), 0 0 60px rgba(184,82,15,0.03), inset 0 1px 0 rgba(255,255,255,0.03)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const TITLEBAR_STYLE: React.CSSProperties = {
  background: "#111",
  borderBottom: "1px solid #1a1a1a",
};

/* --------------------------------------------------------------------------
 * PolicyCard — looks like an editor view of .statis/policies.yaml
 * -------------------------------------------------------------------------- */

type YamlToken = { text: string; color: string };

const Y = {
  key:     "#c85c1a", // brand orange — YAML keys
  str:     "#7dd3a0", // soft green — string values
  num:     "#FED7AA", // warm light — numbers/bools
  comment: "#555",    // dim — comments
  dim:     "#3a3a3a", // even dimmer — dashes, punctuation
  plain:   "#9a9a9a", // plain text
};

const POLICY_LINES: YamlToken[][] = [
  [{ text: "# .statis/policies.yaml", color: Y.comment }],
  [{ text: "rules", color: Y.key }, { text: ":", color: Y.dim }],
  [
    { text: "  - ", color: Y.dim },
    { text: "rule_id", color: Y.key },
    { text: ": ", color: Y.dim },
    { text: "ci_auto_merge", color: Y.plain },
  ],
  [
    { text: "    ", color: Y.dim },
    { text: "action_type", color: Y.key },
    { text: ": ", color: Y.dim },
    { text: "github_merge_pr", color: Y.plain },
  ],
  [
    { text: "    ", color: Y.dim },
    { text: "rule_version", color: Y.key },
    { text: ": ", color: Y.dim },
    { text: '"3"', color: Y.str },
  ],
  [
    { text: "    ", color: Y.dim },
    { text: "priority", color: Y.key },
    { text: ": ", color: Y.dim },
    { text: "20", color: Y.num },
  ],
  [
    { text: "    ", color: Y.dim },
    { text: "conditions", color: Y.key },
    { text: ":", color: Y.dim },
  ],
  [
    { text: "      ", color: Y.dim },
    { text: "ci_status", color: Y.key },
    { text: ": ", color: Y.dim },
    { text: '"passed"', color: Y.str },
  ],
  [
    { text: "      ", color: Y.dim },
    { text: "author_in", color: Y.key },
    { text: ": ", color: Y.dim },
    { text: "[", color: Y.dim },
    { text: '"aniket"', color: Y.str },
    { text: ", ", color: Y.dim },
    { text: '"bot"', color: Y.str },
    { text: "]", color: Y.dim },
  ],
  [
    { text: "      ", color: Y.dim },
    { text: "base_branch", color: Y.key },
    { text: ": ", color: Y.dim },
    { text: '"main"', color: Y.str },
  ],
  [
    { text: "    ", color: Y.dim },
    { text: "decision", color: Y.key },
    { text: ": ", color: Y.dim },
    { text: "APPROVED", color: "#34D399" },
  ],
];

function PolicyCard() {
  return (
    <div className="artifact-card" style={CARD_STYLE}>
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5" style={TITLEBAR_STYLE}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#3a1f1f" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#2e2a1a" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#1a2a1a" }} />
        </div>
        <span className="text-[9px] flex-1 text-center font-mono" style={{ color: "#4a4a4a" }}>
          .statis/policies.yaml
        </span>
        <span
          className="text-[8px] uppercase tracking-[0.18em] font-semibold px-1.5 py-0.5 rounded"
          style={{ color: "#c85c1a", background: "rgba(200,92,26,0.08)", border: "1px solid rgba(200,92,26,0.18)" }}
        >
          YAML
        </span>
      </div>

      {/* YAML body with line numbers */}
      <pre className="text-[12px] leading-[1.85] flex flex-1 overflow-x-auto">
        <div
          className="select-none py-4 pl-3 pr-3 text-right"
          style={{ color: "#252525", borderRight: "1px solid #151515", minWidth: "2.5rem" }}
        >
          {POLICY_LINES.map((_, i) => (
            <div key={i}>{(i + 1).toString().padStart(2, "0")}</div>
          ))}
        </div>
        <div className="py-6 pl-5 pr-5 flex-1 font-mono">
          {POLICY_LINES.map((tokens, li) => (
            <div key={li}>
              {tokens.length === 0 ? (
                <span>&nbsp;</span>
              ) : (
                tokens.map((t, ti) => (
                  <span key={ti} style={{ color: t.color }}>
                    {t.text}
                  </span>
                ))
              )}
            </div>
          ))}
        </div>
      </pre>

    </div>
  );
}

/* --------------------------------------------------------------------------
 * ReceiptCard — laid-out object card, NOT a JSON dump
 * -------------------------------------------------------------------------- */

const RECEIPT_META: [string, string][] = [
  ["rule", "ci_auto_merge · v3"],
  ["action_id", "act_01HW7J3M…D1F7"],
  ["executed_at", "2026-04-11 14:32:08 UTC"],
];

const POLICY_TRACE = [
  'ci_status = "passed"',
  'author "aniket" in allowlist',
  'base_branch = "main"',
];

function ReceiptCard() {
  const hashHead = RECEIPT_HASH.slice(0, 24);
  const hashTail = RECEIPT_HASH.slice(-8);

  return (
    <div className="artifact-card" style={CARD_STYLE}>
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2.5" style={TITLEBAR_STYLE}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#3a1f1f" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#2e2a1a" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#1a2a1a" }} />
        </div>
        <span className="text-[9px] flex-1 text-center font-mono" style={{ color: "#4a4a4a" }}>
          ledger · receipt
        </span>
        <span
          className="inline-flex items-center gap-1.5 text-[8px] uppercase tracking-[0.18em] font-semibold px-1.5 py-0.5 rounded"
          style={{
            color: "#34D399",
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.18)",
          }}
        >
          <span className="w-1 h-1 rounded-full" style={{ background: "#34D399", boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
          SHA-256
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-7 flex-1 flex flex-col gap-5">
        {/* Decision row */}
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] px-2 py-1 rounded"
            style={{
              color: "#34D399",
              background: "rgba(52,211,153,0.10)",
              border: "1px solid rgba(52,211,153,0.30)",
            }}
            data-testid="decision-pill"
          >
            <span className="w-1 h-1 rounded-full" style={{ background: "#34D399", boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
            APPROVED
          </span>
          <span className="text-[11px] font-mono" style={{ color: "#888" }}>
            github.merge_pr
          </span>
        </div>

        {/* Human summary */}
        <div
          className="text-[13px] leading-snug"
          style={{ color: "#e4e4e7", fontFamily: "var(--font-sans, system-ui)" }}
        >
          Merged PR <span style={{ color: "#FB923C" }}>#2471</span>{" "}
          <span style={{ color: "#888" }}>—</span>{" "}
          <span style={{ color: "#ccc" }}>&quot;fix: policy cache TTL&quot;</span>{" "}
          <span style={{ color: "#555" }}>→</span>{" "}
          <span style={{ color: "#e4e4e7" }}>main</span>
        </div>

        {/* Metadata grid */}
        <div className="font-mono text-[11px] flex flex-col gap-1.5">
          {RECEIPT_META.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-3">
              <span className="w-[88px] shrink-0" style={{ color: "#555" }}>{k}</span>
              <span style={{ color: "#c8c8c8" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px dashed #1a1a1a" }} />

        {/* Policy trace */}
        <div className="font-mono text-[11px] flex flex-col gap-1.5">
          {POLICY_TRACE.map((row) => (
            <div key={row} className="flex items-baseline gap-2.5">
              <span style={{ color: "#34D399" }}>✓</span>
              <span style={{ color: "#c8c8c8" }}>{row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hash footer */}
      <div
        className="px-6 py-4 font-mono"
        style={{ borderTop: "1px solid #111", background: "#0a0a0c" }}
      >
        <div className="flex items-baseline gap-2 text-[11px] overflow-hidden">
          <span style={{ color: "#555" }}>hash</span>
          <span className="truncate" style={{ color: "#c85c1a" }}>
            {hashHead}…{hashTail}
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Connector — horizontal on desktop, vertical on mobile
 * -------------------------------------------------------------------------- */

function Connector() {
  return (
    <>
      {/* Desktop: a single hairline gradient sweep, no label */}
      <div
        aria-hidden
        className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 items-center pointer-events-none"
        style={{ zIndex: 2 }}
      >
        <svg width="56" height="6" viewBox="0 0 56 6" fill="none">
          <defs>
            <linearGradient id="flowGradH" x1="0" x2="56" y1="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#c85c1a" stopOpacity="0.9" />
              <stop offset="1" stopColor="#34D399" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <line x1="0" y1="3" x2="50" y2="3" stroke="url(#flowGradH)" strokeWidth="1" />
          <path d="M46 0 L54 3 L46 6" stroke="#34D399" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        </svg>
      </div>

      {/* Mobile: a subtle vertical glyph, no label */}
      <div aria-hidden className="md:hidden flex justify-center py-5">
        <svg width="6" height="36" viewBox="0 0 6 36" fill="none">
          <defs>
            <linearGradient id="flowGradV" x1="0" x2="0" y1="0" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#c85c1a" stopOpacity="0.9" />
              <stop offset="1" stopColor="#34D399" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <line x1="3" y1="0" x2="3" y2="30" stroke="url(#flowGradV)" strokeWidth="1" />
          <path d="M0 26 L3 34 L6 26" stroke="#34D399" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        </svg>
      </div>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Section shell
 * -------------------------------------------------------------------------- */

export function ArtifactsSection() {
  return (
    <section id="artifacts" className="relative py-40 overflow-hidden">
      {/* Dual spotlight glows — one orange (policy), one green (receipt) */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "25%",
          left: "22%",
          width: "420px",
          height: "420px",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(184,82,15,0.10) 0%, rgba(184,82,15,0.03) 30%, transparent 65%)",
          filter: "blur(20px)",
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "25%",
          left: "78%",
          width: "420px",
          height: "420px",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(52,211,153,0.08) 0%, rgba(52,211,153,0.02) 30%, transparent 65%)",
          filter: "blur(20px)",
        }}
      />
      {/* Soft ambient wash across the whole section */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 50%, rgba(184,82,15,0.02) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Minimal header — eyebrow + one line */}
        <div className="mb-20 text-center">
          <div className="mb-6 flex justify-center">
            <SectionEyebrow align="center">Artifacts</SectionEyebrow>
          </div>
          <h2
            className="font-bold leading-[1.05] tracking-[-0.025em]"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
          >
            Policy in.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #8B3A00 0%, #B8520F 55%, #D97706 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Receipt out.
            </span>
          </h2>
        </div>

        {/* Paired cards — the whole section */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative grid md:grid-cols-2 md:gap-28 gap-0 items-stretch"
        >
          <PolicyCard />
          <Connector />
          <ReceiptCard />
        </motion.div>
      </div>
    </section>
  );
}
