import type { Metadata } from "next";
import { PageV6Shell, HeroV6 } from "@/components/v6/PageV6Shell";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — Statis",
  description:
    "Day 1 free: @statis.gate decorator, signed approval pages, receipts. Teams: Slack approvals, pre-built adapters, operator dashboards. Enterprise: VPC deploy, SSO, SOC2.",
};

type Tier = {
  badge: string;
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: { label: string; href: string; primary: boolean };
  accent: boolean;
};

const TIERS: Tier[] = [
  {
    badge: "Free · open beta",
    name: "Day 1",
    price: "Free",
    priceNote: "No credit card. No expiry.",
    features: [
      "@statis.gate decorator",
      "Signed-URL approval page",
      "SHA-256 receipt ledger",
      "Policy engine (deterministic rules)",
      "Policy graduation (3rd-identical → YAML rule)",
      "Python SDK + TypeScript SDK",
      "statis init CLI",
    ],
    cta: { label: "Try in 5 minutes →", href: "https://docs.statis.dev/docs/quickstart", primary: true },
    accent: false,
  },
  {
    badge: "Teams",
    name: "Teams",
    price: "Contact us",
    priceNote: "Per seat · monthly or annual",
    features: [
      "Everything in Day 1",
      "Slack approval notifications",
      "Pre-built adapters (Stripe, Airflow, Salesforce, Zendesk, HubSpot, GitHub)",
      "Operator dashboards",
      "Multi-seat with RBAC",
      "30-day execution history",
      "Cost dashboard across agents",
    ],
    cta: { label: "Book 30 min with a founder", href: "https://calendly.com/aniket-statis/30min", primary: true },
    accent: true,
  },
  {
    badge: "Enterprise",
    name: "Enterprise",
    price: "Custom",
    priceNote: "Annual contract",
    features: [
      "Everything in Teams",
      "VPC / on-prem deployment",
      "SSO + SCIM",
      "SOC2-export receipts",
      "Offline-verifiable cryptographic proofs",
      "Compliance bundle (HIPAA, GDPR)",
      "Dedicated CSM",
    ],
    cta: { label: "Book 30 min with a founder", href: "https://calendly.com/aniket-statis/30min", primary: false },
    accent: false,
  },
];

export default function PricingPage() {
  return (
    <PageV6Shell currentRoute="/pricing">
      <HeroV6
        eyebrowNum="§ 01"
        eyebrowText="Pricing"
        title="Start free."
        titleStrong="Scale when you need to."
        subtitle="Day 1 is free and stays free. Teams adds Slack approvals and pre-built adapters. Enterprise adds VPC deploy, SSO, and compliance exports."
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px 64px" }}>
        {/* Main tiers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                background: tier.accent ? "var(--accent-bg)" : "var(--bg-surface)",
                border: tier.accent ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ marginBottom: 4 }}>
                <span
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: tier.accent ? "var(--accent)" : "var(--text-subtle)",
                    padding: "2px 8px",
                    border: `1px solid ${tier.accent ? "var(--accent-border)" : "var(--border)"}`,
                    borderRadius: "2px",
                  }}
                >
                  {tier.badge}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "var(--font)",
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "var(--text)",
                  margin: "16px 0 4px",
                }}
              >
                {tier.price}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font)",
                  fontSize: 11,
                  color: "var(--text-subtle)",
                  marginBottom: 20,
                }}
              >
                {tier.priceNote}
              </p>

              <div style={{ borderTop: "1px solid var(--border)", marginBottom: 20 }} />

              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  listStyle: "none",
                  padding: 0,
                  flex: 1,
                  marginBottom: 24,
                }}
              >
                {tier.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontFamily: "var(--font)",
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: "var(--text-2)",
                    }}
                  >
                    <Check
                      size={14}
                      style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={tier.cta.href}
                rel={tier.cta.href.startsWith("http") ? "noopener" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 20px",
                  fontFamily: "var(--font)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  borderRadius: "3px",
                  transition: "background 0.15s",
                  background: tier.accent ? "var(--ink, #1a1a1a)" : "transparent",
                  color: tier.accent ? "var(--paper, #fbf8f1)" : "var(--text)",
                  border: tier.accent ? "none" : "1px solid var(--border-strong)",
                }}
              >
                {tier.cta.label}
              </a>
            </div>
          ))}
        </div>

        {/* Beta note */}
        <p
          style={{
            fontFamily: "var(--font)",
            fontSize: 12,
            color: "var(--text-subtle)",
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          Developer Cloud is free during open beta. We&apos;ll announce pricing 30 days before any
          charges start — early teams are grandfathered for the first year.
        </p>

        {/* statis-kit cross-link panel */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: 6,
              }}
            >
              Looking for offline pre-call hygiene?
            </p>
            <p
              style={{
                fontFamily: "var(--font)",
                fontSize: 12,
                color: "var(--text-muted)",
                maxWidth: 480,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "var(--text)" }}>statis-kit</strong> ships guard, compress, and
              meter as a separate package — free, in-process, no network, MIT license. A different
              product, separate from <code style={{ color: "var(--accent)", fontSize: "0.9em" }}>@statis.gate</code>.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
            <a
              href="https://pypi.org/project/statis-kit/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font)",
                fontSize: 11,
                color: "var(--accent)",
                textDecoration: "none",
                border: "1px solid var(--accent-border)",
                padding: "6px 14px",
                borderRadius: "2px",
              }}
            >
              pip install statis-kit →
            </a>
            <a
              href="/debug"
              style={{
                fontFamily: "var(--font)",
                fontSize: 11,
                color: "var(--text-muted)",
                textDecoration: "none",
                border: "1px solid var(--border)",
                padding: "6px 14px",
                borderRadius: "2px",
              }}
            >
              Try the playground →
            </a>
          </div>
        </div>
      </div>
    </PageV6Shell>
  );
}
