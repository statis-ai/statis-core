"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LINES = [
  { delay: 0,    text: "POST /actions",                              type: "prompt" },
  { delay: 0.1,  text: '{ "action_type": "apply_discount",',         type: "dim" },
  { delay: 0.18, text: '  "target": "acct-8821",',                   type: "dim" },
  { delay: 0.26, text: '  "params": { "pct": 10 } }',                type: "dim" },
  { delay: 0.6,  text: "",                                            type: "spacer" },
  { delay: 0.7,  text: "→ 201 PROPOSED        act-f93a",             type: "muted" },
  { delay: 1.1,  text: "→ evaluating policy   churn_retention_v1",   type: "muted" },
  { delay: 1.6,  text: "→ APPROVED",                                 type: "success" },
  { delay: 2.1,  text: "→ lock acquired       act-f93a",             type: "dim" },
  { delay: 2.5,  text: "→ stripe.discount(10%) executed",            type: "dim" },
  { delay: 3.0,  text: "→ COMPLETED",                                type: "success" },
  { delay: 3.3,  text: "",                                            type: "spacer" },
  { delay: 3.5,  text: "→ receipt  sha256:3f9a8b2c…",               type: "dim" },
  { delay: 3.8,  text: "→ rule     churn_retention_v1@1.0",          type: "dim" },
  { delay: 4.1,  text: "→ idempotent  act-f93a already receipted",   type: "dim" },
] as const;

const COLOR: Record<string, string> = {
  prompt:  "text-[#00ffc8]",
  dim:     "text-[#3f3f46]",
  muted:   "text-[#71717a]",
  success: "text-[#00ffc8]",
  spacer:  "",
};

function LiveTerminal() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((line, i) => {
      ids.push(setTimeout(() => setVisible(i + 1), line.delay * 1000 + 600));
    });
    return () => ids.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full terminal terminal-shadow overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/[0.07]" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/[0.05]" />
        <span className="ml-3 text-[11px] font-mono text-[#3f3f46] tracking-wider">
          statis — agent execution
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] animate-pulse" />
          <span className="text-[10px] font-mono text-[#00ffc8]">live</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 font-mono text-[12px] leading-[1.9] min-h-[300px]">
        {LINES.map((line, i) => {
          if (i >= visible) return null;
          if (line.type === "spacer") return <div key={i} className="h-2" />;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={COLOR[line.type]}
            >
              {line.type === "prompt" && (
                <span className="text-[#00ffc8]/40 mr-2 select-none">$</span>
              )}
              {line.text}
            </motion.div>
          );
        })}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block w-[7px] h-[13px] bg-[#00ffc8]/40 align-middle"
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.05] bg-white/[0.01]">
        <span className="text-[10px] font-mono text-[#3f3f46]">api.statis.dev · v0.1.0</span>
        <span className="text-[10px] font-mono text-[#00ffc8]/50">exactly-once ✓</span>
      </div>
    </div>
  );
}

const STATS = [
  { value: "< 15ms",  label: "policy eval" },
  { value: "100%",    label: "exactly-once" },
  { value: "SHA-256", label: "receipt hash" },
];

export function HeroV2() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div
              className="mb-8 inline-flex items-center gap-2 rounded px-3 py-1"
              style={{
                border: "1px solid var(--accent-border)",
                background: "var(--accent-bg)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8]" />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[#00ffc8]">
                Agent Execution Infrastructure
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-mono font-bold text-white leading-[1.1] tracking-tight mb-6"
              style={{ fontSize: "clamp(2.6rem, 4.8vw, 4rem)" }}
            >
              The execution layer<br />
              for production<br />
              <span style={{ color: "var(--accent)" }}>AI agents.</span>
            </h1>

            {/* Subline */}
            <p className="text-[#a1a1aa] text-base leading-relaxed max-w-md mb-8" style={{ fontFamily: "var(--font-sans)" }}>
              Policy before every action. Exactly-once execution guarantee.
              SHA-256 receipt on every outcome. Drop into any agent framework.
            </p>

            {/* Steps */}
            <div className="flex items-center gap-1.5 mb-10 text-[11px] font-mono text-[#52525b]">
              {["Propose", "Evaluate", "Execute ×1", "Receipt"].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-1.5">
                  <span>{step}</span>
                  {i < arr.length - 1 && <span className="text-[#27272a]">→</span>}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-12">
              <a
                href="https://www.surveymonkey.com/r/GVKH2KR"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded px-6 py-2.5 text-sm font-semibold text-black transition-all hover:opacity-90"
                style={{ background: "var(--accent)", fontFamily: "var(--font-sans)" }}
              >
                Request Access
              </a>
              <a
                href="https://docs.statis.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded px-5 py-2.5 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors border border-white/[0.08]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Read the docs →
              </a>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-6 max-w-sm pt-8"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {STATS.map(s => (
                <div key={s.label}>
                  <div className="text-lg font-mono font-bold text-white tracking-tight">{s.value}</div>
                  <div className="text-[10px] font-mono text-[#52525b] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <LiveTerminal />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
