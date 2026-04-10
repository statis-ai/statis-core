"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, ChevronDown } from "lucide-react";

export type TimeRange =
  | "15m"
  | "1h"
  | "4h"
  | "24h"
  | "7d"
  | "30d";

const LABELS: Record<TimeRange, string> = {
  "15m": "Last 15 minutes",
  "1h": "Last 1 hour",
  "4h": "Last 4 hours",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

const SHORT: Record<TimeRange, string> = {
  "15m": "15m",
  "1h": "1h",
  "4h": "4h",
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
};

const OPTIONS: TimeRange[] = ["15m", "1h", "4h", "24h", "7d", "30d"];

export function TimePicker({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-full font-medium transition-colors"
        style={{
          color: "var(--text-2)",
          background: "color-mix(in srgb, var(--text) 4%, transparent)",
          border: "1px solid var(--border)",
        }}
      >
        <Clock size={12} />
        <span>Last {SHORT[value]}</span>
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] min-w-[200px] rounded-xl overflow-hidden shadow-2xl z-50"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow:
              "0 20px 40px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          <div className="py-1.5">
            {OPTIONS.map((opt) => {
              const active = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[12px] transition-colors"
                  style={{
                    background: active
                      ? "color-mix(in srgb, var(--text) 6%, transparent)"
                      : "transparent",
                    color: active ? "var(--text)" : "var(--text-2)",
                  }}
                >
                  <span>{LABELS[opt]}</span>
                  {active && <span style={{ color: "#FB923C" }}>●</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
