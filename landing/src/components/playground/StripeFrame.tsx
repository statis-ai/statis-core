"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Scene } from "@/data/playground-scene";

type StripePhase = "hidden" | "receiving" | "processing" | "done";

type StripeFrameProps = {
  scene: Scene;
  phase: StripePhase;
};

export function StripeFrame({ scene, phase }: StripeFrameProps) {
  const visible = phase !== "hidden";
  const processing = phase === "processing" || phase === "done";
  const done = phase === "done";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-6"
        >
          {/* Stripe logomark */}
          <motion.div
            className="relative flex items-center justify-center"
            style={{ width: 100, height: 100 }}
            animate={
              processing && !done
                ? {
                    boxShadow: [
                      "0 0 0 rgba(99,91,255,0)",
                      "0 0 48px rgba(99,91,255,0.3)",
                      "0 0 0 rgba(99,91,255,0)",
                    ],
                  }
                : done
                  ? {
                      boxShadow:
                        "0 0 36px rgba(34,197,94,0.18)",
                    }
                  : {}
            }
            transition={{ duration: 1.6, repeat: done ? 0 : Infinity, ease: "easeInOut" }}
          >
            {/* Stripe "S" mark */}
            <div
              className="flex h-full w-full items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #635bff 0%, #7a73ff 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <svg width={48} height={48} viewBox="0 0 48 48" fill="none">
                <path
                  d="M22 14c-3.3 0-5.8 1.5-5.8 4.3 0 3.6 5.4 4.3 5.4 6.5 0 .9-.8 1.4-2 1.4-1.8 0-4-1-5.6-2.2v5c1.6.8 3.6 1.4 5.6 1.4 3.4 0 6-1.5 6-4.4 0-3.8-5.4-4.5-5.4-6.5 0-.8.7-1.3 1.8-1.3 1.5 0 3.5.7 5 1.7v-4.8a13 13 0 0 0-5-1.1z"
                  fill="#fff"
                />
              </svg>
            </div>
          </motion.div>

          {/* Name */}
          <div
            className="text-[11px] font-mono uppercase"
            style={{ color: "var(--text-2)", letterSpacing: "0.28em" }}
          >
            {scene.adapter.name}
          </div>

          {/* Status */}
          <div className="flex flex-col items-center gap-1.5">
            <AnimatePresence mode="wait">
              {processing && !done && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="font-mono text-[11px]"
                  style={{ color: "#635bff" }}
                >
                  processing refund...
                </motion.div>
              )}
              {done && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className="font-mono text-[12px] font-semibold"
                    style={{ color: "#22c55e" }}
                  >
                    {scene.adapter.ackLabel}
                  </span>
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: "var(--text-2)" }}
                  >
                    {scene.adapter.txId}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
