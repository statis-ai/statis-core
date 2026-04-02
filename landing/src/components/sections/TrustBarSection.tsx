"use client";

const FRAMEWORKS = ["CrewAI", "LangGraph", "AutoGen", "LlamaIndex", "Anthropic SDK", "Custom Agents"];
const ADAPTERS   = ["Stripe", "Salesforce", "HubSpot", "Zendesk", "Airflow", "PostgreSQL"];

function Pill({ name }: { name: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[11px] font-mono whitespace-nowrap flex-shrink-0 text-[#52525b] border border-white/[0.06]"
      style={{ background: "var(--bg-surface)" }}
    >
      {name}
    </span>
  );
}

const DOUBLED_FRAMEWORKS = [...FRAMEWORKS, ...FRAMEWORKS];
const DOUBLED_ADAPTERS   = [...ADAPTERS,   ...ADAPTERS];

export function TrustBarSection() {
  return (
    <section
      className="relative py-8 overflow-hidden"
      style={{ borderTop: "1px solid var(--border-muted)", borderBottom: "1px solid var(--border-muted)" }}
    >
      {/* fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
        style={{ background: "linear-gradient(to right, var(--bg), transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
        style={{ background: "linear-gradient(to left, var(--bg), transparent)" }} />

      <p className="text-center text-[10px] font-mono text-[#3f3f46] uppercase tracking-[0.25em] mb-4">
        Works with
      </p>

      <div className="flex flex-col gap-2 overflow-hidden">
        <div className="marquee-track">
          {DOUBLED_FRAMEWORKS.map((name, i) => <Pill key={i} name={name} />)}
        </div>
        <div className="marquee-track-reverse">
          {DOUBLED_ADAPTERS.map((name, i) => <Pill key={i} name={name} />)}
        </div>
      </div>
    </section>
  );
}
