"use client";

import { motion, AnimatePresence } from "framer-motion";

type ConnectorProps = {
  /** Label text inside the badge (e.g. "TRIGGERS STATIS") */
  label: string;
  /** Whether to show the connector */
  visible: boolean;
  /** Direction the line bends toward: "right" or "left" */
  bend?: "right" | "left";
};

/**
 * Vertical-ish connector line with a badge.
 * The line draws downward and bends slightly toward `bend`, then the badge pops in.
 */
export function Connector({ label, visible, bend = "right" }: ConnectorProps) {
  const translateX = bend === "right" ? 28 : -28;

  return (
    <div className="relative flex flex-col items-center py-1" style={{ minHeight: 72 }}>
      <AnimatePresence>
        {visible && (
          <>
            {/* Vertical line */}
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-[2px] flex-1"
              style={{
                minHeight: 24,
                background: "#c85c1a",
                borderRadius: 1,
                boxShadow: "0 0 10px rgba(200,92,26,0.45)",
                transformOrigin: "top",
              }}
            />

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, x: translateX }}
              animate={{ opacity: 1, scale: 1, x: translateX }}
              transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="my-1.5 whitespace-nowrap font-mono text-[9px] uppercase"
              style={{
                color: "#c85c1a",
                letterSpacing: "0.22em",
                border: "1px solid rgba(200,92,26,0.35)",
                background: "rgba(200,92,26,0.06)",
                borderRadius: 999,
                padding: "4px 12px",
                boxShadow: "0 0 16px rgba(200,92,26,0.15)",
              }}
            >
              {label}
            </motion.div>

            {/* Tail line */}
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-[2px] flex-1"
              style={{
                minHeight: 24,
                background: "#c85c1a",
                borderRadius: 1,
                boxShadow: "0 0 10px rgba(200,92,26,0.45)",
                transformOrigin: "top",
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
