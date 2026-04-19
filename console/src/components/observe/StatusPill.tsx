import type { ReactNode } from "react";

type Palette = {
  color: string;
  bg: string;
  border: string;
};

const PALETTES: Record<string, Palette> = {
  COMPLETED: { color: "#34D399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.28)" },
  SUCCESS:   { color: "#34D399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.28)" },
  APPROVED:  { color: "#34D399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.28)" },
  ESCALATED: { color: "#FACC15", bg: "rgba(250,204,21,0.10)", border: "rgba(250,204,21,0.28)" },
  STEP_UP:   { color: "#FACC15", bg: "rgba(250,204,21,0.10)", border: "rgba(250,204,21,0.28)" }, // AARM R4 canonical form of ESCALATED
  PENDING:   { color: "#FACC15", bg: "rgba(250,204,21,0.10)", border: "rgba(250,204,21,0.28)" },
  EXECUTING: { color: "#60A5FA", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.28)" },
  RUNNING:   { color: "#60A5FA", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.28)" },
  DEFERRED:  { color: "#38BDF8", bg: "rgba(56,189,248,0.10)", border: "rgba(56,189,248,0.30)" }, // AARM R4 DEFER — paused/awaiting resolution
  MODIFIED:  { color: "#C084FC", bg: "rgba(192,132,252,0.10)", border: "rgba(192,132,252,0.30)" }, // AARM R4 MODIFY — parameters rewritten
  DENIED:    { color: "#F87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.28)" },
  FAILED:    { color: "#F87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.28)" },
  SHADOW:    { color: "#A1A1AA", bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.22)" },
  NEUTRAL:   { color: "#A1A1AA", bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.22)" },
};

export function StatusPill({
  status,
  children,
  dot = true,
  size = "sm",
}: {
  status: string;
  children?: ReactNode;
  dot?: boolean;
  size?: "xs" | "sm";
}) {
  const key = status.toUpperCase();
  const palette = PALETTES[key] ?? PALETTES.NEUTRAL;
  const dim = size === "xs" ? 4 : 5;
  const text = size === "xs" ? "text-[9px]" : "text-[10px]";
  const pad = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${text} ${pad} rounded-full font-semibold tracking-wide`}
      style={{
        color: palette.color,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
      }}
    >
      {dot && (
        <span
          className="rounded-full shrink-0"
          style={{ width: dim, height: dim, background: palette.color }}
        />
      )}
      {children ?? status}
    </span>
  );
}
