"use client";

import type { ReactNode } from "react";

type ActFrameProps = {
  title: string;
  children: ReactNode;
  /** Optional accent color for a subtle top-border glow. */
  accentColor?: string;
};

/**
 * ConsolePreview-style 3D card wrapper for each act.
 * Window chrome (traffic-light dots + centered title), depth shadows, inner content.
 */
export function ActFrame({ title, children, accentColor }: ActFrameProps) {
  const accent = accentColor ?? "rgba(200,92,26,0.25)";

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "#0F0F12",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: [
          `inset 0 1px 0 rgba(255,255,255,0.06)`,
          `0 0 0 1px rgba(0,0,0,0.4)`,
          `0 80px 160px rgba(0,0,0,0.5)`,
          `0 30px 60px rgba(0,0,0,0.4)`,
          `0 6px 16px rgba(0,0,0,0.45)`,
          `0 0 60px ${accent.replace("0.25", "0.04")}`,
        ].join(", "),
      }}
    >
      {/* Accent top bar */}
      <div
        aria-hidden
        className="h-[1px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent 10%, ${accent} 50%, transparent 90%)`,
          boxShadow: `0 0 12px ${accent}`,
        }}
      />

      {/* Chrome bar */}
      <div
        className="flex items-center px-3.5 py-2.5"
        style={{
          background: "#15151A",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="block h-[9px] w-[9px] rounded-full"
            style={{ background: "#ff5f56" }}
          />
          <span
            className="block h-[9px] w-[9px] rounded-full"
            style={{ background: "#ffbd2e" }}
          />
          <span
            className="block h-[9px] w-[9px] rounded-full"
            style={{ background: "#27c93f" }}
          />
        </div>
        <span
          className="mx-auto text-[10px] font-mono uppercase"
          style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.22em" }}
        >
          {title}
        </span>
        {/* Spacer to keep title centered */}
        <div className="w-[45px]" />
      </div>

      {/* Inner content */}
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </div>
  );
}
