import type { ReactNode } from "react";

export function DataTableShell({
  title,
  actions,
  children,
  footer,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      {(title || actions) && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="text-[11px] font-semibold tracking-wide uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            {title}
          </div>
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className="w-full">{children}</div>
      {footer && (
        <div
          className="px-4 py-2.5 text-[11px]"
          style={{
            borderTop: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export function DataTableEmpty({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: "color-mix(in srgb, var(--text) 4%, transparent)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          {icon}
        </div>
      )}
      <p
        className="text-[14px] font-semibold mb-1.5"
        style={{ color: "var(--text)" }}
      >
        {title}
      </p>
      {description && (
        <p
          className="text-[12px] max-w-sm mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
