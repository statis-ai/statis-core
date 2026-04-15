"use client";

import { SectionReveal } from "./shared";

function Terminal() {
  const lines: { prefix?: string; text: string; color?: string; mono?: boolean }[] = [
    { text: "prod-server-01(statis)~$ agent run", color: "#00D4FF" },
    { text: "" },
    { prefix: "[14:23:01]", text: "action_id: act-fff63a" },
    { prefix: "[14:23:01]", text: "entity:    stripe_charge" },
    { prefix: "[14:23:01]", text: "amount:    $999.00" },
    { prefix: "[14:23:01]", text: "monetary_limit:  ∅ ← fired twice", color: "#FACC15" },
    { prefix: "[14:23:01]", text: "attempted: $0.00" },
    { prefix: "[14:23:01]", text: "window_start:   now" },
    { prefix: "[14:23:01]", text: "window_end:     <NULL>" },
    { text: "" },
    { prefix: "[14:23:02]", text: "ERROR  Customer receipt status: HTTP 500", color: "#F87171" },
    { text: "" },
    { text: "prod-server-01(statis)~$ _", color: "#00D4FF" },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden h-full"
      style={{
        background: "rgba(10,10,10,0.8)",
        border: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Chrome */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
        </div>
        <span className="text-[10px] font-mono flex-1 text-center" style={{ color: "var(--text-muted)" }}>
          agent-runtime / prod
        </span>
        <span
          className="text-[9px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: "rgba(248,113,113,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}
        >
          LIVE
        </span>
      </div>

      {/* Terminal content */}
      <div className="p-5 font-mono text-[11px] leading-[1.85]">
        {lines.map((l, i) =>
          l.text === "" ? (
            <div key={i} className="h-[6px]" />
          ) : (
            <div key={i} className="flex gap-2">
              {l.prefix && (
                <span className="shrink-0" style={{ color: "var(--text-muted)" }}>
                  {l.prefix}
                </span>
              )}
              <span style={{ color: l.color ?? "var(--text-2)" }}>{l.text}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

const PROBLEMS = [
  "Agent retries charge, customer billed twice",
  "No visibility into what ran",
  "No way to stop a rogue action mid-flight",
];

const SOLUTIONS = [
  "Exactly-once execution lock",
  "SHA-256 receipt on every action",
  "Policy engine evaluates before execution",
];

export function Problem() {
  return (
    <section id="problem" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Left: terminal */}
          <SectionReveal>
            <Terminal />
          </SectionReveal>

          {/* Right: copy */}
          <SectionReveal>
            <div>
              {/* Eyebrow pill */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#00D4FF", boxShadow: "0 0 8px #00D4FF" }}
                />
                <span
                  className="text-[11px] font-mono uppercase tracking-[0.2em]"
                  style={{ color: "var(--text-2)" }}
                >
                  The Problem
                </span>
              </div>

              <h2
                className="font-bold tracking-[-0.03em] leading-[1.05]"
                style={{ fontSize: "clamp(1.8rem, 3.8vw, 2.8rem)" }}
              >
                Agents in production need a guardrail layer.
              </h2>

              <p
                className="text-[15px] leading-relaxed mt-6"
                style={{ color: "var(--text-2)" }}
              >
                Your agent just charged a customer twice. There&apos;s no receipt,
                no audit trail, no way to know which policies ran or why. You
                find out when support calls.
              </p>

              <p
                className="text-[15px] leading-relaxed mt-4"
                style={{ color: "var(--text-2)" }}
              >
                Every AI agent that touches production systems — billing, CRM,
                communication, data — needs policy evaluation before it acts
                and a tamper-evident record of what happened after.
              </p>

              {/* Two-column bullet grid: problems | solutions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-8">
                <div className="flex flex-col gap-3">
                  {PROBLEMS.map((p, i) => (
                    <div key={`p-${i}`} className="flex items-start gap-2.5 text-[13px]">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0"
                        style={{ background: "#F87171", boxShadow: "0 0 6px rgba(248,113,113,0.6)" }}
                      />
                      <span style={{ color: "var(--text-2)" }}>{p}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  {SOLUTIONS.map((s, i) => (
                    <div key={`s-${i}`} className="flex items-start gap-2.5 text-[13px]">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0"
                        style={{ background: "#00D4FF", boxShadow: "0 0 6px rgba(0,212,255,0.6)" }}
                      />
                      <span style={{ color: "var(--text)" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
