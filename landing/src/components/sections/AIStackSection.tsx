"use client";

import { motion } from "framer-motion";

const FRAMEWORKS = [
  { name: "CrewAI",           dot: "bg-[#7a756e]" },
  { name: "LangGraph",        dot: "bg-[#7a756e]" },
  { name: "AutoGen",          dot: "bg-[#7a756e]" },
  { name: "LlamaIndex",       dot: "bg-[#7a756e]" },
  { name: "Anthropic SDK",    dot: "bg-[#7a756e]" },
  { name: "Custom Agents",    dot: "bg-[#5a5a7a]" },
];

const ADAPTERS = [
  { name: "Stripe",       dot: "bg-[#7a756e]" },
  { name: "Salesforce",   dot: "bg-[#7a756e]" },
  { name: "HubSpot",      dot: "bg-[#7a756e]" },
  { name: "Zendesk",      dot: "bg-[#7a756e]" },
  { name: "Airflow",      dot: "bg-[#7a756e]" },
  { name: "PostgreSQL",   dot: "bg-[#7a756e]" },
];

const GUARANTEES = [
  { label: "Policy before execution",  ok: true  },
  { label: "Exactly-once lock",        ok: true  },
  { label: "SHA-256 receipt",          ok: true  },
  { label: "Adapter retries skipped",  ok: false },
];

function SmallBrandIcon({ name }: { name: string }) {
  switch (name) {
    case "CrewAI":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L4 14h7l-1 8 9-12h-7l2-8z" fill="#f59e0b" opacity="0.9"/>
        </svg>
      );
    case "LlamaIndex":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="3" width="5" height="18" rx="1.5" fill="#a855f7" opacity="0.9"/>
          <rect x="10" y="3" width="9" height="5" rx="1.5" fill="#a855f7"/>
          <rect x="10" y="16" width="9" height="5" rx="1.5" fill="#a855f7" opacity="0.7"/>
        </svg>
      );
    case "Anthropic SDK":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L21 20H3L12 3z" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinejoin="round"/>
          <line x1="7.5" y1="14.5" x2="16.5" y2="14.5" stroke="#d97706" strokeWidth="1.8"/>
        </svg>
      );
    case "Custom Agents":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" fill="none" stroke="#6a6a7a" strokeWidth="1.8"/>
          <line x1="12" y1="3" x2="12" y2="9" stroke="#6a6a7a" strokeWidth="1.5"/>
          <line x1="12" y1="15" x2="12" y2="21" stroke="#6a6a7a" strokeWidth="1.5"/>
          <line x1="3" y1="12" x2="9" y2="12" stroke="#6a6a7a" strokeWidth="1.5"/>
          <line x1="15" y1="12" x2="21" y2="12" stroke="#6a6a7a" strokeWidth="1.5"/>
        </svg>
      );
    case "Stripe":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 8c0-2.2-2-4-5-4-2.4 0-4.5 1.2-4.5 3.5 0 1.8 1.2 2.8 3.5 3.5 2.3.7 3.5 1.6 3.5 3C14.5 16 12.5 17 10 17c-3 0-4.5-1.5-4.5-3.5" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    case "Salesforce":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 18c-2.5 0-4.5-2-4.5-4.5 0-2.1 1.4-3.9 3.3-4.4C7.8 7.2 9.8 6 12 6c3.9 0 7 3.1 7 7h.5c1.4 0 2.5 1.1 2.5 2.5S21 18 19.5 18H8.5z" fill="#0ea5e9" opacity="0.85"/>
        </svg>
      );
    case "HubSpot":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H8l-4 4V5z" fill="none" stroke="#22c55e" strokeWidth="1.8"/>
          <line x1="8" y1="9" x2="16" y2="9" stroke="#22c55e" strokeWidth="1.5"/>
          <line x1="8" y1="13" x2="13" y2="13" stroke="#22c55e" strokeWidth="1.5"/>
        </svg>
      );
    case "Airflow":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="3" y1="8" x2="18" y2="8" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="3" y1="12" x2="15" y2="12" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="3" y1="16" x2="18" y2="16" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M16 5l5 3-5 3" fill="none" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "PostgreSQL":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
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

function EcoPill({ name, side, delay }: { name: string; dot: string; side: "left" | "right"; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -16 : 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 hover:bg-white/[0.04] hover:border-white/12 transition-all duration-200 cursor-default"
    >
      <SmallBrandIcon name={name} />
      <span className="text-sm text-[#8a8a9a]">{name}</span>
    </motion.div>
  );
}

export function AIStackSection() {
  return (
    <section className="relative py-32 overflow-hidden section-divider" id="ecosystem">

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto mb-20 text-center"
        >
          <p className="mb-4 text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#00ffc8]">
            Ecosystem
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#e8e5de] leading-[1.1] mb-5">
            The missing layer
            <br />
            <span className="text-gradient">in your AI stack.</span>
          </h2>
          <p className="text-[#7a7a8a] text-lg leading-relaxed">
            Drop Statis between your agent framework and your production systems. No rearchitecture. Works with everything you already run.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto_1fr] gap-6 items-center">

          <div className="space-y-2">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#5a5a7a] mb-5 text-center lg:text-right">
              Agent Frameworks
            </p>
            <div className="space-y-2">
              {FRAMEWORKS.map((f, i) => (
                <EcoPill key={f.name} name={f.name} dot={f.dot} side="left" delay={i * 0.06} />
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center self-center px-2">
            <div className="relative h-[2px] w-16 overflow-hidden bg-white/[0.04] rounded-full">
              <motion.div
                className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#00ffc8]/60 to-transparent rounded-full"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              />
            </div>
            <span className="text-[#00ffc8]/30 ml-1 text-xs">→</span>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-4 px-6"
          >
            <div className="relative rounded-3xl border border-[#00ffc8]/25 px-10 py-9 text-center shadow-[0_0_60px_rgba(0,255,200,0.08)] min-w-[160px] border-glow" style={{ background: 'linear-gradient(135deg, rgba(0,255,200,0.1) 0%, rgba(0,212,255,0.06) 100%)' }}>
              <motion.div
                className="absolute inset-0 rounded-3xl border border-[#00ffc8]/10"
                animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="text-xl font-bold text-[#00ffc8] mb-3 tracking-tight">Statis</div>
              <div className="space-y-2">
                {["Policy", "Lock", "Receipt", "State"].map(p => (
                  <div key={p} className="flex items-center justify-center gap-1.5">
                    <span className="text-[#00ffc8] text-[10px] font-mono">✓</span>
                    <span className="text-[10px] font-mono text-[#00ffc8]/70">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="hidden lg:flex items-center self-center px-2">
            <span className="text-[#00ffc8]/30 mr-1 text-xs">→</span>
            <div className="relative h-[2px] w-16 overflow-hidden bg-white/[0.04] rounded-full">
              <motion.div
                className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#00ffc8]/60 to-transparent rounded-full"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75, repeatDelay: 0.5 }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#5a5a7a] mb-5 text-center lg:text-left">
              Production Systems
            </p>
            <div className="space-y-2">
              {ADAPTERS.map((a, i) => (
                <EcoPill key={a.name} name={a.name} dot={a.dot} side="right" delay={i * 0.06 + 0.1} />
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-14 rounded-2xl border border-white/8 bg-[#0a0a12] px-8 py-5 flex flex-wrap justify-center gap-x-10 gap-y-3"
        >
          {GUARANTEES.map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`text-xs font-mono ${ok ? "text-[#00ffc8]" : "text-[#7a756e]"}`}>{ok ? "✓" : "✗"}</span>
              <span className={`text-xs ${ok ? "text-[#7a7a8a]" : "text-[#7a756e]/70 line-through"}`}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
