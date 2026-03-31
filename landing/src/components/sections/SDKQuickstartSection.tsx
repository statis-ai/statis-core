"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PYTHON_CODE = `from statis.integrations.crewai import StatisActionTool
from crewai import Agent

# Drop-in CrewAI integration
tool = StatisActionTool(
    action_type="apply_discount",
    adapter="stripe",
    policy="churn_retention_v1",
)

agent = Agent(
    role="Retention Agent",
    tools=[tool],
    # ... your existing agent config
)
# Every tool call: proposed → evaluated → executed once → receipted`;

const TS_CODE = `import { StatisClient } from "statis-ai";

const statis = new StatisClient({
  apiKey: process.env.STATIS_KEY,
});

// Propose — nothing executes yet
const action = await statis.propose({
  action_type: "apply_discount",
  target: "acct-8821",
  params: { pct: 10 },
});

// Wait for policy evaluation + execution
const receipt = await statis.waitForCompletion(action.id);
// receipt.hash → "sha256:3f9a8b2c..."
// receipt.rule → "churn_retention_v1@1.0"`;

const INSTALL_LINES = [
  { prompt: "$", cmd: "pip install statis-ai", comment: "# Python" },
  { prompt: "$", cmd: "npm install statis-ai", comment: "# TypeScript" },
];

const TABS = ["Python · CrewAI", "TypeScript"];

export function SDKQuickstartSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="relative py-32 overflow-hidden section-divider" id="quickstart">
      <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-[#00ffc8]/4 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#00ffc8]">
              Developer First
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-5">
              Five lines.
              <br />
              <span className="text-gradient">Any agent framework.</span>
            </h2>
            <p className="text-[#7a7a8a] text-lg leading-relaxed mb-8">
              Statis wraps your existing agent calls. No rearchitecture. Propose, evaluate, execute exactly once, receipt. Works with CrewAI, LangGraph, AutoGen, and any Python or TypeScript agent.
            </p>

            {/* Install block */}
            <div className="rounded-2xl border border-white/8 bg-[#07090f] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-white/[0.02]">
                <div className="w-2 h-2 rounded-full bg-rose-500/60" />
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                <span className="ml-2 text-[10px] font-mono text-[#3a3a4a]">terminal</span>
              </div>
              <div className="p-4 space-y-1.5">
                {INSTALL_LINES.map((line, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-[12px]">
                    <span className="text-[#00ffc8]/50">{line.prompt}</span>
                    <span className="text-[#c4c4d4]">{line.cmd}</span>
                    <span className="text-[#3a3a4a] ml-2">{line.comment}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Python SDK on PyPI",
                "TypeScript SDK on npm",
                "OpenAPI spec published",
              ].map(badge => (
                <span key={badge} className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/8 text-[#5a5a7a]">
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right — tabbed code block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-3xl border border-white/10 bg-[#07090f] overflow-hidden terminal-glow"
          >
            {/* Chrome bar with tabs */}
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/6 bg-white/[0.02]">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <div className="ml-4 flex gap-1">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                      activeTab === i
                        ? "bg-[#00ffc8]/10 text-[#00ffc8] border border-[#00ffc8]/20"
                        : "text-[#4a4a6a] hover:text-white border border-transparent"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Code */}
            <pre className="p-5 font-mono text-[11px] leading-[1.85] text-[#8a8aaa] overflow-x-auto whitespace-pre">
              <code>{activeTab === 0 ? PYTHON_CODE : TS_CODE}</code>
            </pre>

            {/* Bottom bar */}
            <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.015] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#3a3a4a]">statis-ai · {activeTab === 0 ? "PyPI" : "npm"}</span>
              <a
                href="https://docs.statis.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-[#00ffc8]/60 hover:text-[#00ffc8] transition-colors cursor-pointer"
              >
                Full SDK docs →
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
