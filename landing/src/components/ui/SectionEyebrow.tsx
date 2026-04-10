import type { ReactNode } from "react";

export function SectionEyebrow({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "flex justify-center" : "flex"}>
      <span
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full font-semibold"
        style={{
          color: "#FB923C",
          background: "rgba(200,92,26,0.10)",
          border: "1px solid rgba(200,92,26,0.28)",
          boxShadow: "0 0 24px -8px rgba(200,92,26,0.35)",
        }}
      >
        <span
          className="w-1 h-1 rounded-full"
          style={{ background: "#FB923C", boxShadow: "0 0 6px rgba(251,146,60,0.8)" }}
        />
        {children}
      </span>
    </div>
  );
}
