"use client";

import { CopyCommand } from "@/components/ui/CopyCommand";
import { SectionReveal } from "./shared";

export function CTA() {
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
            Wire your agent into the trust layer<br />in five minutes.
          </h2>
          <p className="text-[16px] mb-10 max-w-lg mx-auto" style={{ color: "var(--text-2)" }}>
            Install Context Kit. See what your agent actually costs. Graduate to Developer
            Cloud when you need policy, approvals, and a hash-chain audit log.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <a
              href="/pricing"
              className="px-7 py-3 rounded-full text-[14px] font-medium transition-all"
              style={{ background: "#EDEDED", color: "#000000" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#EDEDED"; e.currentTarget.style.boxShadow = "none"; }}
            >
              See pricing
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

          <div className="flex items-center justify-center">
            <CopyCommand command="pip install statis-kit" />
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
