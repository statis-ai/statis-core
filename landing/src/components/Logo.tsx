"use client";

function ApertureMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(0 50 50)" />
      <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(60 50 50)" opacity="0.78" />
      <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(120 50 50)" opacity="0.56" />
      <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(180 50 50)" opacity="0.78" />
      <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(240 50 50)" opacity="0.56" />
      <rect x="45.5" y="11" width="9" height="41" rx="4.5" fill="#F0EDE8" transform="rotate(300 50 50)" opacity="0.78" />
      <circle cx="50" cy="50" r="15" fill="#c85c1a" opacity="0.28" />
      <circle cx="50" cy="50" r="12" fill="#c85c1a" />
      <circle cx="50" cy="50" r="3.5" fill="#F9C09A" />
    </svg>
  );
}

export function Logo({ size = "default" }: { size?: "default" | "large" }) {
  const fontSize = size === "large" ? "text-xl" : "text-base";
  const markSize = size === "large" ? 28 : 20;

  return (
    <span className={`${fontSize} font-bold tracking-tight inline-flex items-center gap-2`}>
      <ApertureMark size={markSize} />
      <span style={{ color: "var(--text)" }}>statis</span>
    </span>
  );
}
