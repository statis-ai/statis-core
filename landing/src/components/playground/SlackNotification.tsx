"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Scene } from "@/data/playground-scene";

type SlackPhase = "hidden" | "slide-in" | "awaiting" | "approved" | "denied";

type SlackNotificationProps = {
  scene: Scene;
  phase: SlackPhase;
  onApprove: () => void;
  onDeny: () => void;
};

export function SlackNotification({
  scene,
  phase,
  onApprove,
  onDeny,
}: SlackNotificationProps) {
  const visible = phase !== "hidden";
  const interactive = phase === "awaiting";
  const resolved = phase === "approved" || phase === "denied";
  const denied = phase === "denied";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="relative w-[340px] overflow-hidden"
          style={{
            borderRadius: 12,
            background: "#1a1d21",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4)",
          }}
        >
          {/* Resolved flash ring */}
          <AnimatePresence>
            {resolved && (
              <motion.div
                key={phase}
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                style={{
                  boxShadow: denied
                    ? "inset 0 0 0 2px rgba(248,113,113,0.8), 0 0 38px rgba(248,113,113,0.3)"
                    : "inset 0 0 0 2px rgba(34,197,94,0.8), 0 0 38px rgba(34,197,94,0.3)",
                  borderRadius: 12,
                }}
              />
            )}
          </AnimatePresence>

          {/* Slack header */}
          <div
            className="flex items-center gap-2 px-3.5 py-2.5"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Slack icon (simplified hash) */}
            <span
              className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold"
              style={{
                background: "#611f69",
                color: "#fff",
              }}
            >
              #
            </span>
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--text-2)" }}
            >
              {scene.slack.channel}
            </span>
            <span
              className="ml-auto text-[9px] font-mono"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {scene.slack.workspace}
            </span>
          </div>

          {/* Message body */}
          <div className="px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              {/* Sender avatar — Statis mark (small) */}
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded"
                style={{
                  background: "linear-gradient(135deg, #c85c1a 0%, #ff8a3d 100%)",
                }}
              >
                <span className="text-[10px] font-bold text-white">S</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: "#fff" }}
                  >
                    {scene.slack.sender}
                  </span>
                  <span
                    className="rounded bg-[#1d9bd1] px-1 py-[1px] text-[9px] font-mono uppercase"
                    style={{ color: "#fff", letterSpacing: "0.08em" }}
                  >
                    APP
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    just now
                  </span>
                </div>
                <div
                  className="mt-1.5 text-[12px] leading-[1.55]"
                  style={{ color: "#d1d2d3" }}
                >
                  {scene.slack.body}
                </div>

                {/* Action buttons or resolved */}
                <div className="mt-3 flex items-center gap-2">
                  {!resolved ? (
                    <>
                      <SlackButton
                        label="Approve"
                        variant="primary"
                        glowing={interactive}
                        disabled={!interactive}
                        onClick={onApprove}
                      />
                      <SlackButton
                        label="Deny"
                        variant="outline"
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
                      className="flex items-center gap-2 font-mono text-[11px]"
                      style={{ color: denied ? "#f87171" : "#22c55e" }}
                    >
                      <span>
                        {denied ? "✕ denied" : "✓ approved"} by{" "}
                        {scene.human.name.split(" ")[0]}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>
                        · 02:14:35
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SlackButton({
  label,
  variant,
  glowing,
  disabled,
  onClick,
}: {
  label: string;
  variant: "primary" | "outline";
  glowing: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const primary = variant === "primary";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      animate={
        glowing && !disabled
          ? {
              boxShadow: primary
                ? [
                    "0 0 0 rgba(29,155,209,0)",
                    "0 0 16px rgba(29,155,209,0.5)",
                    "0 0 0 rgba(29,155,209,0)",
                  ]
                : [
                    "0 0 0 rgba(255,255,255,0)",
                    "0 0 10px rgba(255,255,255,0.12)",
                    "0 0 0 rgba(255,255,255,0)",
                  ],
            }
          : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
      }
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      className="rounded px-3 py-1.5 text-[11px] font-mono transition-colors disabled:cursor-default"
      style={
        primary
          ? {
              background: "#1d9bd1",
              color: "#fff",
              border: "none",
            }
          : {
              background: "transparent",
              color: "#d1d2d3",
              border: "1px solid rgba(255,255,255,0.18)",
            }
      }
    >
      {label}
    </motion.button>
  );
}
