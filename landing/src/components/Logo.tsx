"use client";

import { motion } from "framer-motion";

export function Logo({ size = "default" }: { size?: "default" | "large" }) {
  const fontSize = size === "large" ? "text-xl" : "text-base";

  return (
    <span className={`${fontSize} font-bold tracking-tight inline-flex items-center`}>
      <span style={{ color: "var(--text)" }}>statis</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="inline-block ml-[1px]"
        style={{
          width: size === "large" ? "11px" : "8px",
          height: size === "large" ? "20px" : "15px",
          background: "var(--text)",
          verticalAlign: "baseline",
          marginBottom: "-1px",
        }}
      />
    </span>
  );
}
