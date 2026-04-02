"use client";

import { useState } from "react";

const PYTHON_CODE = `from statis.integrations.crewai import StatisActionTool
from crewai import Agent

tool = StatisActionTool(
    action_type="apply_discount",
    adapter="stripe",
    policy="churn_retention_v1",
)

agent = Agent(role="Retention Agent", tools=[tool])
# Every call: proposed → evaluated → executed once → receipted`;

const TS_CODE = `import { StatisClient } from "statis-ai";

const statis = new StatisClient({ apiKey: process.env.STATIS_KEY });

const action = await statis.propose({
  action_type: "apply_discount",
  target: "acct-8821",
  params: { pct: 10 },
});

const receipt = await statis.waitForCompletion(action.id);
// receipt.hash  → "sha256:3f9a8b2c..."
// receipt.rule  → "churn_retention_v1@1.0"`;

const TABS = ["Python · CrewAI", "TypeScript"];

export function SDKQuickstartSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section
      className="relative py-28"
      id="quickstart"
      style={{ borderTop: "1px solid var(--border-muted)" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left — copy */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#52525b] mb-3">
              Developer first
            </p>
            <h2 className="font-mono font-bold text-white text-3xl sm:text-4xl leading-[1.15] mb-5">
              Five lines.<br />
              <span style={{ color: "var(--accent)" }}>Any agent framework.</span>
            </h2>
            <p className="text-[#a1a1aa] text-base leading-relaxed mb-8 max-w-sm" style={{ fontFamily: "var(--font-sans)" }}>
              Wrap your existing agent calls. No rearchitecture. Works with CrewAI, LangGraph, AutoGen, and any Python or TypeScript agent.
            </p>

            {/* Install block */}
            <div
              className="rounded border overflow-hidden mb-6"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5 border-b"
                style={{ borderColor: "var(--border-muted)", background: "rgba(255,255,255,0.02)" }}
              >
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/[0.07]" />
                <div className="w-2 h-2 rounded-full bg-white/[0.05]" />
                <span className="ml-2 text-[10px] font-mono text-[#3f3f46]">terminal</span>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { cmd: "pip install statis-ai",  comment: "# Python" },
                  { cmd: "npm install statis-ai",  comment: "# TypeScript" },
                ].map((line, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] font-mono">
                    <span style={{ color: "var(--accent)", opacity: 0.5 }}>$</span>
                    <span className="text-white">{line.cmd}</span>
                    <span className="text-[#3f3f46] ml-2">{line.comment}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {["Python SDK on PyPI", "TypeScript SDK on npm", "OpenAPI spec published"].map(badge => (
                <span
                  key={badge}
                  className="text-[10px] font-mono px-2.5 py-1 rounded text-[#52525b] border"
                  style={{ borderColor: "var(--border-muted)" }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right — code block */}
          <div
            className="rounded border overflow-hidden terminal-shadow"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            {/* Tabs */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: "var(--border-muted)", background: "rgba(255,255,255,0.015)" }}
            >
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/[0.07]" />
              <div className="w-2 h-2 rounded-full bg-white/[0.05]" />
              <div className="ml-3 flex gap-1">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className="px-3 py-1 rounded text-[10px] font-mono transition-all cursor-pointer"
                    style={{
                      background: activeTab === i ? "var(--accent-bg)" : "transparent",
                      color: activeTab === i ? "var(--accent)" : "#52525b",
                      border: activeTab === i ? "1px solid var(--accent-border)" : "1px solid transparent",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Code */}
            <pre className="p-5 font-mono text-[11px] leading-[1.85] text-[#71717a] overflow-x-auto whitespace-pre">
              <code>{activeTab === 0 ? PYTHON_CODE : TS_CODE}</code>
            </pre>

            {/* Footer */}
            <div
              className="px-4 py-2.5 border-t flex items-center justify-between"
              style={{ borderColor: "var(--border-muted)", background: "rgba(255,255,255,0.01)" }}
            >
              <span className="text-[10px] font-mono text-[#3f3f46]">
                statis-ai · {activeTab === 0 ? "PyPI" : "npm"}
              </span>
              <a
                href="https://docs.statis.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono transition-colors hover:text-white"
                style={{ color: "var(--accent)", opacity: 0.6 }}
              >
                Full docs →
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
