"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "../Logo";
import type { Scene } from "@/data/playground-scene";

export type StatisPhase =
  | "idle"        // dim, pre-impact
  | "armed"       // STATIS caption faded in, still dim
  | "hit"         // beam landed: crackle + scale pulse, policy card closed
  | "evaluated"   // policy card open with decision = ESCALATE
  | "approved"    // policy card shows resolved decision
  | "denied";     // policy card shows denied decision

type StatisNodeProps = {
  scene: Scene;
  phase: StatisPhase;
};

export const StatisNode = forwardRef<HTMLDivElement, StatisNodeProps>(function StatisNode(
  { scene, phase },
  ref,
) {
  const showCaption = phase !== "idle";
  const showCard = phase === "evaluated" || phase === "approved" || phase === "denied";
  const resolved = phase === "approved" || phase === "denied";
  const denied = phase === "denied";

  // "hit" triggers a one-shot crackle ring (we use phase transition as the key).
  const hit = phase === "hit" || phase === "evaluated" || resolved;

  return (
    <div ref={ref} className="relative flex w-[248px] flex-col items-center gap-4">
      {/* STATIS caption */}
      <AnimatePresence>
        {showCaption && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] uppercase font-mono"
            style={{ color: "var(--text-2)", letterSpacing: "0.32em" }}
          >
            statis · execution layer
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo + crackle ring */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={false}
        animate={
          phase === "idle"
            ? { opacity: 0.45, scale: 1 }
            : phase === "armed"
              ? { opacity: 1, scale: 1 }
              : hit
                ? { opacity: 1, scale: [1, 1.1, 1] }
                : { opacity: 1, scale: 1 }
        }
        transition={
          hit && phase !== "evaluated" && !resolved
            ? { scale: { duration: 0.6, ease: "easeOut" } }
            : { duration: 0.4 }
        }
        style={{ width: 120, height: 120 }}
      >
        {/* Expanding ring */}
        <AnimatePresence>
          {hit && (
            <motion.span
              key={`ring-${phase}`}
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid rgba(200,92,26,0.55)",
                boxShadow: "0 0 24px rgba(200,92,26,0.35)",
              }}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        <div className="relative">
          <Logo size="large" gapColor="#0a0a0b" />
        </div>
      </motion.div>

      {/* Policy check card */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full overflow-hidden"
            style={{
              borderRadius: 14,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="px-4 py-3.5">
              <div
                className="text-[9.5px] uppercase mb-2"
                style={{ color: "var(--text-2)", letterSpacing: "0.22em" }}
              >
                policy check
              </div>
              <motion.div
                className="font-mono text-[11px] leading-[1.7] space-y-0.5"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
                }}
              >
                <Row label="rule" value={scene.policy.rule} />
                <Row label="cond" value={scene.policy.condition} />
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 4 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="flex items-baseline gap-2"
                >
                  <span
                    className="w-[40px] shrink-0"
                    style={{ color: "var(--text-2)" }}
                  >
                    decn
                  </span>
                  <span className="flex items-baseline gap-1.5">
                    <GradientWord
                      text={
                        resolved
                          ? denied
                            ? scene.policy.decisionLabel
                            : scene.policy.decisionLabel
                          : scene.policy.decisionLabel
                      }
                    />
                    {resolved && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.35 }}
                        style={{ color: "var(--text-2)" }}
                      >
                        →
                      </motion.span>
                    )}
                    {resolved && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25, duration: 0.35 }}
                        className="font-semibold"
                        style={{ color: denied ? "#f87171" : "#22c55e" }}
                      >
                        {denied ? scene.policy.deniedLabel : scene.policy.resolvedLabel}
                      </motion.span>
                    )}
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 4 },
        visible: { opacity: 1, y: 0 },
      }}
      className="flex items-baseline gap-2"
    >
      <span className="w-[40px] shrink-0" style={{ color: "var(--text-2)" }}>
        {label}
      </span>
      <span style={{ color: "#e6e6e6" }}>{value}</span>
    </motion.div>
  );
}

function GradientWord({ text }: { text: string }) {
  return (
    <span
      className="font-semibold"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #c85c1a 0%, #FB923C 55%, #FED7AA 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        letterSpacing: "0.04em",
      }}
    >
      {text}
    </span>
  );
}
