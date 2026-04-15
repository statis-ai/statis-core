"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Scene } from "@/data/playground-scene";

export type PolicyPhase = "hidden" | "evaluating" | "decided";

type PolicyModalProps = {
  scene: Scene;
  phase: PolicyPhase;
};

export function PolicyModal({ scene, phase }: PolicyModalProps) {
  const visible = phase !== "hidden";
  const decided = phase === "decided";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-[340px] overflow-hidden"
          style={{
            borderRadius: 14,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="flex h-5 w-5 items-center justify-center rounded"
              style={{
                background: "linear-gradient(135deg, #c85c1a 0%, #ff8a3d 100%)",
              }}
            >
              <span className="text-[9px] font-bold text-white">S</span>
            </div>
            <span
              className="text-[10px] font-mono uppercase"
              style={{ color: "var(--text-2)", letterSpacing: "0.22em" }}
            >
              policy engine
            </span>
            <span
              className="ml-auto text-[10px] font-mono"
              style={{ color: "var(--text-2)" }}
            >
              {scene.policy.rule}
            </span>
          </div>

          {/* Checks */}
          <div className="px-4 py-3.5">
            <motion.div
              className="space-y-2.5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.45, delayChildren: 0.2 } },
              }}
            >
              {scene.policy.checks.map((check, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -6 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="flex items-center gap-2.5 font-mono text-[11px]"
                >
                  <CheckIcon pass={check.pass} />
                  <span
                    style={{
                      color: check.pass ? "#e6e6e6" : "#f87171",
                    }}
                  >
                    {check.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Decision */}
            <AnimatePresence>
              {decided && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="mt-4 flex items-center gap-2 pt-3"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    className="text-[10px] font-mono uppercase"
                    style={{ color: "var(--text-2)", letterSpacing: "0.2em" }}
                  >
                    decision
                  </span>
                  <GradientBadge text={scene.policy.decisionLabel} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CheckIcon({ pass }: { pass: boolean }) {
  if (pass) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 16 }}
        className="flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
        style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
      >
        ✓
      </motion.span>
    );
  }
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 16 }}
      className="flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
      style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}
    >
      ✕
    </motion.span>
  );
}

function GradientBadge({ text }: { text: string }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold"
      style={{
        background: "rgba(200,92,26,0.14)",
        border: "1px solid rgba(200,92,26,0.35)",
        backgroundImage:
          "linear-gradient(135deg, #c85c1a 0%, #FB923C 55%, #FED7AA 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        letterSpacing: "0.08em",
      }}
    >
      {text}
    </motion.span>
  );
}
