"use client";

import { motion } from "framer-motion";

export function Logo({ size = "default" }: { size?: "default" | "large" }) {
  const fontSize = size === "large" ? "text-lg" : "text-sm";

  return (
    <span className={`${fontSize} font-bold tracking-tight inline-flex items-center`}>
      <span style={{ color: "var(--text)" }}>statis</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, repeatType: "reverse", ease: "steps(2)" }}
        className="inline-block ml-[1px]"
        style={{
          width: size === "large" ? "10px" : "7px",
          height: size === "large" ? "18px" : "13px",
          background: "var(--text)",
          verticalAlign: "baseline",
          marginBottom: "-1px",
        }}
      />
    </span>
  );
}
