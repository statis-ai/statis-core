"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const tsSnippet = `import { StatisClient } from "@statis/sdk";

const statis = new StatisClient({ apiKey: "sts_..." });

// Publish a semantic event
await statis.publish({
  entityType: "account",
  entityId: "acct_123",
  eventType: "support.incident_reported",
  payload: { severity: "high", source: "zendesk" },
});

// Read materialized state
const state = await statis.getState("account", "acct_123");
// => { rev: 42, state: { churn_risk: true, ... }, state_hash: "ab12..." }`;

const pySnippet = `from statis import StatisClient

client = StatisClient(api_key="sts_...")

# Publish a semantic event
client.publish(
    entity_type="account",
    entity_id="acct_123",
    event_type="support.incident_reported",
    payload={"severity": "high", "source": "zendesk"},
)

# Read materialized state
state = client.get_state("account", "acct_123")
# => {"rev": 42, "state": {"churn_risk": True, ...}, "state_hash": "ab12..."}`;

const tabs = [
  { id: "ts", label: "TypeScript", code: tsSnippet },
  { id: "py", label: "Python", code: pySnippet },
] as const;

export function SDKQuickstart() {
  const [active, setActive] = useState<"ts" | "py">("ts");
  const activeTab = tabs.find((t) => t.id === active)!;

  return (
    <section className="border-t border-brand-border py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Start in minutes
            </h2>
            <p className="mt-4 text-brand-muted">
              Publish events and read state with a few lines of code.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="glass-card overflow-hidden rounded-xl">
            {/* Tab bar */}
            <div className="flex border-b border-brand-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "px-6 py-3 text-sm font-medium transition-colors",
                    active === tab.id
                      ? "border-b-2 border-brand-accent text-brand-accent"
                      : "text-brand-muted hover:text-white",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code block */}
            <div className="overflow-x-auto p-6">
              <pre className="font-mono text-sm leading-relaxed text-brand-muted">
                <code>{activeTab.code}</code>
              </pre>
            </div>

            <div className="border-t border-brand-border px-6 py-3">
              <p className="text-xs text-brand-muted/60">
                Example only — SDK interface subject to change.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
