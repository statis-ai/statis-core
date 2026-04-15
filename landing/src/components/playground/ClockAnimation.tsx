"use client";

import { motion, AnimatePresence } from "framer-motion";

type ClockPhase = "hidden" | "ticking" | "triggered";

type ClockAnimationProps = {
  phase: ClockPhase;
};

/**
 * SVG clock face with animated hands.
 * Hands animate from 12:00 → 6:00 over ~1.5s, then a pulse ring + timestamp.
 */
export function ClockAnimation({ phase }: ClockAnimationProps) {
  const visible = phase !== "hidden";
  const triggered = phase === "triggered";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
            {/* Triggered pulse ring */}
            {triggered && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  border: "2px solid rgba(200,92,26,0.55)",
                  boxShadow: "0 0 28px rgba(200,92,26,0.35)",
                }}
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.0, ease: "easeOut" }}
              />
            )}

            <svg
              width={72}
              height={72}
              viewBox="0 0 80 80"
              fill="none"
              className="relative"
            >
              {/* Clock face */}
              <circle
                cx={40}
                cy={40}
                r={36}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1.5}
                fill="rgba(255,255,255,0.02)"
              />

              {/* 12 tick marks */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const major = i % 3 === 0;
                const innerR = major ? 29 : 31;
                const outerR = 34;
                return (
                  <line
                    key={i}
                    x1={40 + Math.sin(angle) * innerR}
                    y1={40 - Math.cos(angle) * innerR}
                    x2={40 + Math.sin(angle) * outerR}
                    y2={40 - Math.cos(angle) * outerR}
                    stroke={major ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)"}
                    strokeWidth={major ? 1.5 : 0.8}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Hour hand — rotates 12:00 → 6:00 (0deg → 180deg) */}
              <motion.line
                x1={40}
                y1={40}
                x2={40}
                y2={20}
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                style={{ transformOrigin: "40px 40px" }}
                initial={{ rotate: 0 }}
                animate={{ rotate: 180 }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
              />

              {/* Minute hand — full 360 turn */}
              <motion.line
                x1={40}
                y1={40}
                x2={40}
                y2={14}
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={1.2}
                strokeLinecap="round"
                style={{ transformOrigin: "40px 40px" }}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
              />

              {/* Center dot */}
              <circle cx={40} cy={40} r={2.5} fill="#c85c1a" />
            </svg>
          </div>

          {/* Timestamp text */}
          <AnimatePresence>
            {triggered && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-col items-center gap-0.5"
              >
                <span
                  className="font-mono text-[13px] font-semibold"
                  style={{ color: "#c85c1a" }}
                >
                  06:00
                </span>
                <span
                  className="font-mono text-[10px] uppercase"
                  style={{ color: "var(--text-2)", letterSpacing: "0.22em" }}
                >
                  scheduled run triggered
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
