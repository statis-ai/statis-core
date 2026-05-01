"use client";

import type { KillSwitchStatus } from "@/lib/api";

interface SystemHealthProps {
  killSwitch: KillSwitchStatus | null;
}

function HealthRow({ label, status, detail }: { label: string; status: "ok" | "warn" | "bad"; detail: string }) {
  const dot: Record<string, string> = {
    ok: "var(--good)",
    warn: "var(--warn)",
    bad: "var(--bad)",
  };

  return (
    <div
      className="flex items-center justify-between py-2 border-b border-brand-rule-soft last:border-0"
    >
      <span
        className="flex items-center gap-2 font-mono text-brand-ink-soft"
        style={{ fontSize: 12 }}
      >
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: dot[status],
            flexShrink: 0,
          }}
        />
        {label}
      </span>
      <span
        className="font-mono text-brand-muted"
        style={{ fontSize: 11 }}
      >
        {detail}
      </span>
    </div>
  );
}

export function SystemHealth({ killSwitch }: SystemHealthProps) {
  const ksStatus = killSwitch?.active ? "bad" : "ok";
  const ksDetail = killSwitch?.active ? "ACTIVE" : "Off";

  return (
    <div
      className="bg-brand-paper border border-brand-rule p-4"
      style={{ borderRadius: "var(--radius)" }}
    >
      <p className="eyebrow mb-3">Health</p>
      <HealthRow
        label="Kill switch"
        status={ksStatus}
        detail={ksDetail}
      />
      <HealthRow
        label="API"
        status="ok"
        detail="reachable"
      />
      <HealthRow
        label="Worker"
        status="ok"
        detail="polling"
      />
    </div>
  );
}
