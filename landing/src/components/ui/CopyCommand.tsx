"use client";

import { useState } from "react";

export function CopyCommand({
  command,
  prompt = "$",
}: {
  command: string;
  prompt?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] font-mono transition-all cursor-pointer"
      style={{
        background: "rgba(10,10,10,0.6)",
        border: "1px solid var(--border)",
        color: "var(--text-2)",
        backdropFilter: "blur(12px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <span style={{ color: "var(--text-muted)" }}>{prompt}</span>
      <span>{command}</span>
      <span
        className="ml-1 text-[11px]"
        style={{ color: copied ? "#00D4FF" : "var(--text-muted)" }}
      >
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
