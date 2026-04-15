import type { ReactNode } from "react";

type Variant = "neutral" | "accent";

const VARIANTS: Record<
  Variant,
  { color: string; bg: string; border: string; shadow?: string; dot: string; dotShadow?: string }
> = {
  neutral: {
    color: "#71717A",
    bg: "rgba(113,113,122,0.06)",
    border: "1px solid rgba(113,113,122,0.12)",
    dot: "#A1A1AA",
  },
  accent: {
    color: "#F97316",
    bg: "rgba(249,115,22,0.06)",
    border: "1px solid rgba(249,115,22,0.18)",
    shadow: "0 0 24px -8px rgba(249,115,22,0.15)",
    dot: "#F97316",
    dotShadow: "0 0 6px rgba(249,115,22,0.4)",
  },
};

export function SectionEyebrow({
  children,
  align = "left",
  variant = "neutral",
}: {
  children: ReactNode;
  align?: "left" | "center";
  variant?: Variant;
}) {
  const v = VARIANTS[variant];
  return (
    <div className={align === "center" ? "flex justify-center" : "flex"}>
      <span
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full font-semibold"
        style={{
          color: v.color,
          background: v.bg,
          border: v.border,
          boxShadow: v.shadow,
        }}
      >
        <span
          className="w-1 h-1 rounded-full"
          style={{ background: v.dot, boxShadow: v.dotShadow }}
        />
        {children}
      </span>
    </div>
  );
}
