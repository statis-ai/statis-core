"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedTerminal, TerminalLine } from "@/components/ui/AnimatedTerminal";

const STEPS: {
  id: number;
  num: string;
  tag: string;
  label: string;
  body: string;
  lines: TerminalLine[];
  accent: string;
  border: string;
  bg: string;
  activeBg: string;
  dot: string;
  glowColor: string;
}[] = [
  {
    id: 0,
    num: "01",
    tag: "Action Contract",
    label: "Agent proposes. Nothing executes yet.",
    body: "The agent declares a typed intent. Side effects are blocked until policy approves.",
    lines: [
      { type: "comment", text: "# Agent proposes — nothing executes yet" },
      { type: "prompt",  text: "POST /actions" },
      { type: "code",    text: '{  "action_type": "apply_discount",' },
      { type: "code",    text: '   "target": "acct-8821",' },
      { type: "code",    text: '   "params": { "pct": 10 }  }' },
      { type: "info",    text: "→ 201 PROPOSED  act-f93a" },
      { type: "spacer",  text: "" },
      { type: "comment", text: "# State is read — no write yet" },
      { type: "info",    text: '→ churn_risk: "HIGH"  ltv: 1200' },
    ],
    accent: "text-[#00ffc8]",
    border: "border-[#00ffc8]/20",
    bg: "bg-transparent",
    activeBg: "bg-[#00ffc8]/6",
    dot: "bg-[#00ffc8]",
    glowColor: "rgba(0,255,200,0.15)",
  },
  {
    id: 1,
    num: "02",
    tag: "Policy Engine",
    label: "Deterministic rule. No ML. Versioned.",
    body: "Pure function evaluates action against entity state and history. APPROVED, DENIED, or ESCALATED.",
    lines: [
      { type: "comment", text: "# Policy evaluates against entity state" },
      { type: "prompt",  text: "POST /actions/act-f93a/evaluate" },
      { type: "info",    text: "→ rule: churn_retention_v1@1.0" },
      { type: "info",    text: "→ churn_risk=HIGH          ✓" },
      { type: "info",    text: "→ ltv=1200 > threshold     ✓" },
      { type: "info",    text: "→ no_discount_in_30d       ✓" },
      { type: "spacer",  text: "" },
      { type: "success", text: "→ APPROVED" },
    ],
    accent: "text-[#7a756e]",
    border: "border-[#7a756e]/20",
    bg: "bg-transparent",
    activeBg: "bg-[#7a756e]/5",
    dot: "bg-[#7a756e]",
    glowColor: "rgba(122,117,110,0.08)",
  },
  {
    id: 2,
    num: "03",
    tag: "Execution Lock",
    label: "Exactly once. Always.",
    body: "Distributed lock on the action ID. Adapter called once. Retries are blocked — the external system is never called twice.",
    lines: [
      { type: "info",    text: "→ lock acquired  act-f93a" },
      { type: "info",    text: "→ stripe.apply_discount(10%) called" },
      { type: "success", text: "→ COMPLETED  charge_id: ch_mock_x9f2" },
      { type: "spacer",  text: "" },
      { type: "comment", text: "# agent retries 4s later:" },
      { type: "prompt",  text: 'POST /actions  { "action_id": "act-f93a" }' },
      { type: "blocked", text: "→ 409  receipt exists — BLOCKED" },
      { type: "comment", text: "# Stripe never charged twice" },
    ],
    accent: "text-[#7a756e]",
    border: "border-[#7a756e]/20",
    bg: "bg-transparent",
    activeBg: "bg-[#7a756e]/5",
    dot: "bg-[#7a756e]",
    glowColor: "rgba(122,117,110,0.08)",
  },
  {
    id: 3,
    num: "04",
    tag: "Ledger",
    label: "Tamper-evident receipt. Forever.",
    body: "SHA-256 hash written atomically at execution. Rule version, approver, timestamp. Immutable proof — not logs.",
    lines: [
      { type: "prompt",  text: "GET /actions/act-f93a/receipt" },
      { type: "code",    text: "{" },
      { type: "code",    text: '  "receipt_id": "rct-8821",' },
      { type: "code",    text: '  "rule_id":    "churn_retention_v1",' },
      { type: "code",    text: '  "rule_ver":   "1.0",' },
      { type: "code",    text: '  "approved_by":"policy_engine",' },
      { type: "code",    text: '  "hash":       "sha256:3f9a8b2c..."' },
      { type: "code",    text: "}" },
      { type: "success", text: "→ immutable  tamper-evident" },
    ],
    accent: "text-[#7a756e]",
    border: "border-[#7a756e]/20",
    bg: "bg-transparent",
    activeBg: "bg-[#7a756e]/5",
    dot: "bg-[#7a756e]",
    glowColor: "rgba(122,117,110,0.08)",
  },
];

const AUTO_ADVANCE_MS = 4000;

export function PrimitivesFlowSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const advance = useCallback(() => {
    setActive(prev => (prev + 1) % STEPS.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / AUTO_ADVANCE_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(tick);
        advance();
      }
    }, 30);
    return () => clearInterval(tick);
  }, [active, paused, advance]);

  const step = STEPS[active];

  return (
    <section
      className="relative py-32 overflow-hidden section-divider"
      id="primitives"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >

      <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto mb-16 text-center"
        >
          <p className="mb-4 text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#7a756e]">
            How It Works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#e8e5de] leading-[1.1] mb-5">
            Four primitives.
            <br />
            <span className="text-gradient">One governed execution.</span>
          </h2>
          <p className="text-[#7a7a8a] text-lg leading-relaxed">
            Every agent action flows through four stages. Each one auditable. Together they make agents production-safe.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">

          <div className="space-y-2">
            {STEPS.map((s) => {
              const isActive = s.id === active;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => { setActive(s.id); setProgress(0); setPaused(true); }}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: s.id * 0.07 }}
                  whileHover={{ scale: 1.01 }}
                  className={`w-full text-left rounded-2xl border px-5 py-4 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? `${s.border} ${s.activeBg}`
                      : "border-white/6 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                  }`}
                  style={isActive ? { boxShadow: `0 0 30px ${s.glowColor}` } : {}}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`font-mono text-[10px] font-bold tracking-[0.2em] ${isActive ? s.accent : "text-[#3a3a4a]"}`}>
                      {s.num}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border ${
                      isActive ? `${s.border} ${s.accent}` : "border-white/8 text-[#4a4a6a]"
                    }`}>
                      {s.tag}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold mb-1 ${isActive ? "text-white" : "text-[#6a6a7a]"}`}>
                    {s.label}
                  </p>
                  <p className={`text-xs leading-relaxed ${isActive ? "text-[#8a8a9a]" : "text-[#4a4a5a]"}`}>
                    {s.body}
                  </p>

                  {isActive && !paused && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
                      <motion.div
                        className={`h-full ${s.dot.replace("bg-", "bg-")}`}
                        style={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                      />
                    </div>
                  )}
                </motion.button>
              );
            })}

            <div className="flex items-center justify-center gap-2 pt-2">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActive(s.id); setProgress(0); }}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    s.id === active ? `w-6 h-1.5 ${s.dot}` : "w-1.5 h-1.5 bg-white/15 hover:bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-[#07090f] overflow-hidden terminal-glow h-full"
          >
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6 bg-white/[0.02] transition-colors duration-500">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4a4540]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#4a4540]/45" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#4a4540]/35" />
              <div className="ml-3 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${step.dot} shadow-sm`} />
                <span className={`text-[11px] font-mono ${step.accent}`}>{step.tag}</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] shadow-[0_0_6px_rgba(0,255,200,0.8)]" />
                <span className="text-[10px] font-mono text-[#00ffc8]">live</span>
              </div>
            </div>

            <div className="p-6 min-h-[360px] flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex-1"
                >
                  <AnimatedTerminal
                    lines={step.lines}
                    title={`statis — step ${step.num}`}
                    className="border-0 bg-transparent"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-5 py-3 border-t border-white/5 bg-white/[0.015] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#3a3a4a]">api.statis.dev</span>
              <div className="flex items-center gap-1">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={`rounded-full transition-all duration-300 ${
                      s.id === active ? `w-4 h-1 ${s.dot}` : "w-1 h-1 bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </motion.div>
    </section>
  );
}
