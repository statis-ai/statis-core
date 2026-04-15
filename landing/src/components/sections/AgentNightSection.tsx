"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const ACTIONS = [
  { ts: "02:14:31", entity: "acct-4821", signal: "churn_risk=HIGH",   action: "apply_discount(15%)", status: "APPROVED",  rule: "churn_retention_v1", receipt: "rct-9f2a", ltv: "$1,200", plan: "growth"     },
  { ts: "02:14:33", entity: "acct-2201", signal: "churn_risk=HIGH",   action: "apply_discount(15%)", status: "APPROVED",  rule: "churn_retention_v1", receipt: "rct-8b1c", ltv: "$890",   plan: "pro"        },
  { ts: "02:14:35", entity: "acct-9910", signal: "ltv=$82,000",       action: "apply_discount(15%)", status: "ESCALATED", rule: "high_value_v1",      receipt: null,       ltv: "$82,000",plan: "enterprise"  },
  { ts: "02:14:37", entity: "acct-3301", signal: "last_refund=2d",    action: "apply_discount(15%)", status: "DENIED",    rule: "cooldown_v1",        receipt: null,       ltv: "$540",   plan: "growth"     },
  { ts: "02:14:40", entity: "acct-5501", signal: "churn_risk=HIGH",   action: "apply_discount(15%)", status: "APPROVED",  rule: "churn_retention_v1", receipt: "rct-7d3e", ltv: "$2,100", plan: "pro"        },
  { ts: "02:14:42", entity: "acct-1190", signal: "churn_risk=LOW",    action: "apply_discount(15%)", status: "SKIPPED",   rule: "below threshold",    receipt: null,       ltv: "$320",   plan: "starter"    },
  { ts: "02:14:45", entity: "acct-7712", signal: "churn_risk=HIGH",   action: "apply_discount(15%)", status: "APPROVED",  rule: "churn_retention_v1", receipt: "rct-6e4f", ltv: "$1,800", plan: "growth"     },
  { ts: "02:14:48", entity: "acct-6601", signal: "plan=free",         action: "apply_discount(15%)", status: "DENIED",    rule: "eligibility_v1",     receipt: null,       ltv: "$0",     plan: "free"       },
  { ts: "02:14:51", entity: "acct-8821", signal: "churn_risk=HIGH",   action: "apply_discount(15%)", status: "APPROVED",  rule: "churn_retention_v1", receipt: "rct-5f5g", ltv: "$3,400", plan: "pro"        },
  { ts: "02:14:54", entity: "acct-3390", signal: "ltv=$91,000",       action: "apply_discount(15%)", status: "ESCALATED", rule: "high_value_v1",      receipt: null,       ltv: "$91,000",plan: "enterprise"  },
  { ts: "02:14:57", entity: "acct-2291", signal: "churn_risk=HIGH",   action: "apply_discount(15%)", status: "APPROVED",  rule: "churn_retention_v1", receipt: "rct-4g6h", ltv: "$670",   plan: "growth"     },
  { ts: "02:14:59", entity: "acct-4401", signal: "last_active=180d",  action: "apply_discount(15%)", status: "DENIED",    rule: "recency_v1",         receipt: null,       ltv: "$410",   plan: "starter"    },
];

const S = {
  APPROVED:  { color: "#5a9a5a", bg: "rgba(80,160,80,0.08)",   border: "rgba(80,160,80,0.2)"    },
  ESCALATED: { color: "#c85c1a", bg: "rgba(200,92,26,0.1)",    border: "rgba(200,92,26,0.35)"   },
  DENIED:    { color: "#884040", bg: "rgba(160,60,60,0.07)",    border: "rgba(160,60,60,0.18)"   },
  SKIPPED:   { color: "#2e2e2e", bg: "transparent",             border: "rgba(255,255,255,0.05)" },
};

function useCountUp(target: number, active: boolean, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      let v = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const iv = setInterval(() => {
        v = Math.min(v + step, target);
        setVal(v);
        if (v >= target) clearInterval(iv);
      }, 30);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [target, active, delay]);
  return val;
}

function ReceiptDrawer({ action, onClose }: { action: typeof ACTIONS[0] | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {action && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-0 right-0 bottom-0 w-[280px] flex flex-col"
          style={{ background: "#0c0c0c", borderLeft: "1px solid #222", zIndex: 10 }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1a1a1a" }}>
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#444" }}>Receipt</span>
            <button onClick={onClose} className="text-[#333] hover:text-[#666] transition-colors text-lg leading-none">×</button>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {[
              ["receipt_id",  `sha256:${action.receipt?.slice(-4)}a3f2...`],
              ["action",      action.action],
              ["entity_id",   action.entity],
              ["policy",      action.rule],
              ["decision",    "APPROVED"],
              ["executed_at", `${action.ts} UTC`],
              ["adapter",     "stripe → PROMO15 applied"],
              ["ltv",         action.ltv],
              ["plan",        action.plan],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "#2e2e2e" }}>{k}</p>
                <p className="text-[11px] font-mono leading-snug" style={{ color: k === "decision" ? "#5a9a5a" : "#555" }}>{v}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3" style={{ borderTop: "1px solid #1a1a1a" }}>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#5a9a5a" }} />
              <span className="text-[9px] font-mono" style={{ color: "#2e2e2e" }}>Tamper-evident · SHA-256 signed</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AgentView({ started, onRowClick, selectedEntity }: {
  started: boolean;
  onRowClick: (a: typeof ACTIONS[0]) => void;
  selectedEntity: string | null;
}) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!started) { setVisibleCount(0); return; }
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= ACTIONS.length) clearInterval(iv);
    }, 380);
    return () => clearInterval(iv);
  }, [started]);

  return (
    <div className="flex flex-col h-full">
      {/* Terminal header info */}
      <div className="px-5 py-3 font-mono text-[11px]" style={{ borderBottom: "1px solid #111", color: "#2a2a2a" }}>
        <span style={{ color: "#444" }}>cs-agent</span>
        <span className="mx-2">·</span>
        <span>847 accounts queued</span>
        <span className="mx-2">·</span>
        <span>churn_retention_v1 active</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {ACTIONS.map((a, i) => {
          const cfg = S[a.status as keyof typeof S];
          const visible = i < visibleCount;
          const isClickable = a.status === "APPROVED";
          const isSelected = selectedEntity === a.entity;
          const isEscalated = a.status === "ESCALATED";

          return (
            <AnimatePresence key={a.entity}>
              {visible && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    boxShadow: isEscalated
                      ? ["0 0 0px rgba(200,92,26,0)", "0 0 20px rgba(200,92,26,0.25)", "0 0 20px rgba(200,92,26,0.25)", "0 0 0px rgba(200,92,26,0)"]
                      : "none",
                  }}
                  transition={{
                    opacity: { duration: 0.25 },
                    x: { type: "spring", stiffness: 280, damping: 28 },
                    boxShadow: isEscalated ? { delay: 0.4, duration: 1.4, times: [0, 0.3, 0.7, 1] } : {},
                  }}
                  onClick={() => isClickable && onRowClick(a)}
                  className="flex items-center gap-3 rounded px-3 py-1.5 font-mono text-[11px] transition-colors"
                  style={{
                    cursor: isClickable ? "pointer" : "default",
                    background: isSelected ? "rgba(200,92,26,0.06)" : "transparent",
                    border: isSelected ? "1px solid rgba(200,92,26,0.15)" : "1px solid transparent",
                  }}
                >
                  <span className="shrink-0 w-[58px]" style={{ color: "#252525" }}>{a.ts}</span>
                  <span className="shrink-0 w-[80px]" style={{ color: "#555" }}>{a.entity}</span>
                  <span className="shrink-0 w-[130px] truncate" style={{ color: "#333" }}>{a.signal}</span>
                  <span className="shrink-0" style={{ color: "#1e1e1e" }}>→</span>
                  <span className="flex-1 truncate" style={{ color: a.status === "SKIPPED" ? "#222" : "#444" }}>{a.action}</span>

                  {/* Status badge — pops in with delay */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 20 }}
                    className="shrink-0 text-[9px] px-2 py-0.5 rounded"
                    style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    {a.status}
                  </motion.span>

                  {isClickable && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="shrink-0 text-[9px] font-mono"
                      style={{ color: "#252525" }}
                    >
                      {a.receipt}
                    </motion.span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}

        {/* Done message */}
        <AnimatePresence>
          {visibleCount >= ACTIONS.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-3 pt-3 font-mono text-[10px]"
              style={{ color: "#252525", borderTop: "1px solid #141414", marginTop: "8px" }}
            >
              <span style={{ color: "#2e2e2e" }}>03:01:14</span>
              <span className="ml-3">run complete · 12 actions · 6 executed · 2 escalated · 3 denied · 1 skipped</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HumanView({ started }: { started: boolean }) {
  const [escalationState, setEscalationState] = useState<"pending" | "approved" | "rejected">("pending");

  const reviewed  = useCountUp(847, started, 0);
  const executed  = useCountUp(6,   started, 200);
  const escalated = useCountUp(2,   started, 400);
  const blocked   = useCountUp(3,   started, 600);

  const metrics = [
    { label: "accounts reviewed", value: reviewed.toLocaleString(), color: "#555"    },
    { label: "executed autonomously", value: String(executed),      color: "#5a9a5a" },
    { label: "waiting for you",       value: String(escalated),     color: "#c85c1a" },
    { label: "blocked by policy",     value: String(blocked),       color: "#884040" },
  ];

  return (
    <div className="flex flex-col h-full px-5 py-4 overflow-y-auto">
      {/* Morning headline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5"
      >
        <p className="text-[10px] font-mono mb-1" style={{ color: "#2e2e2e" }}>03:01 AM — run complete</p>
        <h3 className="text-base font-bold leading-snug" style={{ color: "#ccc" }}>
          Your agent worked while you slept.
        </h3>
        <p className="text-xs mt-1" style={{ color: "#333" }}>
          Here's exactly what it did — and why.
        </p>
      </motion.div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-4 gap-2 mb-5"
      >
        {metrics.map((m, i) => (
          <div key={m.label} className="rounded p-3 text-center" style={{ background: "#0e0e0e", border: "1px solid #1a1a1a" }}>
            <p className="font-mono font-bold text-lg mb-0.5" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[9px] leading-snug" style={{ color: "#2e2e2e" }}>{m.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Escalation card — interactive */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-4 rounded-lg p-4"
        style={{
          background: "#0c0c0c",
          border: "1px solid rgba(200,92,26,0.2)",
          borderTop: "1px solid rgba(200,92,26,0.4)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#c85c1a" }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#c85c1a" }}>Needs your call</span>
          </div>
          <span className="text-[9px] font-mono" style={{ color: "#2e2e2e" }}>02:14:35</span>
        </div>

        <div className="flex gap-4 mb-4">
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "#2a2a2a" }}>entity</p>
            <p className="text-xs font-mono" style={{ color: "#555" }}>acct-9910</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "#2a2a2a" }}>ltv</p>
            <p className="text-xs font-mono" style={{ color: "#555" }}>$82,000</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "#2a2a2a" }}>action</p>
            <p className="text-xs font-mono" style={{ color: "#555" }}>apply_discount(15%)</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "#2a2a2a" }}>reason</p>
            <p className="text-xs font-mono" style={{ color: "#555" }}>high_value_v1: &gt;$50k needs human</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {escalationState === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => setEscalationState("approved")}
                className="text-xs font-mono px-4 py-1.5 rounded transition-all"
                style={{ background: "rgba(80,160,80,0.1)", color: "#5a9a5a", border: "1px solid rgba(80,160,80,0.2)" }}
              >
                Approve
              </button>
              <button
                onClick={() => setEscalationState("rejected")}
                className="text-xs font-mono px-4 py-1.5 rounded transition-all"
                style={{ background: "rgba(160,60,60,0.07)", color: "#884040", border: "1px solid rgba(160,60,60,0.18)" }}
              >
                Reject
              </button>
              <span className="text-[10px] font-mono" style={{ color: "#252525" }}>Discount held until reviewed</span>
            </motion.div>
          )}
          {escalationState === "approved" && (
            <motion.div
              key="approved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-[10px] font-mono px-3 py-1 rounded" style={{ background: "rgba(80,160,80,0.08)", color: "#5a9a5a", border: "1px solid rgba(80,160,80,0.2)" }}>
                ✓ Approved — discount executing via Stripe
              </span>
              <button onClick={() => setEscalationState("pending")} className="text-[9px] font-mono" style={{ color: "#252525" }}>undo</button>
            </motion.div>
          )}
          {escalationState === "rejected" && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-[10px] font-mono px-3 py-1 rounded" style={{ background: "rgba(160,60,60,0.07)", color: "#884040", border: "1px solid rgba(160,60,60,0.18)" }}>
                ✗ Rejected — action blocked, receipt logged
              </span>
              <button onClick={() => setEscalationState("pending")} className="text-[9px] font-mono" style={{ color: "#252525" }}>undo</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Policy summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="space-y-1"
      >
        {[
          { rule: "churn_retention_v1",  outcomes: "6 approved, 1 denied (cooldown)"       },
          { rule: "high_value_v1",        outcomes: "2 escalated (>$50k threshold)"         },
          { rule: "eligibility_v1",       outcomes: "1 denied (free plan ineligible)"       },
          { rule: "recency_v1",           outcomes: "1 denied (last_active > 90d)"          },
        ].map(({ rule, outcomes }) => (
          <div key={rule} className="flex items-center gap-3 font-mono text-[10px]">
            <span className="w-[170px] shrink-0" style={{ color: "#2a2a2a" }}>{rule}</span>
            <span style={{ color: "#252525" }}>{outcomes}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function AgentNightSection() {
  const [view, setView] = useState<"agent" | "human">("agent");
  const [started, setStarted] = useState(false);
  const [selectedAction, setSelectedAction] = useState<typeof ACTIONS[0] | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (inView) setTimeout(() => setStarted(true), 400);
  }, [inView]);

  function handleToggle(v: "agent" | "human") {
    setView(v);
    setSelectedAction(null);
  }

  return (
    <section className="py-20" ref={ref}>
      <div className="mx-auto max-w-5xl px-6">

        {/* Label + heading */}
        <div className="text-center mb-10">
          <p
            className="text-[10px] uppercase tracking-[0.25em] mb-3 inline-block px-2 py-0.5 rounded"
            style={{ color: "var(--text-2)", background: "rgba(255,255,255,0.04)" }}
          >
            Live demo
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
            Your agent, working while you sleep.
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-2)" }}>
            847 accounts. 12 actions. 0 surprises. Every decision — receipted.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex rounded-lg p-0.5" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
            {(["agent", "human"] as const).map(v => (
              <button
                key={v}
                onClick={() => handleToggle(v)}
                className="relative px-5 py-1.5 text-xs font-mono rounded transition-colors"
                style={{ color: view === v ? "#fff" : "#444" }}
              >
                {view === v && (
                  <motion.span
                    layoutId="toggle-pill"
                    className="absolute inset-0 rounded"
                    style={{ background: "rgba(200,92,26,0.15)", border: "1px solid rgba(200,92,26,0.25)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {v === "agent" ? "Agent view" : "Human view"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.1 }}
          className="relative rounded-xl overflow-hidden"
          style={{
            background: "#090909",
            border: "1px solid #1e1e1e",
            borderTop: "1px solid rgba(200,92,26,0.3)",
            boxShadow: [
              "0 0 0 1px rgba(0,0,0,0.5)",
              "0 32px 80px rgba(0,0,0,0.7)",
              "0 0 80px rgba(200,92,26,0.04)",
            ].join(", "),
            minHeight: "420px",
          }}
        >
          {/* Dot grid background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          {/* Orange ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,92,26,0.06) 0%, transparent 70%)",
            }}
          />

          {/* Chrome bar */}
          <div
            className="relative flex items-center gap-3 px-4 py-3"
            style={{ background: "#111", borderBottom: "1px solid #1a1a1a" }}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#3a1a1a" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#2e2a1a" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#1a2a1a" }} />
            </div>
            <div className="flex-1 text-center">
              <span className="text-[10px] font-mono" style={{ color: "#333" }}>
                {view === "agent" ? "statis-agent — cs-agent v1.0 — 02:14 AM" : "statis console — morning summary"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#c85c1a" }} />
              <span className="text-[9px] font-mono" style={{ color: "rgba(200,92,26,0.6)" }}>live</span>
            </div>
          </div>

          {/* Content — crossfade between views */}
          <div className="relative" style={{ minHeight: "380px" }}>
            <AnimatePresence mode="wait">
              {view === "agent" ? (
                <motion.div
                  key="agent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <AgentView
                    started={started && view === "agent"}
                    onRowClick={setSelectedAction}
                    selectedEntity={selectedAction?.entity ?? null}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="human"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <HumanView started={started} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Receipt drawer */}
            <ReceiptDrawer action={selectedAction} onClose={() => setSelectedAction(null)} />
          </div>
        </motion.div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="text-center mt-4 text-[10px] font-mono"
          style={{ color: "#252525" }}
        >
          {view === "agent" ? "Click any APPROVED row to view its receipt →" : "Click Approve or Reject on the escalation above"}
        </motion.p>
      </div>
    </section>
  );
}
