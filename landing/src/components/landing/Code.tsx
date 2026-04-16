"use client";

import { useState, useEffect, useRef } from "react";
import { Section, Eyebrow, SectionReveal } from "./shared";

type Token = { text: string; color: string };

const C = {
  keyword: "#C4B5FD",
  string: "#D4A574",
  accent: "#00D4FF",
  fn: "#D4D4D8",
  dim: "#666666",
  plain: "#E4E4E7",
  comment: "#555555",
};

const CODE_LINES: Token[][] = [
  [{ text: "from", color: C.keyword }, { text: " statis ", color: C.plain }, { text: "import", color: C.keyword }, { text: " StatisClient", color: C.fn }],
  [],
  [{ text: "client", color: C.plain }, { text: " = ", color: C.dim }, { text: "StatisClient", color: C.fn }, { text: "(api_key=", color: C.plain }, { text: '"sk-statis-..."', color: C.string }, { text: ")", color: C.plain }],
  [],
  [{ text: "# Propose an action — nothing executes yet", color: C.comment }],
  [{ text: "action", color: C.plain }, { text: " = await ", color: C.dim }, { text: "client", color: C.plain }, { text: ".", color: C.dim }, { text: "propose", color: C.accent }, { text: "(", color: C.dim }],
  [{ text: '    entity_id', color: C.dim }, { text: "=", color: C.dim }, { text: '"acct-8821"', color: C.string }, { text: ",", color: C.dim }],
  [{ text: '    action_type', color: C.dim }, { text: "=", color: C.dim }, { text: '"apply_discount"', color: C.string }, { text: ",", color: C.dim }],
  [{ text: '    payload', color: C.dim }, { text: "={", color: C.dim }, { text: '"percent"', color: C.string }, { text: ": ", color: C.dim }, { text: "15", color: C.accent }, { text: ', "reason": ', color: C.dim }, { text: '"churn_risk"', color: C.string }, { text: "},", color: C.dim }],
  [{ text: ")", color: C.plain }],
  [],
  [{ text: "# Policy engine evaluates. Execute if approved.", color: C.comment }],
  [{ text: "if", color: C.keyword }, { text: " action.status", color: C.plain }, { text: " == ", color: C.dim }, { text: '"APPROVED"', color: C.string }, { text: ":", color: C.dim }],
  [{ text: "    receipt", color: C.plain }, { text: " = await ", color: C.dim }, { text: "action", color: C.plain }, { text: ".", color: C.dim }, { text: "execute", color: C.accent }, { text: "()", color: C.plain }],
  [{ text: "    ", color: C.plain }, { text: "print", color: C.fn }, { text: "(receipt.id)", color: C.plain }, { text: "  # sha256:a3f29c...", color: C.comment }],
];

const STEPS = [
  { num: "01", label: "pip install statis" },
  { num: "02", label: "Set STATIS_API_KEY" },
  { num: "03", label: "propose \u2192 execute" },
];

export function Code() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (visibleLines >= CODE_LINES.length) return;
    const timeout = setTimeout(() => {
      setVisibleLines((v) => v + 1);
    }, 80);
    return () => clearTimeout(timeout);
  }, [started, visibleLines]);

  return (
    <Section>
      <div ref={sectionRef} className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <SectionReveal>
          <div>
            <Eyebrow>SDK</Eyebrow>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-4 mb-4">
              Three lines to<br />an authorized action.
            </h2>
            <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--text-2)" }}>
              Propose an action. The policy engine evaluates it against your rules. Execute
              once, with a hash-chained receipt for every outcome.
            </p>
            <div className="flex flex-col gap-3">
              {STEPS.map(({ num, label }) => (
                <div key={num} className="flex items-center gap-4">
                  <span className="text-[11px] font-mono font-bold" style={{ color: "var(--accent)" }}>{num}</span>
                  <span className="text-[13px] font-mono" style={{ color: "var(--text-2)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* Right: code block */}
        <SectionReveal delay={0.1}>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Chrome bar */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
              </div>
              <span className="text-[10px] font-mono flex-1 text-center" style={{ color: "var(--text-muted)" }}>
                agent.py
              </span>
            </div>

            {/* Code */}
            <pre className="text-[11px] leading-[1.8] overflow-x-auto flex font-mono">
              <div className="select-none py-4 pl-3 pr-3 text-right" style={{ color: "#333", borderRight: "1px solid var(--border)", minWidth: "2.5rem" }}>
                {CODE_LINES.map((_, li) => (
                  <div key={li} style={{ opacity: li < visibleLines ? 1 : 0 }}>{li + 1}</div>
                ))}
              </div>
              <div className="py-4 pl-4 flex-1">
                {CODE_LINES.map((tokens, li) => (
                  <div key={li} style={{ opacity: li < visibleLines ? 1 : 0, transition: "opacity 0.15s" }}>
                    {tokens.length === 0 ? (
                      <span>&nbsp;</span>
                    ) : (
                      tokens.map((tok, ti) => (
                        <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
                      ))
                    )}
                  </div>
                ))}
                {visibleLines >= CODE_LINES.length && (
                  <div className="mt-1">
                    <span style={{ color: "var(--text-muted)" }}>$ </span>
                    <span
                      className="inline-block w-[7px] h-[14px]"
                      style={{ background: "var(--accent)", opacity: 0.7, animation: "blink 1s step-start infinite" }}
                    />
                  </div>
                )}
              </div>
            </pre>
          </div>
        </SectionReveal>
      </div>
    </Section>
  );
}
