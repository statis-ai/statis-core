import type { ReactNode } from "react";

export function StatTileGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{children}</div>
  );
}

export function StatTile({
  label,
  value,
  delta,
  trend = "neutral",
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  hint?: ReactNode;
  icon?: ReactNode;
}) {
  const trendColor =
    trend === "up" ? "#34D399" : trend === "down" ? "#F87171" : "var(--text-muted)";
  const trendPrefix = trend === "up" ? "↑" : trend === "down" ? "↓" : "·";

  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </span>
        {icon && (
          <span style={{ color: "var(--text-muted)" }}>{icon}</span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <div
          className="text-[22px] font-bold tabular-nums leading-none tracking-tight"
          style={{ color: "var(--text)" }}
        >
          {value}
        </div>
        {delta && (
          <span
            className="text-[11px] font-semibold tabular-nums"
            style={{ color: trendColor }}
          >
            {trendPrefix} {delta}
          </span>
        )}
      </div>
      {hint && (
        <div
          className="text-[10px] mt-2"
          style={{ color: "var(--text-muted)" }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
