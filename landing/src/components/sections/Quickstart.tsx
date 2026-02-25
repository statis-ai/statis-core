"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AICard } from "@/components/ui/AICard";

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

const curlSnippet = `# Publish a semantic event
curl -X POST https://api.example/v1/events \\
  -H "Authorization: Bearer sts_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "entity_type": "account",
    "entity_id": "acct_123",
    "event_type": "support.incident_reported",
    "payload": { "severity": "high" }
  }'

# Read materialized state
curl https://api.example/v1/state/account/acct_123 \\
  -H "Authorization: Bearer sts_..."`;

const tabs = [
  { id: "ts" as const, label: "TypeScript", code: tsSnippet },
  { id: "py" as const, label: "Python", code: pySnippet },
  { id: "curl" as const, label: "cURL", code: curlSnippet },
];

type TabId = (typeof tabs)[number]["id"];

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="5" width="8" height="8" rx="1.5" />
      <path d="M3 11V3.5A.5.5 0 013.5 3H11" strokeLinecap="round" />
    </svg>
  );
}

export function Quickstart() {
  const [active, setActive] = useState<TabId>("ts");
  const [copied, setCopied] = useState(false);
  const activeTab = tabs.find((t) => t.id === active)!;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(activeTab.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeTab.code]);

  return (
    <section className="border-t border-brand-border py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-32"
          >
            <span className="mb-4 inline-block rounded-full bg-brand-accent/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-accent">
              Quickstart
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Start in minutes
            </h2>
            <p className="mt-4 max-w-md text-brand-muted">
              Publish events and read state with a few lines of code. The same
              pattern works from any language or tool.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a href="https://docs.statis.dev" target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg">
                  View Docs
                </Button>
              </a>
              <Button variant="ghost" size="lg">
                View Demo
              </Button>
            </div>
          </motion.div>

          {/* Right: code panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <AICard className="overflow-hidden" interactive={false}>
              {/* Tab bar */}
              <div className="flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActive(tab.id)}
                      className={cn(
                        "relative px-5 py-3 text-sm font-medium transition-colors",
                        active === tab.id
                          ? "text-brand-accent"
                          : "text-brand-muted hover:text-white",
                      )}
                    >
                      {tab.label}
                      {active === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase text-brand-muted">
                    Example
                  </span>
                  <button
                    onClick={handleCopy}
                    className="mr-4 flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-white"
                  >
                    <CopyIcon />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Code */}
              <div className="overflow-x-auto p-6">
                <pre className="font-mono text-sm leading-relaxed text-brand-muted">
                  <code>{activeTab.code}</code>
                </pre>
              </div>

              <div className="border-t border-white/[0.06] px-6 py-3">
                <p className="text-xs text-brand-muted/60">
                  Example only — SDK interface subject to change.
                </p>
              </div>
            </AICard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
