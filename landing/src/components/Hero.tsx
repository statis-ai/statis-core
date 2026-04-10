"use client";

import { motion } from "framer-motion";
import { KbdPill } from "./ui/KbdPill";
import { SectionEyebrow } from "./ui/SectionEyebrow";

export function Hero() {
  return (
    <section className="min-h-screen flex items-center">
      <div className="mx-auto w-full max-w-5xl px-6 pt-16 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto text-center"
          style={{ position: "relative" }}
        >
          {/* Ambient orange glow — subtle, just enough warmth */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -60%)",
              width: "680px",
              height: "320px",
              background:
                "radial-gradient(ellipse at center, rgba(200,92,26,0.055) 0%, transparent 70%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          <div className="mb-6" style={{ position: "relative", zIndex: 1 }}>
            <SectionEyebrow align="center" variant="accent">
              Agent Execution Infrastructure
            </SectionEyebrow>
          </div>

          <h1
            className="font-bold leading-[1.05] tracking-[-0.025em] mb-6"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)", position: "relative", zIndex: 1 }}
          >
            The{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #c85c1a 0%, #FB923C 55%, #FED7AA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              execution layer
            </span>
            <br />
            for production
            <br />
            AI agents.
          </h1>

          <p
            className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-7"
            style={{ color: "var(--text-2)", position: "relative", zIndex: 1 }}
          >
            Policy before every action. Exactly-once execution
            guarantee. SHA-256 receipt on every outcome.
          </p>

          <div
            className="flex items-center justify-center gap-2 text-xs mb-10"
            style={{ color: "var(--text-muted)", position: "relative", zIndex: 1 }}
          >
            {["Propose", "Evaluate", "Execute \u00d71", "Receipt"].map((s, i, a) => (
              <span key={s} className="flex items-center gap-2">
                <span style={s === "Execute \u00d71" ? { color: "var(--orange)" } : undefined}>{s}</span>
                {i < a.length - 1 && <span style={{ color: "var(--orange-glow)" }}>{"\u2192"}</span>}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4" style={{ position: "relative", zIndex: 1 }}>
            <a
              href="https://console.statis.dev/auth?mode=signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-5 py-2.5 rounded font-medium"
              style={{
                background: "transparent",
                border: "1px solid var(--orange)",
                color: "var(--orange)",
                boxShadow: "0 0 20px rgba(200,92,26,0.15)",
                transition: "box-shadow 0.2s, background 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(200,92,26,0.08)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(200,92,26,0.25)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(200,92,26,0.15)";
              }}
            >
              Get Started Free
            </a>

            <div
              className="inline-flex items-center gap-2 text-xs px-4 py-2.5 rounded"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ color: "#555" }}>$</span>
              <span style={{ color: "var(--text)" }}>pip install statis-ai</span>
            </div>

            <a
              href="https://docs.statis.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="link text-xs px-4 py-2.5 rounded"
              style={{ border: "1px solid var(--border)" }}
            >
              Read the docs {"\u2192"}
            </a>
          </div>

          {/* Trust line */}
          <p className="text-[10px]" style={{ color: "var(--text-muted)", position: "relative", zIndex: 1 }}>
            Free to start &middot; No credit card required &middot; Self-hostable
          </p>

          {/* Keyboard hint */}
          <p
            className="inline-flex items-center gap-2 text-[11px] mt-8"
            style={{ color: "var(--text-muted)", position: "relative", zIndex: 1 }}
          >
            Press <KbdPill>⌘</KbdPill><KbdPill>K</KbdPill> to search docs
          </p>
        </motion.div>
      </div>
    </section>
  );
}
