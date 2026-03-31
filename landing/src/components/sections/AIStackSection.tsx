"use client";

import { motion } from "framer-motion";

const FRAMEWORKS = [
  { name: "CrewAI",           dot: "bg-emerald-400" },
  { name: "LangGraph",        dot: "bg-violet-400"  },
  { name: "AutoGen",          dot: "bg-sky-400"      },
  { name: "LlamaIndex",       dot: "bg-amber-400"   },
  { name: "Anthropic SDK",    dot: "bg-[#00ffc8]"   },
  { name: "Custom Agents",    dot: "bg-[#5a5a7a]"   },
];

const ADAPTERS = [
  { name: "Stripe",       dot: "bg-violet-400" },
  { name: "Salesforce",   dot: "bg-sky-400"    },
  { name: "HubSpot",      dot: "bg-emerald-400"},
  { name: "Zendesk",      dot: "bg-amber-400"  },
  { name: "Airflow",      dot: "bg-rose-400"   },
  { name: "PostgreSQL",   dot: "bg-[#00ffc8]"  },
];

const GUARANTEES = [
  { label: "Policy before execution",  ok: true  },
  { label: "Exactly-once lock",        ok: true  },
  { label: "SHA-256 receipt",          ok: true  },
  { label: "Adapter retries skipped",  ok: false },
];

function EcoPill({ name, dot, side, delay }: { name: string; dot: string; side: "left" | "right"; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -16 : 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-2.5"
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      <span className="text-xs font-mono text-[#8a8a9a]">{name}</span>
    </motion.div>
  );
}

export function AIStackSection() {
  return (
    <section className="relative py-32 overflow-hidden section-divider" id="ecosystem">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[350px] bg-[#00ffc8]/4 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">

        {/* Header */}
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
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
            The missing layer
            <br />
            <span className="text-gradient">in your AI stack.</span>
          </h2>
          <p className="text-[#7a7a8a] text-lg leading-relaxed">
            Drop Statis between your agent framework and your production systems. No rearchitecture. Works with everything you already run.
          </p>
        </motion.div>

        {/* 3-column diagram */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">

          {/* Left — Agent Frameworks */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#4a4a6a] mb-4 text-center lg:text-right">
              Agent Frameworks
            </p>
            <div className="space-y-2">
              {FRAMEWORKS.map((f, i) => (
                <EcoPill key={f.name} name={f.name} dot={f.dot} side="left" delay={i * 0.06} />
              ))}
            </div>
          </div>

          {/* Center — Statis node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-4 px-6"
          >
            {/* Arrow in */}
            <div className="hidden lg:flex items-center gap-1 text-[#00ffc8]/30 font-mono text-xs">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#00ffc8]/40" />
              <span>→</span>
            </div>

            {/* Center card */}
            <div className="relative rounded-3xl border border-[#00ffc8]/25 bg-[#00ffc8]/6 px-8 py-7 text-center shadow-[0_0_60px_rgba(0,255,200,0.08)] min-w-[160px] border-glow">
              <div className="text-xl font-bold text-[#00ffc8] mb-3 tracking-tight">Statis</div>
              <div className="space-y-2">
                {["Policy", "Lock", "Receipt", "State"].map(p => (
                  <div key={p} className="flex items-center justify-center gap-1.5">
                    <span className="text-emerald-400 text-[10px] font-mono">✓</span>
                    <span className="text-[10px] font-mono text-[#00ffc8]/70">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow out */}
            <div className="hidden lg:flex items-center gap-1 text-[#00ffc8]/30 font-mono text-xs">
              <span>→</span>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#00ffc8]/40" />
            </div>
          </motion.div>

          {/* Right — Production Systems */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#4a4a6a] mb-4 text-center lg:text-left">
              Production Systems
            </p>
            <div className="space-y-2">
              {ADAPTERS.map((a, i) => (
                <EcoPill key={a.name} name={a.name} dot={a.dot} side="right" delay={i * 0.06 + 0.1} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom guarantee strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-14 rounded-2xl border border-white/8 bg-[#0a0a12] px-8 py-5 flex flex-wrap justify-center gap-x-10 gap-y-3"
        >
          {GUARANTEES.map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`text-xs font-mono ${ok ? "text-emerald-400" : "text-rose-400"}`}>{ok ? "✓" : "✗"}</span>
              <span className={`text-xs ${ok ? "text-[#7a7a8a]" : "text-rose-400/70 line-through"}`}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
