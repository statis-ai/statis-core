"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentPortrait } from "./AgentPortrait";
import { useTyper } from "./useTyper";
import type { Scene } from "@/data/playground-scene";

export type AgentPhase =
  | "idle"            // dim, pre-wake
  | "awake"           // rim-light up, name plate visible, status idle
  | "working"         // task textboxes stagger in
  | "typing"          // intent typing in
  | "proposing"       // intent flash, status = proposing
  | "done";           // scene resolved

type AgentCardProps = {
  scene: Scene;
  phase: AgentPhase;
  typerKey: number;
};

const TASKS = [
  { dot: "#22c55e", text: "Reviewing refund queue..." },
  { dot: "#22c55e", text: "Found 3 pending refunds" },
  { dot: "#c85c1a", text: "ord_91bc — $18,450.00", sub: "Exceeds auto-approve limit" },
];

export const AgentCard = forwardRef<HTMLDivElement, AgentCardProps>(function AgentCard(
  { scene, phase, typerKey },
  ref,
) {
  const lines = [
    `action: ${scene.intent.action}`,
    `order:  ${scene.intent.order}`,
    `amount: ${scene.intent.amount}`,
    `reason: ${scene.intent.reason}`,
  ];
  const { doneLines, partial } = useTyper(lines, typerKey);
  const awake = phase !== "idle";
  const showTasks =
    phase === "working" || phase === "typing" || phase === "proposing" || phase === "done";
  const showIntent = phase === "typing" || phase === "proposing" || phase === "done";
  const flashIntent = phase === "proposing";
  const statusText =
    phase === "proposing" || phase === "done"
      ? scene.agent.statusDeciding
      : phase === "working"
        ? scene.agent.statusIdle
        : scene.agent.statusIdle;

  return (
    <div ref={ref} className="relative flex w-full max-w-[360px] flex-col gap-4">
      {/* Portrait card */}
      <motion.div
        initial={false}
        animate={
          awake
            ? {
                opacity: 1,
                scale: [1, 1.012, 1],
                boxShadow: [
                  "inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 rgba(200,92,26,0)",
                  "inset 0 0 0 1px rgba(200,92,26,0.35), 0 0 42px rgba(200,92,26,0.18)",
                  "inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 26px rgba(200,92,26,0.12)",
                ],
              }
            : { opacity: 0.45, scale: 1 }
        }
        transition={
          awake
            ? {
                opacity: { duration: 0.5 },
                scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                boxShadow: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              }
            : { duration: 0.4 }
        }
        className="relative overflow-hidden"
        style={{
          width: "100%",
          maxWidth: 280,
          height: 260,
          borderRadius: 16,
          background: "#0b0b0c",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <AgentPortrait
          src={scene.agent.portraitSrc}
          alt={`${scene.agent.name} portrait`}
          fallbackInitials={scene.agent.fallbackInitials}
          tone="warm"
          kind="AI AGENT"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[90px]"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,11,0.94) 0%, rgba(10,10,11,0.6) 50%, transparent 100%)",
          }}
        />
        <AnimatePresence>
          {awake && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute inset-x-0 bottom-0 px-4 pb-3.5"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] uppercase"
                  style={{ color: "var(--text-2)", letterSpacing: "0.18em" }}
                >
                  {scene.agent.role}
                </span>
              </div>
              <div
                className="mt-0.5 text-[15px] font-semibold leading-tight"
                style={{ color: "#fff" }}
              >
                {scene.agent.name}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <motion.span
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{ background: "#c85c1a" }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-[11px] font-mono" style={{ color: "var(--text-2)" }}>
                  {statusText}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Task textboxes — stagger in during "working" phase */}
      <AnimatePresence>
        {showTasks && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.4, delayChildren: 0.1 } },
            }}
            className="flex flex-col gap-2"
          >
            {TASKS.map((task, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -8, scale: 0.97 },
                  visible: { opacity: 1, x: 0, scale: 1 },
                }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-2.5 rounded-lg px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span
                  className="mt-[5px] block h-2 w-2 shrink-0 rounded-full"
                  style={{ background: task.dot }}
                />
                <div>
                  <span className="font-mono text-[11px]" style={{ color: "#e6e6e6" }}>
                    {task.text}
                  </span>
                  {task.sub && (
                    <div
                      className="mt-0.5 font-mono text-[10px]"
                      style={{ color: "#c85c1a" }}
                    >
                      {task.sub}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intent block — orange left-bar */}
      <AnimatePresence>
        {showIntent && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative pl-3"
            style={{ minHeight: 96 }}
          >
            <motion.span
              aria-hidden
              className="absolute left-0 top-0 h-full w-[2px]"
              style={{ background: "#c85c1a", borderRadius: 2 }}
              animate={
                flashIntent
                  ? {
                      boxShadow: [
                        "0 0 0 rgba(200,92,26,0)",
                        "0 0 14px rgba(200,92,26,0.7)",
                        "0 0 0 rgba(200,92,26,0)",
                      ],
                    }
                  : { boxShadow: "0 0 8px rgba(200,92,26,0.25)" }
              }
              transition={{ duration: 0.6 }}
            />
            <div
              className="text-[10px] uppercase mb-1.5"
              style={{ color: "var(--text-2)", letterSpacing: "0.22em" }}
            >
              intent
            </div>
            <motion.div
              className="font-mono text-[11.5px] leading-[1.7]"
              style={{ color: "#e6e6e6" }}
              animate={
                flashIntent ? { color: ["#e6e6e6", "#fff6e6", "#e6e6e6"] } : { color: "#e6e6e6" }
              }
              transition={{ duration: 0.6 }}
            >
              {doneLines.map((l, i) => (
                <div key={i}>
                  <TypedLine line={l} />
                </div>
              ))}
              {partial && (
                <div>
                  <TypedLine line={partial} />
                  <span
                    aria-hidden
                    className="inline-block align-text-bottom"
                    style={{
                      width: 6,
                      height: 12,
                      marginLeft: 2,
                      background: "#c85c1a",
                      animation: "pgBlink 0.9s steps(1) infinite",
                    }}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

function TypedLine({ line }: { line: string }) {
  const idx = line.indexOf(":");
  if (idx === -1) return <span>{line}</span>;
  const key = line.slice(0, idx + 1);
  const val = line.slice(idx + 1);
  return (
    <>
      <span style={{ color: "var(--text-2)" }}>{key}</span>
      <span style={{ color: "#fff6e6" }}>{val}</span>
    </>
  );
}
