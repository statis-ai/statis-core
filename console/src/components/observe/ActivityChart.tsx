"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyBucket } from "@/lib/api";
import { SERIES } from "@/lib/chartColors";

interface ActivityChartProps {
  data: DailyBucket[];
  onRangeChange?: (days: number) => void;
  currentDays?: number;
}

const RANGES = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
];

function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityChart({ data, onRangeChange, currentDays = 7 }: ActivityChartProps) {
  const [hoveredRange, setHoveredRange] = useState<number | null>(null);

  return (
    <div
      className="bg-brand-paper border border-brand-rule p-5"
      style={{ borderRadius: "var(--radius)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="eyebrow">Activity timeline</span>

        <div className="flex items-center gap-1">
          {RANGES.map((r) => {
            const active = r.days === currentDays;
            return (
              <button
                key={r.days}
                onClick={() => onRangeChange?.(r.days)}
                onMouseEnter={() => setHoveredRange(r.days)}
                onMouseLeave={() => setHoveredRange(null)}
                className="font-mono transition-colors"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${active ? "var(--accent)" : "var(--rule)"}`,
                  background: active ? "var(--accent-tint)" : "transparent",
                  color:
                    active || hoveredRange === r.days
                      ? "var(--accent)"
                      : "var(--ink-muted)",
                  cursor: "pointer",
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {data.length === 0 ? (
        <div
          style={{
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ink-subtle)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          No activity data yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.approved} stopOpacity={0.3} />
                <stop offset="100%" stopColor={SERIES.approved} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradDenied" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.denied} stopOpacity={0.25} />
                <stop offset="100%" stopColor={SERIES.denied} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradEscalated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.escalated} stopOpacity={0.25} />
                <stop offset="100%" stopColor={SERIES.escalated} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="var(--rule)"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--ink-muted)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--ink-muted)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--paper)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--radius)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink)",
              }}
              labelStyle={{ color: "var(--ink-muted)", marginBottom: 4 }}
              labelFormatter={(label: unknown) => fmtDate(String(label))}
              itemStyle={{ padding: "1px 0" }}
            />

            <Area
              type="monotone"
              dataKey="approved"
              name="Approved"
              stroke={SERIES.approved}
              strokeWidth={1.5}
              fill="url(#gradApproved)"
              dot={false}
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="escalated"
              name="Escalated"
              stroke={SERIES.escalated}
              strokeWidth={1.5}
              fill="url(#gradEscalated)"
              dot={false}
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="denied"
              name="Denied"
              stroke={SERIES.denied}
              strokeWidth={1.5}
              fill="url(#gradDenied)"
              dot={false}
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      <div className="flex items-center gap-4 mt-3">
        {[
          { color: SERIES.approved, label: "Approved" },
          { color: SERIES.escalated, label: "Escalated" },
          { color: SERIES.denied, label: "Denied" },
        ].map(({ color, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 font-mono"
            style={{ fontSize: 10, color: "var(--ink-muted)" }}
          >
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 2,
                background: color,
                borderRadius: 1,
              }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
