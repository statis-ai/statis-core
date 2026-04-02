"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="min-h-screen flex items-center">
      <div className="mx-auto w-full max-w-5xl px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p
            className="text-[10px] uppercase tracking-[0.25em] mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            Agent Execution Infrastructure
          </p>

          <h1
            className="font-bold leading-[1.1] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}
          >
            The execution layer<br />
            for production<br />
            AI agents.
          </h1>

          <p
            className="text-sm leading-relaxed max-w-md mx-auto mb-8"
            style={{ color: "var(--text-2)" }}
          >
            Policy before every action. Exactly-once execution
            guarantee. SHA-256 receipt on every outcome.
          </p>

          <div
            className="flex items-center justify-center gap-2 text-xs mb-12"
            style={{ color: "var(--text-muted)" }}
          >
            {["Propose", "Evaluate", "Execute \u00d71", "Receipt"].map((s, i, a) => (
              <span key={s} className="flex items-center gap-2">
                <span>{s}</span>
                {i < a.length - 1 && <span style={{ color: "#262626" }}>{"\u2192"}</span>}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
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
              Learn how it works {"\u2192"}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
