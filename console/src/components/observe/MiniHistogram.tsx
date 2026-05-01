"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Bucket {
  label?: string;
  value: number;
}

export function MiniHistogram({
  data,
  width = 120,
  height = 34,
}: {
  data: number[] | Bucket[];
  width?: number;
  height?: number;
}) {
  const normalized: Bucket[] = data.map((d, i) =>
    typeof d === "number" ? { label: String(i), value: d } : d
  );

  if (normalized.length === 0 || normalized.every((b) => b.value === 0)) {
    return (
      <div
        style={{
          width,
          height,
          borderRadius: 4,
          background: "var(--bg-deep)",
        }}
      />
    );
  }

  const max = Math.max(...normalized.map((b) => b.value), 1);

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={normalized} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barCategoryGap={2}>
        <XAxis dataKey="label" hide />
        <Tooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const bucket = payload[0].payload as Bucket;
            return (
              <div
                style={{
                  background: "var(--paper)",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--radius)",
                  padding: "4px 8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink)",
                }}
              >
                {bucket.label && <span style={{ color: "var(--ink-muted)" }}>{bucket.label}: </span>}
                {bucket.value}
              </div>
            );
          }}
        />
        <defs>
          <linearGradient id="rustGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.85} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <Bar dataKey="value" radius={[1, 1, 0, 0]}>
          {normalized.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.value > 0 ? "url(#rustGradient)" : "var(--bg-deep)"}
              opacity={entry.value > 0 ? 1 : 0.4}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
