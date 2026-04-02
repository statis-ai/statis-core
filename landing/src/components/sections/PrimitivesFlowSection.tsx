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
      { type: "code",    text: '  "hash":       "sha256:3f9a8b2c..."' },
      { type: "code",    text: "}" },
      { type: "success", text: "→ immutable  tamper-evident" },
    ],
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
      if (pct >= 100) { clearInterval(tick); advance(); }
    }, 30);
    return () => clearInterval(tick);
  }, [active, paused, advance]);

  const step = STEPS[active];

  return (
    <section
      className="relative py-28"
      id="primitives"
      style={{ borderTop: "1px solid var(--border-muted)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#52525b] mb-3">
            How it works
          </p>
          <h2 className="font-mono font-bold text-white text-3xl sm:text-4xl leading-[1.15]">
            Four primitives.<br />
            <span style={{ color: "var(--accent)" }}>One governed execution.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 items-start">

          {/* Step list */}
          <div className="space-y-1.5">
            {STEPS.map(s => {
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  onClick={() => { setActive(s.id); setProgress(0); setPaused(true); }}
                  className="w-full text-left rounded px-4 py-3.5 border transition-all duration-200 cursor-pointer relative overflow-hidden"
                  style={{
                    background: isActive ? "var(--bg-card)" : "transparent",
                    borderColor: isActive ? "rgba(255,255,255,0.1)" : "var(--border-muted)",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#52525b]">
                      {s.num}
                    </span>
                    <span
                      className="text-[10px] font-mono uppercase tracking-[0.08em] px-2 py-0.5 rounded"
                      style={{
                        color: isActive ? "var(--accent)" : "#52525b",
                        background: isActive ? "var(--accent-bg)" : "transparent",
                        border: isActive ? "1px solid var(--accent-border)" : "1px solid transparent",
                      }}
                    >
                      {s.tag}
                    </span>
                  </div>
                  <p className={`text-sm font-mono mb-0.5 ${isActive ? "text-white" : "text-[#52525b]"}`}>
                    {s.label}
                  </p>
                  <p className={`text-xs leading-relaxed ${isActive ? "text-[#71717a]" : "text-[#3f3f46]"}`}
                    style={{ fontFamily: "var(--font-sans)" }}>
                    {s.body}
                  </p>

                  {/* Progress bar */}
                  {isActive && !paused && (
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/5">
                      <div
                        className="h-full"
                        style={{ width: `${progress}%`, background: "var(--accent)", transition: "none" }}
                      />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Dots */}
            <div className="flex items-center gap-1.5 pt-2 pl-1">
              {STEPS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setActive(s.id); setProgress(0); }}
                  className="rounded-full transition-all duration-200 cursor-pointer"
                  style={{
                    width: s.id === active ? "20px" : "6px",
                    height: "4px",
                    background: s.id === active ? "var(--accent)" : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Terminal */}
          <div
            className="rounded border overflow-hidden terminal-shadow"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            {/* Chrome */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: "var(--border-muted)", background: "rgba(255,255,255,0.015)" }}
            >
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/[0.07]" />
              <div className="w-2 h-2 rounded-full bg-white/[0.05]" />
              <div className="ml-3 flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
                <span className="text-[11px] font-mono text-[#00ffc8]">{step.tag}</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8]" />
                <span className="text-[10px] font-mono text-[#00ffc8]">live</span>
              </div>
            </div>

            <div className="p-5 min-h-[320px] flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
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

            <div
              className="px-4 py-2.5 border-t flex items-center justify-between"
              style={{ borderColor: "var(--border-muted)", background: "rgba(255,255,255,0.01)" }}
            >
              <span className="text-[10px] font-mono text-[#3f3f46]">api.statis.dev</span>
              <div className="flex items-center gap-1">
                {STEPS.map(s => (
                  <div
                    key={s.id}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: s.id === active ? "14px" : "4px",
                      height: "3px",
                      background: s.id === active ? "var(--accent)" : "rgba(255,255,255,0.1)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
