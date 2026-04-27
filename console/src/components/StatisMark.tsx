"use client";

// V6 brand glyph — two vertical bars with a rust accent bar at the top.
// Matches the mark used on statis.dev/v6 landing.
//
// barColor   — the two vertical bracket bars (use light on dark bg, dark on light bg)
// accentColor — the horizontal rust accent bar (brand color, works on both)
export function StatisMark({
  size = 28,
  barColor = "#e8e4de",
  accentColor = "#b8442e",
}: {
  size?: number;
  barColor?: string;
  accentColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left vertical bar */}
      <rect x="20" y="40" width="40" height="180" rx="4" fill={barColor} />
      {/* Right vertical bar */}
      <rect x="180" y="40" width="40" height="180" rx="4" fill={barColor} />
      {/* Rust accent bar — the gate mechanism */}
      <rect x="110" y="40" width="110" height="30" rx="4" fill={accentColor} />
      {/* Bottom notch */}
      <rect x="110" y="200" width="20" height="20" rx="2" fill={barColor} />
    </svg>
  );
}
