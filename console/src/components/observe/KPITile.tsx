"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KPITileProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  sparkline?: number[];
}

export function KPITile({ label, value, delta, deltaPositive, sparkline }: KPITileProps) {
  const sparkData = sparkline?.map((v, i) => ({ i, v }));

  return (
    <div
      className="bg-brand-paper border border-brand-rule flex flex-col gap-3 p-5"
      style={{ borderRadius: "var(--radius)" }}
    >
      <p
        className="font-mono uppercase text-brand-muted"
        style={{ fontSize: 10, letterSpacing: "0.14em" }}
      >
        {label}
      </p>

      <div className="flex items-end justify-between gap-3">
        <p
          className="text-brand-ink"
          style={{ fontSize: 36, fontWeight: 300, lineHeight: 1, letterSpacing: "-0.03em" }}
        >
          {value}
        </p>

        {sparkData && sparkData.length > 1 && (
          <div style={{ width: 80, height: 24, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {delta && (
        <p
          className="font-mono"
          style={{
            fontSize: 11,
            color: deltaPositive ? "var(--good)" : "var(--bad)",
          }}
        >
          {deltaPositive ? "+" : ""}{delta} vs prev period
        </p>
      )}
    </div>
  );
}
