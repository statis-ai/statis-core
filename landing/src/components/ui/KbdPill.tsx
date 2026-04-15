import type { ReactNode } from "react";

export function KbdPill({ children }: { children: ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center px-1.5 min-w-[20px] h-[20px] text-[10px] font-mono rounded align-middle"
      style={{
        background: "#F4F4F5",
        border: "1px solid #E4E4E7",
        color: "#52525B",
        boxShadow: "0 1px 0 #FFFFFF inset, 0 -1px 0 #D4D4D8 inset",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      {children}
    </kbd>
  );
}
