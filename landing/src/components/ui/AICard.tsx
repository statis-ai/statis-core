"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface AICardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glowColor?: string;
  interactive?: boolean;
}

export function AICard({
  children,
  className,
  glowColor,
  interactive = true,
  ...props
}: AICardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-[28px] border bg-[#161410] transition-all duration-300",
        className,
      )}
      style={{ borderColor: "rgba(255,240,220,0.05)" }}
      {...props}
    >
      {children}
    </div>
  );
}
