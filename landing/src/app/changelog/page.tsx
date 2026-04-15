import { PageShell } from "@/components/PageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — Statis",
  description: "Release notes and product updates for Statis.",
};

type Change = {
  type: "feature" | "improvement" | "fix" | "security";
  text: string;
};

type Release = {
  version: string;
  date: string;
  title: string;
  changes: Change[];
};

const RELEASES: Release[] = [
  {
    version: "0.4.0",
    date: "April 6, 2026",
    title: "MCP Connectors — governance-first MCP integration",
    changes: [
      { type: "feature", text: "Tenant-scoped Connector registry with CRUD API (/connectors)" },
      { type: "feature", text: "MCP adapter resolves connectors by name and injects auth headers (bearer, basic, api_key)" },
      { type: "feature", text: "Python and TypeScript SDK support for registering MCP connectors" },
      { type: "fix", text: "Dispatcher: APPROVED actions now stay APPROVED until worker picks them up, fixing adapter bypass bug" },
      { type: "fix", text: "Python SDK execute() fast-path removed — now polls until worker sets COMPLETED" },
    ],
  },
  {
    version: "0.3.0",
    date: "April 4, 2026",
    title: "Agents, Policy-as-Code, and enterprise adapters",
    changes: [
      { type: "feature", text: "Agents Console page — register, observe, and govern per-agent" },
      { type: "feature", text: "Policy-as-Code CLI — statis apply, statis diff, statis simulate" },
      { type: "feature", text: "OpenTelemetry OTLP HTTP exporter wired into worker finalization" },
      { type: "feature", text: "Adapters: GitHub (merge PR, create release, trigger workflow), Linear (create/update issue), Slack (send/update message)" },
      { type: "feature", text: "Seed policy rules for all 7 new action types" },
    ],
  },
  {
    version: "0.2.0",
    date: "March 28, 2026",
    title: "Simulate, Analytics, and Slack escalations",
    changes: [
      { type: "feature", text: "POST /actions/simulate — dry-run policy evaluation without DB writes" },
      { type: "feature", text: "Python and TypeScript SDK simulate() methods" },
      { type: "feature", text: "Test Policy button and modal on Console policies page" },
      { type: "feature", text: "GET /analytics/summary endpoint + Home page tiles, sparkline, top rules, top agents" },
      { type: "feature", text: "Slack escalation notifications via outbound webhooks" },
    ],
  },
  {
    version: "0.1.0",
    date: "March 15, 2026",
    title: "Initial public release",
    changes: [
      { type: "feature", text: "Action Contract — agents propose typed intents before execution" },
      { type: "feature", text: "Policy Engine — deterministic rule evaluation, versioned, no ML" },
      { type: "feature", text: "Execution Lock — distributed exactly-once guarantee via action ID lock" },
      { type: "feature", text: "Ledger Receipt — SHA-256 tamper-evident receipt written atomically" },
      { type: "feature", text: "Console, Docs, Python SDK, and TypeScript SDK" },
    ],
  },
];

const TAG_STYLE: Record<Change["type"], { color: string; bg: string; border: string; label: string }> = {
  feature:     { color: "#00D4FF", bg: "rgba(0,212,255,0.10)",   border: "rgba(0,212,255,0.28)",   label: "NEW" },
  improvement: { color: "#60A5FA", bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.28)",  label: "IMPROVED" },
  fix:         { color: "#FACC15", bg: "rgba(250,204,21,0.10)",  border: "rgba(250,204,21,0.28)",  label: "FIX" },
  security:    { color: "#F87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.28)", label: "SECURITY" },
};

export default function ChangelogPage() {
  return (
    <PageShell
      eyebrow="Changelog"
      title="Every release,"
      titleAccent="shipped."
      subtitle="Release notes, new features, and fixes. Statis ships every week."
    >
      <div className="space-y-16 mt-8">
        {RELEASES.map((release) => (
          <article key={release.version} className="relative pl-0 md:pl-8">
            <div
              className="hidden md:block absolute left-0 top-2 w-3 h-3 rounded-full"
              style={{ background: "#00D4FF", boxShadow: "0 0 12px rgba(0,212,255,0.6)" }}
            />
            <div className="flex items-baseline gap-3 mb-3">
              <span
                className="text-[11px] font-mono font-bold px-2 py-1 rounded"
                style={{
                  color: "#00D4FF",
                  background: "rgba(0,212,255,0.08)",
                  border: "1px solid rgba(0,212,255,0.25)",
                }}
              >
                v{release.version}
              </span>
              <span className="text-[11px]" style={{ color: "#71717A" }}>
                {release.date}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 tracking-tight">
              {release.title}
            </h2>
            <ul className="space-y-3">
              {release.changes.map((change, i) => {
                const style = TAG_STYLE[change.type];
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                      style={{
                        color: style.color,
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                      }}
                    >
                      {style.label}
                    </span>
                    <span className="text-sm leading-relaxed" style={{ color: "#D4D4D8" }}>
                      {change.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
