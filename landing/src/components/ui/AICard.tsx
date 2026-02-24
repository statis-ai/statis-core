"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type GlowColor = "cyan" | "violet" | "green";

const glowClasses: Record<GlowColor, string> = {
  cyan:
    "bg-cyan-400/10 group-hover:bg-cyan-400/15 group-hover:border-cyan-300/25 group-hover:shadow-[0_0_30px_rgba(0,255,200,0.12)]",
  violet:
    "bg-violet-400/10 group-hover:bg-violet-400/15 group-hover:border-violet-300/25 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.12)]",
  green:
    "bg-green-400/10 group-hover:bg-green-400/15 group-hover:border-green-300/25 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.12)]",
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
        "group border-glow relative flex flex-col h-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md transition-all duration-300",
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
                ? "radial-gradient(circle, rgba(0,255,200,0.08) 0%, transparent 70%)"
                : glowColor === "violet"
                  ? "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          }}
        />
      )}
      {children}
    </div>
  );
}
