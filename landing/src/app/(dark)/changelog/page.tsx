import type { Metadata } from "next";
import { PageV6Shell, HeroV6 } from "@/components/v6/PageV6Shell";

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
    title: "MCP Connectors — @statis.gate for any MCP server",
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
    title: "Agents, Policy-as-Code, and pre-built adapters",
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
    title: "Simulate, policy graduation, and Slack escalations",
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
    title: "Initial release — @statis.gate decorator + approval page",
    changes: [
      { type: "feature", text: "@statis.gate decorator — agents propose before execution" },
      { type: "feature", text: "Signed-URL approval page — human approves or denies from any device" },
      { type: "feature", text: "Policy engine — deterministic rule evaluation, versioned, no ML" },
      { type: "feature", text: "Execution lock — distributed exactly-once guarantee via action ID" },
      { type: "feature", text: "Receipt ledger — SHA-256 tamper-evident receipt written atomically" },
      { type: "feature", text: "Python SDK, TypeScript SDK, Console, and Docs" },
    ],
  },
];

const TAG_STYLE: Record<Change["type"], { color: string; bg: string; border: string; label: string }> = {
  feature:     { color: "var(--accent)",    bg: "var(--accent-bg)",              border: "var(--accent-border)",             label: "NEW" },
  improvement: { color: "var(--status-info)", bg: "rgba(96,165,250,0.08)",       border: "rgba(96,165,250,0.25)",            label: "IMPROVED" },
  fix:         { color: "#facc15",          bg: "rgba(250,204,21,0.08)",         border: "rgba(250,204,21,0.25)",            label: "FIX" },
  security:    { color: "var(--status-bad)", bg: "rgba(239,68,68,0.08)",         border: "rgba(239,68,68,0.25)",             label: "SECURITY" },
};

export default function ChangelogPage() {
  return (
    <PageV6Shell currentRoute="/changelog">
      <HeroV6
        eyebrowNum="§ 01"
        eyebrowText="Changelog"
        title="Every release,"
        titleStrong="shipped."
        subtitle="Release notes, new features, and fixes. Statis ships every week."
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
          {RELEASES.map((release) => (
            <article key={release.version}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    padding: "3px 8px",
                    color: "var(--accent)",
                    background: "var(--accent-bg)",
                    border: "1px solid var(--accent-border)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  v{release.version}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: 11,
                    color: "var(--text-subtle)",
                  }}
                >
                  {release.date}
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--font)",
                  fontSize: "clamp(16px, 1.6vw, 20px)",
                  fontWeight: 600,
                  letterSpacing: "-0.015em",
                  color: "var(--text)",
                  marginBottom: 20,
                }}
              >
                {release.title}
              </h2>

              <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
                {release.changes.map((change, i) => {
                  const style = TAG_STYLE[change.type];
                  return (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <span
                        style={{
                          fontFamily: "var(--font)",
                          fontSize: 8,
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          padding: "2px 6px",
                          color: style.color,
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          borderRadius: "2px",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {style.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font)",
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: "var(--text-2)",
                        }}
                      >
                        {change.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </PageV6Shell>
  );
}
