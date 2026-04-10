import type { ReactNode } from "react";

type Variant = "neutral" | "accent";

const VARIANTS: Record<
  Variant,
  { color: string; bg: string; border: string; shadow?: string; dot: string; dotShadow?: string }
> = {
  // Cream on a subtle warm white. Used for most content sections — quiet,
  // readable, and lets the orange brand moments actually hit when they appear.
  neutral: {
    color: "#D4C8B8",
    bg: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    dot: "#D4C8B8",
  },
  // Brand orange pill. Reserved for emotional peaks and conversion moments:
  // Hero, Manifesto, and the final CTA section.
  accent: {
    color: "#FB923C",
    bg: "rgba(200,92,26,0.10)",
    border: "1px solid rgba(200,92,26,0.28)",
    shadow: "0 0 24px -8px rgba(200,92,26,0.35)",
    dot: "#FB923C",
    dotShadow: "0 0 6px rgba(251,146,60,0.8)",
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
