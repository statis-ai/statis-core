"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type GlowColor = "cyan" | "violet" | "green";

const glowClasses: Record<GlowColor, string> = {
  cyan:
    "bg-gray-50 group-hover:bg-white group-hover:border-cyan-200 group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)]",
  violet:
    "bg-gray-50 group-hover:bg-white group-hover:border-violet-200 group-hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)]",
  green:
    "bg-gray-50 group-hover:bg-white group-hover:border-green-200 group-hover:shadow-[0_8px_30px_rgba(34,197,94,0.12)]",
};

interface AICardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glowColor?: GlowColor;
  interactive?: boolean;
}

export function AICard({
  children,
  className,
  glowColor = "cyan",
  interactive = true,
  ...props
}: AICardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition-all duration-300",
        interactive && "hover:-translate-y-[3px]",
        interactive && glowClasses[glowColor],
        className,
      )}
      {...props}
    >
      {/* Glow blob (visible on hover when interactive) */}
      {interactive && (
        <div
          className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              glowColor === "cyan"
                ? "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)"
                : glowColor === "violet"
                  ? "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)",
          }}
        />
      )}
      {children}
    </div>
  );
}
