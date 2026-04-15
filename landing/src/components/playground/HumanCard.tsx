"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AgentPortrait } from "./AgentPortrait";
import type { Scene } from "@/data/playground-scene";

export type HumanPhase = "hidden" | "entering" | "idle" | "notified" | "decided";

type HumanCardProps = {
  scene: Scene;
  phase: HumanPhase;
};

export function HumanCard({ scene, phase }: HumanCardProps) {
  const visible = phase !== "hidden";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center"
        >
          {/* Portrait card */}
          <motion.div
            initial={false}
            animate={
              phase === "notified"
                ? {
                    boxShadow: [
                      "inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 rgba(108,122,255,0)",
                      "inset 0 0 0 1px rgba(108,122,255,0.35), 0 0 42px rgba(108,122,255,0.16)",
                      "inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 22px rgba(108,122,255,0.1)",
                    ],
                  }
                : phase === "decided"
                  ? {
                      boxShadow:
                        "inset 0 0 0 1px rgba(34,197,94,0.35), 0 0 34px rgba(34,197,94,0.12)",
                    }
                  : {}
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative overflow-hidden"
            style={{
              width: 200,
              height: 240,
              borderRadius: 16,
              background: "#0b0b0c",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <AgentPortrait
              src={scene.human.portraitSrc}
              alt={`${scene.human.name} portrait`}
              fallbackInitials={scene.human.fallbackInitials}
              tone="cool"
              kind="HUMAN"
            />
            {/* Name plate at bottom */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[80px]"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,10,11,0.95) 0%, rgba(10,10,11,0.6) 55%, transparent 100%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3">
              <div
                className="text-[14px] font-semibold leading-tight"
                style={{ color: "#fff" }}
              >
                {scene.human.name}
              </div>
              <div
                className="mt-0.5 text-[10px] font-mono uppercase"
                style={{ color: "var(--text-2)", letterSpacing: "0.18em" }}
              >
                {scene.human.role}
              </div>
              <div
                className="mt-1 flex items-center gap-1.5 text-[10px] font-mono"
                style={{ color: "var(--text-2)" }}
              >
                <span
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{ background: "#22c55e" }}
                />
                {scene.human.oncall}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
