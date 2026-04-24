"use client";

import { useMemo, useState } from "react";

type Level = { score: 0 | 1 | 2 | 3 | 4; label: string; color: string };

function estimate(pw: string): Level {
  if (!pw) return { score: 0, label: "empty", color: "bg-rule" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (classes >= 3) score++;
  if (classes === 4 && pw.length >= 14) score++;

  const map: Level[] = [
    { score: 0, label: "too short", color: "bg-ink-muted" },
    { score: 1, label: "weak", color: "bg-accent" },
    { score: 2, label: "fair", color: "bg-amber" },
    { score: 3, label: "good", color: "bg-seal" },
    { score: 4, label: "strong", color: "bg-seal" },
  ];
  return map[Math.min(score, 4) as 0 | 1 | 2 | 3 | 4];
}

export function PasswordStrength({ name = "password", id = "password" }: { name?: string; id?: string }) {
  const [value, setValue] = useState("");
  const level = useMemo(() => estimate(value), [value]);

  return (
    <div>
      <label htmlFor={id} className="block font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted mb-[5px]">
        New password
      </label>
      <input
        id={id}
        name={name}
        type="password"
        required
        autoComplete="new-password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        minLength={12}
        className="w-full py-2 px-[11px] bg-paper border border-rule rounded-[3px] font-sans text-[13px] text-ink tracking-[-0.005em] focus:outline-none focus:border-accent focus:ring-2 focus:ring-[rgba(184,68,46,0.15)]"
      />
      <div className="flex items-center gap-2 mt-1.5">
        <div className="flex-1 h-[3px] bg-rule rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${level.color}`}
            style={{ width: `${(level.score / 4) * 100}%` }}
          />
        </div>
        <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-ink-muted">
          {level.score > 0 ? "●" : "○"} {level.label} · {level.score} of 4
        </span>
      </div>
      <p className="text-[11px] leading-[1.4] text-ink-muted mt-1 tracking-[-0.005em]">
        Minimum 12 characters. Mix letters, numbers, and symbols for a stronger receipt.
      </p>
    </div>
  );
}
