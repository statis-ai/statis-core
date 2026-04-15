"use client";

import { useState } from "react";
import { SectionReveal } from "./shared";

export function CTA() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("pip install statis-ai");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      {/* Gradient glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,60,120,0.15) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 text-center">
        <SectionReveal>
          <h2
            className="font-bold tracking-[-0.03em] mb-6"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            Ship your first governed action<br />in 5 minutes.
          </h2>
          <p className="text-[16px] mb-10 max-w-lg mx-auto" style={{ color: "var(--text-2)" }}>
            Install the SDK, set your API key, propose an action. That&apos;s it.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <a
              href="https://www.surveymonkey.com/r/GVKH2KR"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3 rounded-full text-[14px] font-medium transition-all"
              style={{ background: "#EDEDED", color: "#000000" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#EDEDED"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Start Building
            </a>
            <a
              href="https://docs.statis.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3 rounded-full text-[14px] font-medium transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "var(--text)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              Documentation
            </a>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] font-mono transition-all cursor-pointer"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>$</span>
            <span>pip install statis-ai</span>
            <span className="ml-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
        </SectionReveal>
      </div>
    </section>
  );
}
