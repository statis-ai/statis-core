import { PageV6Shell, HeroV6 } from "@/components/v6/PageV6Shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations — Statis",
  description: "Pre-built adapters for Stripe, Airflow, Salesforce, Zendesk, HubSpot, GitHub, and more. Teams tier depth signal — wrap any tool in @statis.gate today.",
};

type Integration = {
  name: string;
  category: string;
  description: string;
  status: "GA" | "Beta" | "Coming soon";
};

const INTEGRATIONS: Integration[] = [
  { name: "GitHub",        category: "SCM",           description: "Merge PRs, create releases, trigger workflows, close issues.",         status: "GA" },
  { name: "Linear",        category: "Project Mgmt",  description: "Create and update issues via GraphQL with idempotency.",                status: "GA" },
  { name: "Slack",         category: "Communication", description: "Send and update messages with exactly-once semantics.",                 status: "GA" },
  { name: "Stripe",        category: "Payments",      description: "Charge, refund, subscribe — every action receipted.",                   status: "GA" },
  { name: "MCP",           category: "Protocol",      description: "Route Claude and Cursor tool calls through @statis.gate.",              status: "GA" },
  { name: "Airflow",       category: "Orchestration", description: "Trigger DAGs through the governance layer.",                            status: "GA" },
  { name: "HubSpot",       category: "CRM",           description: "Contact and deal mutations with audit trail.",                          status: "Beta" },
  { name: "Salesforce",    category: "CRM",           description: "Record updates, opportunity changes, flow triggers.",                   status: "Beta" },
  { name: "Zendesk",       category: "Support",       description: "Ticket state transitions, assignments, macros.",                        status: "Beta" },
  { name: "AWS",           category: "Infra",         description: "EC2, S3, Lambda actions with policy gating.",                           status: "Coming soon" },
  { name: "GCP",           category: "Infra",         description: "Cloud Run, Pub/Sub, BigQuery operations.",                              status: "Coming soon" },
  { name: "PagerDuty",     category: "Incident",      description: "Incident creation, escalation, resolution.",                            status: "Coming soon" },
];

const STATUS_STYLE: Record<Integration["status"], { color: string; bg: string; border: string }> = {
  GA:            { color: "var(--accent)",    bg: "var(--accent-bg)",    border: "var(--accent-border)" },
  Beta:          { color: "var(--status-info)", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.25)" },
  "Coming soon": { color: "var(--text-subtle)", bg: "rgba(255,255,255,0.03)", border: "var(--border)" },
};

export default function IntegrationsPage() {
  return (
    <PageV6Shell currentRoute="/integrations">
      <HeroV6
        eyebrowNum="§ 01"
        eyebrowText="Integrations"
        title="Pre-built adapters."
        titleStrong="All through the gate."
        subtitle="Six adapters ship with Teams. Any function you can decorate with @statis.gate works on Day 1 — these are the ones we pre-wired so you don't have to."
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12,
            marginBottom: 40,
          }}
        >
          {INTEGRATIONS.map((i) => {
            const style = STATUS_STYLE[i.status];
            return (
              <div
                key={i.name}
                className="pv6-card"
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font)",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {i.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font)",
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--text-subtle)",
                        marginTop: 2,
                      }}
                    >
                      {i.category}
                    </p>
                  </div>
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
                    }}
                  >
                    {i.status.toUpperCase()}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: "var(--text-muted)",
                  }}
                >
                  {i.description}
                </p>
              </div>
            );
          })}
        </div>

        <div
          style={{
            background: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            borderRadius: "var(--radius)",
            padding: "24px 28px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            Don&apos;t see your tool?
          </p>
          <p
            style={{
              fontFamily: "var(--font)",
              fontSize: 12,
              lineHeight: 1.6,
              color: "var(--text-muted)",
            }}
          >
            Every adapter is a thin wrapper around a REST or GraphQL client. Wrap any function
            with <code style={{ color: "var(--accent)" }}>@statis.gate</code> and you&apos;re
            done — no adapter needed.{" "}
            <a href="mailto:hello@statis.dev" style={{ color: "var(--accent)", textDecoration: "none" }}>
              Let us know what you&apos;re integrating →
            </a>
          </p>
        </div>
      </div>
    </PageV6Shell>
  );
}
