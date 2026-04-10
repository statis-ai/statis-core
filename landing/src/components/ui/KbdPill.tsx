import type { ReactNode } from "react";

export function KbdPill({ children }: { children: ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center px-1.5 min-w-[20px] h-[20px] text-[10px] font-mono rounded align-middle"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "#D4D4D8",
        boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 -1px 0 rgba(0,0,0,0.25) inset",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      {children}
    </kbd>
  );
}
