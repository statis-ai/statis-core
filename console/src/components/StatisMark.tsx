"use client";

// Brand glyph — exact match of the v6 landing mark (LandingV6.tsx).
// Two vertical bracket bars + rust accent bar at top + bottom notch.
// Sharp corners, no rx. viewBox 0 0 240 240.
//
// On dark backgrounds (console sidebar): barColor = light (#e8e4de)
// On light backgrounds (auth panel):     barColor = dark (#111111)
// accentColor (#b8442e) works on both.
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
      <rect x="20" y="40" width="40" height="180" fill={barColor} />
      <rect x="180" y="40" width="40" height="180" fill={barColor} />
      <rect x="110" y="40" width="110" height="30" fill={accentColor} />
      <rect x="110" y="200" width="20" height="20" fill={barColor} />
    </svg>
  );
}
