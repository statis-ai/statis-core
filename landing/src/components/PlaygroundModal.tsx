"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Scene } from "./playground/Scene";

function ModalInner({ onClose }: { onClose: () => void }) {
  // ESC to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Statis live demo"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{
        background: "#000",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Sticky header bar */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(10,10,11,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="text-[10px] uppercase font-mono"
            style={{ color: "var(--text-2)", letterSpacing: "0.28em" }}
          >
            try live
          </span>
          <span
            className="text-[10px] font-mono"
            style={{ color: "rgba(255,255,255,0.15)" }}
          >
            /
          </span>
          <span
            className="text-[10px] uppercase font-mono"
            style={{ color: "var(--text-2)", letterSpacing: "0.22em" }}
          >
            escalation flow
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none transition-colors"
          style={{
            color: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
          }
        >
          ×
        </button>
      </div>

      {/* Scrollable content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="relative mx-auto w-full max-w-[680px] px-6 py-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stage glow */}
        <div
          aria-hidden
          className="pointer-events-none fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "60vw",
            height: "60vh",
            background:
              "radial-gradient(ellipse at center, rgba(200,92,26,0.08) 0%, transparent 60%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative">
          <Scene onClose={onClose} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PlaygroundModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && <ModalInner key="pg" onClose={onClose} />}
    </AnimatePresence>,
    document.body,
  );
}
