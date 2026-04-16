"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CopyCommand } from "@/components/ui/CopyCommand";
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
  [{ text: "from", color: C.keyword }, { text: " statis_kit ", color: C.plain }, { text: "import", color: C.keyword }, { text: " process", color: C.fn }],
  [],
  [
    { text: "result", color: C.plain },
    { text: " = ", color: C.dim },
    { text: "process", color: C.accent },
    { text: "(messages, config={", color: C.plain },
    { text: '"pin_top"', color: C.string },
    { text: ": [", color: C.dim },
    { text: '"system"', color: C.string },
    { text: "], ", color: C.dim },
    { text: '"recent_turns"', color: C.string },
    { text: ": ", color: C.dim },
    { text: "2", color: C.accent },
    { text: "})", color: C.plain },
  ],
  [
    { text: "print", color: C.fn },
    { text: "(result.report.token_delta, result.report.cost_estimate)", color: C.plain },
  ],
  [],
  [{ text: "# -3,400 tokens. $0.018 saved per call. Zero refactor.", color: C.comment }],
];

export function OpenSource() {
  return (
    <Section id="open-source">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy + install */}
        <SectionReveal>
          <div>
            <Eyebrow>Context Kit · MIT</Eyebrow>
            <h2
              className="font-bold tracking-[-0.025em] mt-5 mb-5"
              style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", lineHeight: 1.05 }}
            >
              Free. Local.<br />
              <span
                style={{
                  backgroundImage: "linear-gradient(90deg, #00D4FF 0%, #8E99F0 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Five lines of Python.
              </span>
            </h2>
            <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--text-2)" }}>
              Statis Context Kit is the open-source compressor, cost meter, and pattern guard
              behind Statis. No account. No network call. Run it in your agent loop and keep
              the receipts.
            </p>

            <div className="mb-6">
              <CopyCommand command="pip install statis-kit" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[13px]">
              <Link
                href="/debug"
                className="group inline-flex items-center gap-1.5 font-medium transition-colors"
                style={{ color: "#00D4FF" }}
              >
                Try it without installing
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="https://github.com/statis-ai/statis-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-medium transition-colors"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                Star on GitHub
              </a>
            </div>
          </div>
        </SectionReveal>

        {/* Right: code */}
        <SectionReveal delay={0.1}>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#333" }} />
              </div>
              <span
                className="text-[10px] font-mono flex-1 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                quickstart.py
              </span>
            </div>
            <pre className="text-[12px] leading-[1.8] overflow-x-auto flex font-mono">
              <div
                className="select-none py-5 pl-3 pr-3 text-right"
                style={{ color: "#333", borderRight: "1px solid var(--border)", minWidth: "2.5rem" }}
              >
                {CODE_LINES.map((_, li) => (
                  <div key={li}>{li + 1}</div>
                ))}
              </div>
              <div className="py-5 pl-4 flex-1">
                {CODE_LINES.map((tokens, li) => (
                  <div key={li}>
                    {tokens.length === 0 ? (
                      <span>&nbsp;</span>
                    ) : (
                      tokens.map((tok, ti) => (
                        <span key={ti} style={{ color: tok.color }}>
                          {tok.text}
                        </span>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </pre>
          </div>
        </SectionReveal>
      </div>
    </Section>
  );
}
