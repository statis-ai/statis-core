"use client";

import { useId } from "react";

// Gap Quad — 4 rounded diamonds stacked diagonally with dark separator gaps.
// `bladeColor` controls the near-white/near-black stack; `gapColor` should match
// the surrounding surface so the separator strokes read as negative space.
export function StatisMark({
  size = 28,
  bladeColor = "#F0EDE8",
  gapColor = "#0a0a0a",
}: {
  size?: number;
  bladeColor?: string;
  gapColor?: string;
}) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="-15 -15 130 130"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="50"
          y1="20"
          x2="50"
          y2="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFB585" />
          <stop offset="100%" stopColor="#A04211" />
        </linearGradient>
      </defs>
      <g transform="rotate(45 71 71)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill="#3A1808" />
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="11"
          fill="none"
          stroke={gapColor}
          strokeWidth="3"
        />
      </g>
      <g transform="rotate(45 64 64)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill="#5A2208" />
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="11"
          fill="none"
          stroke={gapColor}
          strokeWidth="3"
        />
      </g>
      <g transform="rotate(45 57 57)">
        <rect x="20" y="20" width="60" height="60" rx="11" fill="#8A380F" />
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="11"
          fill="none"
          stroke={gapColor}
          strokeWidth="3"
        />
      </g>
      <g transform="rotate(45 50 50)">
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="11"
          fill={`url(#${gradientId})`}
        />
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="11"
          fill="none"
          stroke={gapColor}
          strokeWidth="3"
        />
      </g>
      <g transform="rotate(45 50 50)">
        <rect
          x="36"
          y="36"
          width="28"
          height="28"
          rx="6"
          fill={bladeColor}
          opacity="0.92"
        />
      </g>
    </svg>
  );
}
