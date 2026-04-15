"use client";

import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/reveal";

const ERROR_LINES = [
  { ts: "09:23:11.204", key: "action_id",    val: "act-7f3a1c",       dim: false },
  { ts: "09:23:11.206", key: "adapter",      val: "stripe.charge",    dim: false },
  { ts: "09:23:11.207", key: "amount",       val: "$299.00",          dim: false },
  { ts: "09:23:11.441", key: "executions",   val: "2  ← fired twice", warn: true },
  { ts: "09:23:11.442", key: "receipt",      val: "none",             muted: true },
  { ts: "09:23:11.442", key: "audit_trail",  val: "none",             muted: true },
  { ts: "09:23:11.443", key: "status",       val: "UNKNOWN",          muted: true },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left: the error log */}
          <Reveal>
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "#0C0C0F",
                border: "1px solid rgba(255,255,255,0.08)",
                borderTop: "1px solid rgba(220,60,60,0.35)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.25), 0 0 60px rgba(180,40,40,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Chrome */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: "#111114", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#5C2020" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#3F3520" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#2A2A2E" }} />
                </div>
                <span className="text-[9px] font-mono flex-1 text-center" style={{ color: "#71717A" }}>agent.log — prod-worker-3</span>
                <span
                  className="text-[8px] font-mono px-2 py-0.5 rounded font-semibold"
                  style={{ background: "rgba(220,60,60,0.12)", color: "#EF4444", border: "1px solid rgba(220,60,60,0.25)" }}
                >
                  ERROR
                </span>
              </div>

              {/* Shell prompt */}
              <div className="px-4 pt-3 pb-2 font-mono text-[10px]" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: "#52525B" }}>prod-worker-3@statis:~$ </span>
                <span style={{ color: "#A1A1AA" }}>tail -f agent.log</span>
              </div>

              <div className="px-4 py-4 font-mono text-[11px] leading-[1.9]">
                {ERROR_LINES.map(({ ts, key, val, warn, muted }) => (
                  <div key={key} className="flex gap-3">
                    <span style={{ color: "#52525B", flexShrink: 0 }}>[{ts}]</span>
                    <span style={{ color: "#71717A", minWidth: "88px" }}>{key}</span>
                    <span style={{
                      color: warn ? "#EF4444" : muted ? "#52525B" : "#D4D4D8",
                      fontWeight: warn ? 600 : 400,
                    }}>
                      {val}
                    </span>
                  </div>
                ))}

                <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "#71717A" }}>[09:23:12.001] </span>
                  <span style={{ color: "#EF4444" }}>WARN </span>
                  <span style={{ color: "#A1A1AA" }}>customer support ticket #4821 opened</span>
                </div>
                <div className="mt-2">
                  <span style={{ color: "#EF4444" }}>prod-worker-3@statis:~$ </span>
                  <span className="terminal-cursor" style={{ display: "inline-block", width: "7px", height: "12px", background: "#EF4444", verticalAlign: "middle", opacity: 0.8 }} />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: copy */}
          <Reveal delay={0.1}>
            <div>
              <div className="mb-4">
                <SectionEyebrow variant="accent">The problem</SectionEyebrow>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-4">
                Agents in production<br />
                need a guardrail layer.
              </h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-2)" }}>
                Your agent just charged a customer twice. There&rsquo;s no receipt,
                no audit trail, no way to know which policies ran or why.
                You find out when support calls.
              </p>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-2)" }}>
                Every AI agent that touches production systems — billing, CRM,
                communication, data — needs policy evaluation before it acts and
                a tamper-evident record of what happened after.
              </p>

              <div className="space-y-3">
                {[
                  { problem: "Agent retries charge customer twice", fix: "Exactly-once execution lock" },
                  { problem: "No visibility into what ran or why", fix: "SHA-256 receipt on every action" },
                  { problem: "No way to stop a rogue action mid-flight", fix: "Policy engine evaluates before execution" },
                ].map(({ problem, fix }) => (
                  <div key={problem} className="flex gap-4 text-xs">
                    <div className="flex-1" style={{ color: "#A1A1AA" }}>
                      <span style={{ color: "#71717A" }}>✗</span> {problem}
                    </div>
                    <div className="flex-1" style={{ color: "var(--orange)" }}>
                      <span>✓</span> {fix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
