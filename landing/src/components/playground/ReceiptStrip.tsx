"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Scene } from "@/data/playground-scene";

type ReceiptStripProps = {
  scene: Scene;
  visible: boolean;
  denied?: boolean;
};

export function ReceiptStrip({ scene, visible, denied = false }: ReceiptStripProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 28 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="relative flex w-full items-center gap-6 overflow-hidden px-5 py-3"
          style={{
            borderRadius: 12,
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Left tick */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[2px]"
            style={{
              background: "#c85c1a",
              boxShadow: "0 0 10px rgba(200,92,26,0.55)",
            }}
          />

          <Cell label="receipt" value={scene.receipt.id} mono />
          <Cell label="sha256" value={scene.receipt.sha256} mono />
          <Cell label="executed_at" value={scene.receipt.executedAt} mono />
          <Cell
            label="decided_by"
            value={denied ? "you · denied" : "you · approved"}
            mono
            valueColor={denied ? "#f87171" : "#22c55e"}
          />
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className="block h-1.5 w-1.5 rounded-full"
              style={{ background: "#c85c1a" }}
            />
            <span
              className="text-[9px] uppercase font-mono"
              style={{ color: "var(--text-2)", letterSpacing: "0.22em" }}
            >
              on ledger
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Cell({
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
    <div className="flex flex-col">
      <span
        className="text-[9px] uppercase font-mono"
        style={{ color: "var(--text-2)", letterSpacing: "0.2em" }}
      >
        {label}
      </span>
      <span
        className={mono ? "font-mono text-[11.5px]" : "text-[11.5px]"}
        style={{ color: valueColor ?? "#fff" }}
      >
        {value}
      </span>
    </div>
  );
}
