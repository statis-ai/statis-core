"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Scene } from "@/data/playground-scene";

type ReceiptModalProps = {
  scene: Scene;
  visible: boolean;
  denied?: boolean;
  onReplay: () => void;
};

export function ReceiptModal({ scene, visible, denied = false, onReplay }: ReceiptModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Receipt card */}
          <motion.div
            className="relative w-[380px] overflow-hidden"
            style={{
              borderRadius: 16,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.3)",
            }}
          >
            {/* Stamp / seal */}
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.35 }}
              className="absolute -right-1 -top-1 z-10 flex h-16 w-16 items-center justify-center rounded-bl-2xl"
              style={{
                background: denied
                  ? "rgba(248,113,113,0.12)"
                  : "rgba(34,197,94,0.12)",
              }}
            >
              <span
                className="text-[18px] font-mono font-bold"
                style={{ color: denied ? "#f87171" : "#22c55e" }}
              >
                {denied ? "✕" : "✓"}
              </span>
            </motion.div>

            {/* Top accent bar */}
            <div
              aria-hidden
              className="h-[3px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, #c85c1a 0%, #ff8a3d 40%, #fff6e6 60%, #ff8a3d 80%, #c85c1a 100%)",
                boxShadow: "0 0 16px rgba(200,92,26,0.45)",
              }}
            />

            <div className="px-5 py-5">
              {/* Title */}
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded"
                  style={{
                    background:
                      "linear-gradient(135deg, #c85c1a 0%, #ff8a3d 100%)",
                  }}
                >
                  <span className="text-[10px] font-bold text-white">S</span>
                </div>
                <span
                  className="text-[10px] font-mono uppercase"
                  style={{ color: "var(--text-2)", letterSpacing: "0.28em" }}
                >
                  tamper-evident receipt
                </span>
              </div>

              {/* Key-value rows */}
              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
                  },
                }}
              >
                <KV label="receipt_id" value={scene.receipt.id} />
                <KV label="outcome" value={scene.receipt.outcome} />
                <KV
                  label="decided_by"
                  value={
                    denied
                      ? `${scene.human.name} · denied`
                      : `${scene.human.name} · approved`
                  }
                  valueColor={denied ? "#f87171" : "#22c55e"}
                />
                <KV label="executed_at" value={scene.receipt.executedAt} />
                <KV label="sha256" value={scene.receipt.sha256} mono />
              </motion.div>
            </div>

            {/* Bottom — on ledger */}
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                className="block h-1.5 w-1.5 rounded-full"
                style={{ background: "#c85c1a" }}
              />
              <span
                className="text-[9px] font-mono uppercase"
                style={{ color: "var(--text-2)", letterSpacing: "0.22em" }}
              >
                on ledger · immutable
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            transition={{ duration: 0.65, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="font-bold leading-[1.1] text-center"
            style={{
              fontSize: "clamp(1.4rem, 2.4vw, 2rem)",
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            {scene.headline.prefix}
            <span
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #c85c1a 0%, #FB923C 55%, #FED7AA 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {denied ? scene.headline.deniedAccent : scene.headline.accent}
            </span>
            {scene.headline.suffix}
          </motion.h2>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <button
              type="button"
              onClick={onReplay}
              className="font-mono text-[11px] uppercase transition-colors"
              style={{
                color: "var(--text-2)",
                letterSpacing: "0.22em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-2)")
              }
            >
              ↻  replay
            </button>
            <a
              href="https://console.statis.dev/auth?mode=signup"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase px-4 py-2 rounded transition-all"
              style={{
                background: "#c85c1a",
                color: "#fff6e6",
                letterSpacing: "0.18em",
                boxShadow: "0 0 24px rgba(200,92,26,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              start building free →
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function KV({
  label,
  value,
  mono,
  valueColor,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 4 },
        visible: { opacity: 1, y: 0 },
      }}
      className="flex items-baseline justify-between gap-4"
    >
      <span
        className="shrink-0 text-[10px] font-mono uppercase"
        style={{ color: "var(--text-2)", letterSpacing: "0.18em" }}
      >
        {label}
      </span>
      <span
        className={`text-right ${mono ? "font-mono" : ""} text-[11.5px]`}
        style={{ color: valueColor ?? "#fff" }}
      >
        {value}
      </span>
    </motion.div>
  );
}
