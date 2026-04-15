"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Scene } from "@/data/playground-scene";

export type NotificationPhase =
  | "hidden"
  | "slide-in"
  | "awaiting"   // glow buttons, timeline paused
  | "approved"
  | "denied";

type NotificationProps = {
  scene: Scene;
  phase: NotificationPhase;
  onApprove: () => void;
  onDeny: () => void;
};

export const Notification = forwardRef<HTMLDivElement, NotificationProps>(function Notification(
  { scene, phase, onApprove, onDeny },
  ref,
) {
  const visible = phase !== "hidden";
  const interactive = phase === "awaiting";
  const resolved = phase === "approved" || phase === "denied";
  const denied = phase === "denied";

  return (
    <div ref={ref} className="relative w-[320px]">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: 32, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative overflow-hidden"
            style={{
              borderRadius: 14,
              background: "#0b0b0c",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Left accent bar */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-[3px]"
              style={{
                background: "#c85c1a",
                boxShadow: "0 0 12px rgba(200,92,26,0.5)",
              }}
            />

            {/* Resolved ring flash */}
            <AnimatePresence>
              {resolved && (
                <motion.div
                  key={phase}
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0.55 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  style={{
                    boxShadow: denied
                      ? "inset 0 0 0 2px rgba(248,113,113,0.8), 0 0 38px rgba(248,113,113,0.35)"
                      : "inset 0 0 0 2px rgba(34,197,94,0.8), 0 0 38px rgba(34,197,94,0.35)",
                    borderRadius: 14,
                  }}
                />
              )}
            </AnimatePresence>

            <div className="pl-5 pr-4 py-4">
              <div
                className="text-[9.5px] font-mono uppercase"
                style={{ color: "#c85c1a", letterSpacing: "0.22em" }}
              >
                {scene.notification.header}
              </div>
              <div
                className="mt-2 font-mono text-[12px] leading-[1.55]"
                style={{ color: "#e6e6e6" }}
              >
                {scene.notification.body}
              </div>

              {/* Buttons or resolved state */}
              <div className="mt-3.5 flex items-center gap-2.5">
                {!resolved ? (
                  <>
                    <GlowButton
                      label="Approve"
                      primary
                      glowing={interactive}
                      disabled={!interactive}
                      onClick={onApprove}
                    />
                    <GlowButton
                      label="Deny"
                      glowing={interactive}
                      disabled={!interactive}
                      onClick={onDeny}
                    />
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="font-mono text-[11px]"
                    style={{
                      color: denied ? "#f87171" : "#22c55e",
                    }}
                  >
                    {denied ? "denied by you" : "approved by you"}{" "}
                    <span style={{ color: "var(--text-2)" }}>· 02:14:35</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "your move" caption */}
      <AnimatePresence>
        {interactive && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: [0, 1, 1, 0.6], y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, times: [0, 0.2, 0.7, 1] }}
            className="absolute -top-5 left-5 text-[9px] uppercase font-mono"
            style={{ color: "#c85c1a", letterSpacing: "0.22em" }}
          >
            your move
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

function GlowButton({
  label,
  primary,
  glowing,
  disabled,
  onClick,
}: {
  label: string;
  primary?: boolean;
  glowing: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      animate={
        glowing
          ? {
              boxShadow: primary
                ? [
                    "0 0 0 rgba(200,92,26,0)",
                    "0 0 22px rgba(200,92,26,0.55)",
                    "0 0 0 rgba(200,92,26,0)",
                  ]
                : [
                    "0 0 0 rgba(200,92,26,0)",
                    "0 0 14px rgba(200,92,26,0.3)",
                    "0 0 0 rgba(200,92,26,0)",
                  ],
            }
          : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
      }
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      className="px-3.5 py-1.5 rounded-md font-mono text-[11px] transition-colors disabled:cursor-default"
      style={
        primary
          ? {
              background: "#c85c1a",
              color: "#fff6e6",
              border: "1px solid rgba(255,255,255,0.1)",
            }
          : {
              background: "transparent",
              color: "#e6e6e6",
              border: "1px solid rgba(255,255,255,0.18)",
            }
      }
    >
      {label}
    </motion.button>
  );
}
