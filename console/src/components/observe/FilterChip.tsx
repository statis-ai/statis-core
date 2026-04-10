import type { ReactNode } from "react";

export function FilterChipRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">{children}</div>
  );
}

export function FilterChip({
  label,
  count,
  active = false,
  onClick,
}: {
  label: string;
  count?: number | string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full font-semibold transition-colors"
      style={{
        color: active ? "var(--text)" : "var(--text-2)",
        background: active
          ? "color-mix(in srgb, var(--text) 7%, transparent)"
          : "transparent",
        border: active
          ? "1px solid color-mix(in srgb, var(--text) 16%, transparent)"
          : "1px solid var(--border)",
      }}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className="tabular-nums text-[10px]"
          style={{
            color: active ? "var(--text-2)" : "var(--text-muted)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
