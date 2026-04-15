"use client";

import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/reveal";

type Token = { text: string; color: string };

function line(tokens: Token[]) {
  return tokens;
}

const C = {
  comment:   "#6B7280",
  keyword:   "#C4B5FD",
  string:    "#D4A574",
  orange:    "#E8813A",
  fn:        "#D4D4D8",
  dim:       "#A1A1AA",
  plain:     "#E4E4E7",
  key:       "#A1A1AA",
};

const CODE_LINES: Token[][] = [
  line([{ text: "from", color: C.keyword }, { text: " statis_ai ", color: C.plain }, { text: "import", color: C.keyword }, { text: " StatisClient", color: C.fn }]),
  line([]),
  line([{ text: "client", color: C.plain }, { text: " = ", color: C.dim }, { text: "StatisClient", color: C.fn }, { text: "(api_key=", color: C.plain }, { text: '"sk-statis-..."', color: C.string }, { text: ")", color: C.plain }]),
  line([]),
  line([{ text: "# Propose an action — nothing executes yet", color: C.comment }]),
  line([{ text: "action", color: C.plain }, { text: " = await ", color: C.dim }, { text: "client", color: C.plain }, { text: ".", color: C.dim }, { text: "propose", color: C.orange }, { text: "(", color: C.dim }]),
  line([{ text: "    entity_id", color: C.key }, { text: "=", color: C.dim }, { text: '"acct-8821"', color: C.string }, { text: ",", color: C.dim }]),
  line([{ text: "    action_type", color: C.key }, { text: "=", color: C.dim }, { text: '"apply_discount"', color: C.string }, { text: ",", color: C.dim }]),
  line([{ text: "    payload", color: C.key }, { text: "={", color: C.dim }, { text: '"percent"', color: C.string }, { text: ": ", color: C.dim }, { text: "15", color: C.orange }, { text: ', "reason": ', color: C.dim }, { text: '"churn_risk"', color: C.string }, { text: "},", color: C.dim }]),
  line([{ text: ")", color: C.plain }]),
  line([]),
  line([{ text: "# Policy engine evaluates. Execute if approved.", color: C.comment }]),
  line([{ text: "if", color: C.keyword }, { text: " action.status", color: C.plain }, { text: " == ", color: C.dim }, { text: '"APPROVED"', color: C.string }, { text: ":", color: C.dim }]),
  line([{ text: "    receipt", color: C.plain }, { text: " = await ", color: C.dim }, { text: "action", color: C.plain }, { text: ".", color: C.dim }, { text: "execute", color: C.orange }, { text: "()", color: C.plain }]),
  line([{ text: "    ", color: C.plain }, { text: "print", color: C.fn }, { text: "(receipt.id)", color: C.plain }, { text: "  # sha256:a3f29c...", color: C.comment }]),
];

export function CodeSnippetSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <Reveal>
            <div>
              <div className="mb-4">
                <SectionEyebrow variant="accent">SDK</SectionEyebrow>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-4">
                Three lines to<br />
                governed execution.
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>
                Propose an action. The policy engine evaluates it against your rules.
                Execute with an exactly-once guarantee. Every outcome gets a tamper-evident receipt.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { step: "01", label: "pip install statis-ai" },
                  { step: "02", label: "Set STATIS_API_KEY" },
                  { step: "03", label: "propose → execute" },
                ].map(({ step, label }) => (
                  <div key={step} className="flex items-center gap-4">
                    <span className="text-[10px] font-mono font-bold w-6 shrink-0" style={{ color: "var(--orange)" }}>{step}</span>
                    <span className="text-xs font-mono" style={{ color: "var(--text-2)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right: code block */}
          <Reveal delay={0.1}>
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "#0C0C0F",
                border: "1px solid rgba(255,255,255,0.08)",
                borderTop: "1px solid rgba(249,115,22,0.30)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.15), 0 0 60px rgba(249,115,22,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: "#111114", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#5C2020" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#5C5020" }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#205C20" }} />
                </div>
                <span className="text-[9px] font-mono flex-1 text-center" style={{ color: "#71717A" }}>agent.py — python3</span>
              </div>

              <div className="px-4 pt-3 pb-1 font-mono text-[10px]" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: "#71717A" }}>~/projects/my-agent </span>
                <span style={{ color: "#E8813A" }}>❯ </span>
                <span style={{ color: "#A1A1AA" }}>python3 agent.py</span>
              </div>

              <pre className="text-[11px] leading-[1.8] overflow-x-auto flex font-mono">
                <div className="select-none py-4 pl-3 pr-3 text-right" style={{ color: "#3F3F46", borderRight: "1px solid rgba(255,255,255,0.06)", minWidth: "2.5rem" }}>
                  {CODE_LINES.map((_, li) => (
                    <div key={li}>{li + 1}</div>
                  ))}
                </div>
                <div className="py-4 pl-4 flex-1">
                  {CODE_LINES.map((tokens, li) => (
                    <div key={li}>
                      {tokens.length === 0 ? (
                        <span>&nbsp;</span>
                      ) : (
                        tokens.map((tok, ti) => (
                          <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
                        ))
                      )}
                    </div>
                  ))}
                  <div className="mt-1">
                    <span style={{ color: "#E8813A" }}>❯ </span>
                    <span className="terminal-cursor" style={{ display: "inline-block", width: "7px", height: "13px", background: "#E8813A", verticalAlign: "middle", marginBottom: "1px" }} />
                  </div>
                </div>
              </pre>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
