"use client";

const FRAMEWORKS = [
  "CrewAI", "LangGraph", "AutoGen", "LlamaIndex", "Anthropic SDK", "Custom Agents",
];

const ADAPTERS = [
  "Stripe", "Salesforce", "HubSpot", "Zendesk", "Airflow", "PostgreSQL",
];

function BrandIcon({ name }: { name: string }) {
  switch (name) {
    case "CrewAI":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="6" r="2.5" fill="#f97316"/>
          <circle cx="7" cy="16" r="2.5" fill="#f97316" opacity="0.85"/>
          <circle cx="17" cy="16" r="2.5" fill="#f97316" opacity="0.85"/>
          <line x1="12" y1="8.5" x2="7" y2="13.5" stroke="#f97316" strokeWidth="1" opacity="0.4"/>
          <line x1="12" y1="8.5" x2="17" y2="13.5" stroke="#f97316" strokeWidth="1" opacity="0.4"/>
          <line x1="7" y1="16" x2="17" y2="16" stroke="#f97316" strokeWidth="1" opacity="0.4"/>
        </svg>
      );
    case "LangGraph":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5" cy="12" r="2.5" fill="#6366f1"/>
          <circle cx="19" cy="6" r="2.5" fill="#6366f1"/>
          <circle cx="19" cy="18" r="2.5" fill="#6366f1"/>
          <line x1="7.2" y1="11" x2="16.8" y2="7" stroke="#6366f1" strokeWidth="1.2" opacity="0.6"/>
          <line x1="7.2" y1="13" x2="16.8" y2="17" stroke="#6366f1" strokeWidth="1.2" opacity="0.6"/>
          <line x1="19" y1="8.5" x2="19" y2="15.5" stroke="#6366f1" strokeWidth="1.2" opacity="0.6"/>
        </svg>
      );
    case "AutoGen":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L4 14h7l-1 8 9-12h-7l2-8z" fill="#f59e0b" opacity="0.9"/>
        </svg>
      );
    case "LlamaIndex":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="3" width="5" height="18" rx="1.5" fill="#a855f7" opacity="0.9"/>
          <rect x="10" y="3" width="9" height="5" rx="1.5" fill="#a855f7"/>
          <rect x="10" y="16" width="9" height="5" rx="1.5" fill="#a855f7" opacity="0.7"/>
        </svg>
      );
    case "Anthropic SDK":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L21 20H3L12 3z" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round"/>
          <line x1="7.5" y1="14.5" x2="16.5" y2="14.5" stroke="#d97706" strokeWidth="1.8"/>
        </svg>
      );
    case "Custom Agents":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" fill="none" stroke="#6a6a7a" strokeWidth="1.8"/>
          <line x1="12" y1="3" x2="12" y2="9" stroke="#6a6a7a" strokeWidth="1.5"/>
          <line x1="12" y1="15" x2="12" y2="21" stroke="#6a6a7a" strokeWidth="1.5"/>
          <line x1="3" y1="12" x2="9" y2="12" stroke="#6a6a7a" strokeWidth="1.5"/>
          <line x1="15" y1="12" x2="21" y2="12" stroke="#6a6a7a" strokeWidth="1.5"/>
        </svg>
      );
    case "Stripe":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 8c0-2.2-2-4-5-4-2.4 0-4.5 1.2-4.5 3.5 0 1.8 1.2 2.8 3.5 3.5 2.3.7 3.5 1.6 3.5 3C14.5 16 12.5 17 10 17c-3 0-4.5-1.5-4.5-3.5" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case "Salesforce":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 18c-2.5 0-4.5-2-4.5-4.5 0-2.1 1.4-3.9 3.3-4.4C7.8 7.2 9.8 6 12 6c3.9 0 7 3.1 7 7h.5c1.4 0 2.5 1.1 2.5 2.5S21 18 19.5 18H8.5z" fill="#0ea5e9" opacity="0.85"/>
        </svg>
      );
    case "HubSpot":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="2.5" fill="#f97316"/>
          <circle cx="12" cy="5" r="1.5" fill="#f97316" opacity="0.7"/>
          <circle cx="12" cy="19" r="1.5" fill="#f97316" opacity="0.7"/>
          <circle cx="5" cy="12" r="1.5" fill="#f97316" opacity="0.7"/>
          <circle cx="19" cy="12" r="1.5" fill="#f97316" opacity="0.7"/>
          <line x1="12" y1="7" x2="12" y2="9.5" stroke="#f97316" strokeWidth="1.2" opacity="0.5"/>
          <line x1="12" y1="14.5" x2="12" y2="17" stroke="#f97316" strokeWidth="1.2" opacity="0.5"/>
          <line x1="7" y1="12" x2="9.5" y2="12" stroke="#f97316" strokeWidth="1.2" opacity="0.5"/>
          <line x1="14.5" y1="12" x2="17" y2="12" stroke="#f97316" strokeWidth="1.2" opacity="0.5"/>
        </svg>
      );
    case "Zendesk":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H8l-4 4V5z" fill="none" stroke="#22c55e" strokeWidth="1.8"/>
          <line x1="8" y1="9" x2="16" y2="9" stroke="#22c55e" strokeWidth="1.5"/>
          <line x1="8" y1="13" x2="13" y2="13" stroke="#22c55e" strokeWidth="1.5"/>
        </svg>
      );
    case "Airflow":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="3" y1="8" x2="18" y2="8" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="3" y1="12" x2="15" y2="12" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="3" y1="16" x2="18" y2="16" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M16 5l5 3-5 3" fill="none" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "PostgreSQL":
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="10" rx="7" ry="6" fill="none" stroke="#3b82f6" strokeWidth="1.8"/>
          <path d="M19 10c2 1 2 4 0 5" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="8" y1="16" x2="8" y2="21" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="16" y1="16" x2="16" y2="21" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
}

function Pill({ name, dim }: { name: string; dim?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-mono whitespace-nowrap flex-shrink-0 ${
      dim
        ? "border-white/5 text-[#4a4a6a] bg-white/[0.015]"
        : "border-white/8 text-[#5a5a7a] bg-white/[0.025]"
    }`}>
      <BrandIcon name={name} />
      {name}
    </span>
  );
}

const FRAMEWORK_ITEMS = FRAMEWORKS.map(l => ({ label: l, dim: false }));
const ADAPTER_ITEMS = ADAPTERS.map(l => ({ label: l, dim: true }));

const DOUBLED_FRAMEWORKS = [...FRAMEWORK_ITEMS, ...FRAMEWORK_ITEMS];
const DOUBLED_ADAPTERS = [...ADAPTER_ITEMS, ...ADAPTER_ITEMS];

export function TrustBarSection() {
  return (
    <section className="relative py-10 border-y border-white/[0.06] bg-white/[0.01] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080810] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080810] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-8 mb-4 px-6">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.25em] text-[#3a3a4a] whitespace-nowrap mx-auto">
          Works with
        </span>
      </div>

      <div className="overflow-hidden flex flex-col gap-2.5">
        <div className="marquee-track">
          {DOUBLED_FRAMEWORKS.map((item, i) => (
            <Pill key={i} name={item.label} dim={item.dim} />
          ))}
        </div>
        <div className="marquee-track-reverse">
          {DOUBLED_ADAPTERS.map((item, i) => (
            <Pill key={i} name={item.label} dim={item.dim} />
          ))}
        </div>
      </div>
    </section>
  );
}
