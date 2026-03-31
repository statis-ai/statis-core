"use client";

const FRAMEWORKS = [
  "CrewAI", "LangGraph", "AutoGen", "LlamaIndex", "Anthropic SDK", "Custom Agents",
];

const ADAPTERS = [
  "Stripe", "Salesforce", "HubSpot", "Zendesk", "Airflow", "PostgreSQL",
];

function Pill({ label, dim }: { label: string; dim?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-mono whitespace-nowrap flex-shrink-0 ${
      dim
        ? "border-white/5 text-[#4a4a6a] bg-white/[0.015]"
        : "border-white/8 text-[#5a5a7a] bg-white/[0.025]"
    }`}>
      {label}
    </span>
  );
}

function Divider() {
  return <span className="text-[#2a2a3a] font-mono text-xs flex-shrink-0">·</span>;
}

const ALL_ITEMS = [
  ...FRAMEWORKS.map(l => ({ label: l, dim: false })),
  { label: "—", dim: true },
  ...ADAPTERS.map(l => ({ label: l, dim: true })),
];

const DOUBLED = [...ALL_ITEMS, ...ALL_ITEMS];

export function TrustBarSection() {
  return (
    <section className="relative py-8 border-y border-white/[0.06] bg-white/[0.01] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080810] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080810] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-8 mb-3 px-6">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.25em] text-[#3a3a4a] whitespace-nowrap mx-auto">
          Works with
        </span>
      </div>

      <div className="overflow-hidden">
        <div className="marquee-track">
          {DOUBLED.map((item, i) => (
            item.label === "—"
              ? <Divider key={i} />
              : <Pill key={i} label={item.label} dim={item.dim} />
          ))}
        </div>
      </div>
    </section>
  );
}
