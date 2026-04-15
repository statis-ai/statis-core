"use client";

import { useState } from "react";

type Tone = "warm" | "cool";

type AgentPortraitProps = {
  src: string;
  alt: string;
  fallbackInitials: string;
  /** warm = agent (orange); cool = human approver (indigo) */
  tone?: Tone;
  /** Optional kind label shown as a small pill over the gradient */
  kind?: "AI AGENT" | "HUMAN" | string;
};

/** HD portrait with a premium gradient + initials fallback. */
export function AgentPortrait({
  src,
  alt,
  fallbackInitials,
  tone = "warm",
  kind,
}: AgentPortraitProps) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    const warmStops = [
      { offset: "0%", color: "#ffb07a" },
      { offset: "28%", color: "#ff7a2a" },
      { offset: "60%", color: "#a03c0c" },
      { offset: "100%", color: "#2a0f04" },
    ];
    const coolStops = [
      { offset: "0%", color: "#a8b3ff" },
      { offset: "30%", color: "#6c7aff" },
      { offset: "65%", color: "#2f3a9e" },
      { offset: "100%", color: "#0a0f26" },
    ];
    const stops = tone === "warm" ? warmStops : coolStops;
    const ringColor = tone === "warm" ? "rgba(255,140,60,0.35)" : "rgba(140,160,255,0.3)";
    const glyphColor = tone === "warm" ? "#fff6e6" : "#eaf0ff";

    return (
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: `radial-gradient(circle at 35% 28%, ${stops[0].color} 0%, ${stops[1].color} ${stops[1].offset}, ${stops[2].color} ${stops[2].offset}, ${stops[3].color} 100%)`,
        }}
      >
        {/* Concentric glow rings — soft ambient depth */}
        <div
          aria-hidden
          className="absolute rounded-full"
          style={{
            inset: "-20% -20% auto auto",
            width: "140%",
            height: "140%",
            background: `radial-gradient(circle at 30% 25%, ${ringColor} 0%, transparent 50%)`,
            mixBlendMode: "screen",
          }}
        />
        {/* Subtle grain overlay for texture (via pseudo-noise SVG) */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-[0.12] mix-blend-overlay"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id={`noise-${tone}`}>
            <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#noise-${tone})`} />
        </svg>
        {/* Kind pill */}
        {kind && (
          <div
            className="absolute top-3 left-3 px-2 py-0.5 font-mono text-[9px] uppercase"
            style={{
              color: glyphColor,
              letterSpacing: "0.22em",
              border: `1px solid ${ringColor}`,
              borderRadius: 999,
              background: "rgba(0,0,0,0.25)",
              backdropFilter: "blur(6px)",
            }}
          >
            {kind}
          </div>
        )}
        {/* Initials */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="relative font-bold select-none"
            style={{
              fontSize: "clamp(4rem, 9vw, 6rem)",
              color: glyphColor,
              letterSpacing: "-0.05em",
              textShadow: "0 4px 24px rgba(0,0,0,0.45)",
            }}
          >
            {fallbackInitials}
          </span>
        </div>
        {/* Soft vignette */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className="absolute inset-0 h-full w-full object-cover"
      draggable={false}
    />
  );
}
