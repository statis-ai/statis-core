"use client";

import Link from "next/link";

interface HBarItem {
  label: string;
  count: number;
  href?: string;
}

export function HBarList({
  items,
  maxCount,
}: {
  items: HBarItem[];
  maxCount?: number;
}) {
  const max = maxCount ?? Math.max(...items.map((i) => i.count), 1);

  if (items.length === 0) {
    return (
      <p style={{ fontSize: 12, color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
        No data yet.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items.map((item) => {
        const pct = Math.max((item.count / max) * 100, item.count > 0 ? 4 : 0);
        const row = (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "35% 1fr 15%",
              alignItems: "center",
              gap: "6px 8px",
              height: 28,
              padding: "0 4px",
              borderRadius: "var(--radius)",
              cursor: item.href ? "pointer" : "default",
              transition: "background var(--duration-fast)",
            }}
            className="hbar-row"
          >
            <span
              style={{
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "var(--ink-soft)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={item.label}
            >
              {item.label}
            </span>
            <div style={{ height: 6, background: "var(--bg-deep)", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: "var(--accent)",
                  opacity: 0.6,
                  borderRadius: 3,
                  transition: "width 0.3s ease",
                }}
                className="hbar-fill"
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--ink-muted)",
                textAlign: "right",
              }}
            >
              {item.count}
            </span>
          </div>
        );

        if (item.href) {
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{ textDecoration: "none", display: "block" }}
            >
              {row}
            </Link>
          );
        }
        return <div key={item.label}>{row}</div>;
      })}

      <style>{`
        .hbar-row:hover { background: var(--bg-deep); }
        .hbar-row:hover .hbar-fill { opacity: 1; }
      `}</style>
    </div>
  );
}
