import { PageShell } from "@/components/PageShell";
import type { Metadata } from "next";
import { IsoIntegrationGrid } from "@/components/ui/IsoIllustrations";

export const metadata: Metadata = {
  title: "Integrations — Statis",
  description: "Adapters for every production system your agents touch. Same context guard, same policy engine, same receipt ledger — whichever integration you pick.",
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
  { name: "MCP",           category: "Protocol",      description: "Route Claude and Cursor tool calls through policy evaluation.",         status: "GA" },
  { name: "Airflow",       category: "Orchestration", description: "Trigger DAGs through the governance layer.",                            status: "GA" },
  { name: "HubSpot",       category: "CRM",           description: "Contact and deal mutations with audit trail.",                          status: "Beta" },
  { name: "Salesforce",    category: "CRM",           description: "Record updates, opportunity changes, flow triggers.",                   status: "Beta" },
  { name: "Zendesk",       category: "Support",       description: "Ticket state transitions, assignments, macros.",                        status: "Beta" },
  { name: "AWS",           category: "Infra",         description: "EC2, S3, Lambda actions with policy gating.",                           status: "Coming soon" },
  { name: "GCP",           category: "Infra",         description: "Cloud Run, Pub/Sub, BigQuery operations.",                              status: "Coming soon" },
  { name: "PagerDuty",     category: "Incident",      description: "Incident creation, escalation, resolution.",                            status: "Coming soon" },
];

const STATUS_STYLE: Record<Integration["status"], { color: string; bg: string; border: string }> = {
  GA:            { color: "#00D4FF", bg: "rgba(0,212,255,0.10)",   border: "rgba(0,212,255,0.28)" },
  Beta:          { color: "#FACC15", bg: "rgba(250,204,21,0.10)",  border: "rgba(250,204,21,0.28)" },
  "Coming soon": { color: "#A1A1AA", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
};

export default function IntegrationsPage() {
  return (
    <PageShell
      eyebrow="Integrations"
      title="Every adapter,"
      titleAccent="same trust layer."
      subtitle="No featured integration. No preferred surface. Every adapter flows through the same three pillars — context checked, action authorized, execution receipted."
      illustration={<IsoIntegrationGrid />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
        {INTEGRATIONS.map((i) => {
          const style = STATUS_STYLE[i.status];
          return (
            <div
              key={i.name}
              className="rounded-lg p-5 transition-colors hover:bg-white/[0.03]"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{i.name}</h3>
                  <p className="text-[10px] mt-0.5 uppercase tracking-wider font-semibold" style={{ color: "#71717A" }}>
                    {i.category}
                  </p>
                </div>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded"
                  style={{ color: style.color, background: style.bg, border: `1px solid ${style.border}` }}
                >
                  {i.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#A1A1AA" }}>
                {i.description}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="mt-12 p-6 rounded-xl text-center"
        style={{
          background: "rgba(0,212,255,0.04)",
          border: "1px solid rgba(0,212,255,0.15)",
        }}
      >
        <p className="text-sm font-semibold text-white mb-2">Need something custom?</p>
        <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: "#A1A1AA" }}>
          Every adapter is a thin wrapper around a REST or GraphQL client. Build your own in under 50 lines, or{" "}
          <a href="mailto:hello@statis.dev" className="text-[#00D4FF] hover:underline">
            let us build it for you
          </a>
          .
        </p>
      </div>
    </PageShell>
  );
}
