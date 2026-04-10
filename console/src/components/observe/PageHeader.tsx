import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-6 mb-6">
      <div className="min-w-0">
        <h1
          className="text-[22px] font-semibold tracking-tight leading-none"
          style={{ color: "var(--text)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <div
            className="text-[12px] mt-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </header>
  );
}
