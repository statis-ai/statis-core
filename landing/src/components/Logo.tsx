"use client";

import { useId } from "react";

function StackMark({ size, gapColor = "#191919" }: { size: number; gapColor?: string }) {
  const gradientId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFB585" />
          <stop offset="100%" stopColor="#A04211" />
        </linearGradient>
      </defs>
      <g transform="rotate(45 71 71)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill="#3A1808" />
        <rect x="20" y="20" width="60" height="60" rx="11" fill="none" stroke={gapColor} strokeWidth="3" />
      </g>
      <g transform="rotate(45 64 64)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill="#5A2208" />
        <rect x="20" y="20" width="60" height="60" rx="11" fill="none" stroke={gapColor} strokeWidth="3" />
      </g>
      <g transform="rotate(45 57 57)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill="#8A380F" />
        <rect x="20" y="20" width="60" height="60" rx="11" fill="none" stroke={gapColor} strokeWidth="3" />
      </g>
      <g transform="rotate(45 50 50)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill={`url(#${gradientId})`} />
        <rect x="20" y="20" width="60" height="60" rx="11" fill="none" stroke={gapColor} strokeWidth="3" />
      </g>
      <g transform="rotate(45 50 50)">
        <rect x="36" y="36" width="28" height="28" rx="6" fill="#FFE4D0" opacity="0.92" />
      </g>
    </svg>
  );
}

export function Logo({ size = "default", gapColor }: { size?: "default" | "large"; gapColor?: string }) {
  const fontSize = size === "large" ? "text-xl" : "text-base";
  const markSize = size === "large" ? 36 : 28;

  return (
    <span className={`${fontSize} font-bold tracking-tight inline-flex items-center gap-2`}>
      <StackMark size={markSize} gapColor={gapColor} />
      <span style={{ color: "var(--text)" }}>statis</span>
    </span>
  );
}
