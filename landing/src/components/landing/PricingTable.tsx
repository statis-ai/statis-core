"use client";

import { Check } from "lucide-react";
import { CopyCommand } from "@/components/ui/CopyCommand";
import { SectionReveal } from "./shared";

type Feature = {
  title: string;
  desc: string;
};

type Tier = {
  id: string;
  badge: string;
  name: string;
  subtitle: string;
  price: string;
  priceUnit?: string;
  priceNote: string;
  persona: string;
  includes?: string;
  features: Feature[];
  cta: React.ReactNode;
  accent: boolean;
};

const TIERS: Tier[] = [
  {
    id: "kit",
    badge: "Open source",
    name: "Context Kit",
    subtitle: "For individual developers",
    price: "Free",
    priceNote: "MIT license \u00B7 pip install statis",
    persona: "Individual / hobbyist",
    features: [
      { title: "Context compression", desc: "Auto-summarize old turns, stay under limit" },
      { title: "Basic injection detection", desc: "Pattern-based, local, no API call" },
      { title: "Token cost estimator", desc: "See cost per turn before it runs" },
      { title: "Context diff viewer", desc: "See exactly what changed turn-to-turn" },
      { title: "Works with any framework", desc: "OpenAI, Anthropic, LangChain, custom" },
    ],
    cta: (
      <a
        href="https://github.com/statis-ai/statis-sdk"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full text-[13px] font-medium transition-all duration-200"
        style={{
          border: "1px solid rgba(255,255,255,0.14)",
          color: "var(--text)",
          background: "rgba(255,255,255,0.02)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        }}
      >
        View on GitHub
      </a>
    ),
    accent: false,
  },
  {
    id: "cloud",
    badge: "Most popular",
    name: "Developer Cloud",
    subtitle: "For teams and startups",
    price: "$49",
    priceUnit: "/ mo per workspace",
    priceNote: "Startup / small team",
    persona: "Startup / small team",
    includes: "Everything in Context Kit",
    features: [
      { title: "Everything in Context Kit", desc: "Plus cloud sync and team sharing" },
      { title: "Policy editor UI", desc: "Visual rules, no YAML required" },
      { title: "Sanitization templates", desc: "PII, keys, credentials \u2014 pre-built" },
      { title: "Execution history", desc: "30-day context audit trail" },
      { title: "Cost dashboard", desc: "Token spend across all agents" },
    ],
    cta: (
      <a
        href="mailto:hello@statis.dev?subject=Developer%20Cloud%20beta"
        className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full text-[13px] font-medium transition-all duration-200"
        style={{
          background: "#EDEDED",
          color: "#000000",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#EDEDED";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Join the beta
      </a>
    ),
    accent: true,
  },
  {
    id: "enterprise",
    badge: "Enterprise",
    name: "Governance Platform",
    subtitle: "For regulated industries",
    price: "Custom",
    priceNote: "Annual contract \u00B7 SOC2 \u00B7 SSO",
    persona: "CISO / compliance buyer",
    includes: "Everything in Developer Cloud",
    features: [
      { title: "Everything in Developer Cloud", desc: "Unlimited workspaces, agents" },
      { title: "Admission control engine", desc: "Role \u00D7 task \u00D7 data classification" },
      { title: "Immutable audit store", desc: "Context snapshots, compliance-ready" },
      { title: "Policy approval workflows", desc: "Compliance sign-off before deploy" },
      { title: "On-prem / VPC deployment", desc: "Your infrastructure, your data" },
    ],
    cta: (
      <a
        href="mailto:hello@statis.dev?subject=Enterprise%20inquiry"
        className="inline-flex items-center justify-center w-full px-5 py-3 rounded-full text-[13px] font-medium transition-all duration-200"
        style={{
          border: "1px solid rgba(255,255,255,0.14)",
          color: "var(--text)",
          background: "rgba(255,255,255,0.02)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        }}
      >
        Contact sales
      </a>
    ),
    accent: false,
  },
];

function TierCard({ tier, index }: { tier: Tier; index: number }) {
  const isAccent = tier.accent;

  return (
    <SectionReveal delay={index * 0.1}>
      <div
        className="group relative h-full rounded-2xl p-8 flex flex-col transition-all duration-300"
        style={{
          background: isAccent
            ? "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)"
            : "rgba(255,255,255,0.02)",
          border: isAccent
            ? "1px solid rgba(255,255,255,0.18)"
            : "1px solid rgba(255,255,255,0.06)",
          boxShadow: isAccent
            ? "0 8px 60px -12px rgba(0,0,0,0.5), 0 0 80px -20px rgba(255,255,255,0.06)"
            : "none",
        }}
        onMouseEnter={(e) => {
          if (isAccent) {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            e.currentTarget.style.boxShadow =
              "0 12px 80px -12px rgba(0,0,0,0.6), 0 0 100px -20px rgba(255,255,255,0.1)";
            e.currentTarget.style.transform = "translateY(-4px)";
          } else {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
            e.currentTarget.style.background = "rgba(255,255,255,0.035)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          if (isAccent) {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            e.currentTarget.style.boxShadow =
              "0 8px 60px -12px rgba(0,0,0,0.5), 0 0 80px -20px rgba(255,255,255,0.06)";
            e.currentTarget.style.transform = "translateY(0)";
          } else {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {/* Badge */}
        <div className="mb-5">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium tracking-wide"
            style={{
              background: isAccent ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
              color: isAccent ? "#fff" : "var(--text-2)",
              border: `1px solid ${isAccent ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {tier.badge}
          </span>
        </div>

        {/* Tier name + subtitle */}
        <h3 className="text-[22px] font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>
          {tier.name}
        </h3>
        <p className="text-[13px] mb-6" style={{ color: isAccent ? "var(--accent)" : "var(--text-2)" }}>
          {tier.subtitle}
        </p>

        {/* Divider */}
        <div className="mb-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

        {/* Price */}
        <div className="mb-1">
          <span
            className="text-[36px] font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {tier.price}
          </span>
          {tier.priceUnit && (
            <span className="text-[14px] ml-1" style={{ color: "var(--text-muted)" }}>
              {tier.priceUnit}
            </span>
          )}
        </div>
        <p className="text-[12px] mb-6" style={{ color: "var(--text-muted)" }}>
          {tier.priceNote}
        </p>

        {/* Persona pill */}
        <div className="mb-8">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-medium"
            style={{
              background: isAccent ? "var(--accent-bg)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${isAccent ? "var(--accent-border)" : "rgba(255,255,255,0.06)"}`,
              color: isAccent ? "var(--accent)" : "var(--text-2)",
            }}
          >
            {tier.persona}
          </span>
        </div>

        {/* Features */}
        <div className="flex-1 space-y-5 mb-8">
          {tier.features.map((f) => (
            <div key={f.title} className="flex gap-3">
              <span className="mt-0.5 flex-shrink-0">
                <Check size={16} style={{ color: "var(--accent)" }} />
              </span>
              <div>
                <div className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>
                  {f.title}
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Install chip for Kit tier */}
        {tier.id === "kit" && (
          <div className="mb-4">
            <CopyCommand command="pip install statis-kit" />
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto">{tier.cta}</div>
      </div>
    </SectionReveal>
  );
}

export function PricingTable() {
  return (
    <div className="space-y-16">
      {/* Intro writeup */}
      <SectionReveal>
        <div className="text-center max-w-3xl mx-auto mb-4">
          <h2
            className="font-bold tracking-[-0.02em] mb-5"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", color: "var(--text)" }}
          >
            The product tiers
          </h2>
          <p className="text-[15px] md:text-[16px] leading-relaxed" style={{ color: "var(--text-2)" }}>
            Start with Context Kit &mdash; open source, fully local, MIT licensed. When your team needs
            cloud sync, policy management, and execution history, upgrade to Developer Cloud.
            Regulated industries get on-prem deployment, immutable audit, and compliance exports
            with Enterprise Governance.
          </p>
        </div>
      </SectionReveal>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {TIERS.map((tier, i) => (
          <TierCard key={tier.id} tier={tier} index={i} />
        ))}
      </div>

      <SectionReveal>
        <p
          className="text-[12px] text-center max-w-2xl mx-auto"
          style={{ color: "var(--text-muted)" }}
        >
          Developer Cloud is free while in beta. We&apos;ll announce pricing before any charges
          start &mdash; and grandfather early teams for the first year.
        </p>
      </SectionReveal>
    </div>
  );
}
