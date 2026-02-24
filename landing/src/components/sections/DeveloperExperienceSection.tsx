"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DeveloperExperienceSection() {
    const [activeTab, setActiveTab] = useState(0);

    const snippets = [
        {
            id: "write",
            label: "1. Write (Publish Event)",
            description: "Support agent logs a new fact; Statis handles the conflict resolution.",
            code: `// Support agent logs a new fact
const response = await statis.events.publish({
  entity_id: "acct_8891",
  agent_id: "agent_support_alpha",
  role: "support",
  type: "customer_sentiment_update",
  fact: "Customer is severely blocked by outage and threatened churn."
});

// Returns: { rev: 105, event_id: "evt_9x8...", status: "committed" }`
        },
        {
            id: "subscribe",
            label: "2. Subscribe (Push Rules)",
            description: "Configure Sales Agent to listen for churn risk transitions.",
            code: `// Configure Sales Agent to listen for churn risk
await statis.subscriptions.create({
  filter: {
    topics: ["state_transition"],
    predicates: [{ field: "churn_risk", operator: "eq", value: true }]
  },
  delivery: {
    webhook_url: "https://sales-agent.internal/webhook",
    debounce_ms: 1000
  }
});`
        },
        {
            id: "replay",
            label: "3. Replay (Time Machine)",
            description: "Debugging: Reconstruct the exact state the Sales agent saw at rev 105.",
            code: `// Reconstruct the exact state at rev 105
const audit = await statis.state.at({ 
  entity_id: "acct_8891", 
  rev: 105 
});

console.log(audit.state_hash); // Validates deterministic state
console.log(audit.provenance); // Shows Support agent caused change`
        }
    ];

    return (
        <section className="relative overflow-hidden py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-base/7 font-semibold text-brand-accent uppercase tracking-wide">DEVELOPER EXPERIENCE</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        An API built for determinism.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Tabs */}
                    <div className="lg:col-span-4 space-y-4">
                        {snippets.map((snippet, index) => (
                            <button
                                key={snippet.id}
                                onClick={() => setActiveTab(index)}
                                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border ${activeTab === index
                                        ? "bg-white/10 border-brand-accent shadow-[0_0_15px_rgba(0,255,170,0.15)]"
                                        : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                                    }`}
                            >
                                <h3 className={`font-semibold text-lg ${activeTab === index ? "text-brand-accent" : "text-white"}`}>
                                    {snippet.label}
                                </h3>
                                <p className="mt-2 text-sm text-brand-muted">
                                    {snippet.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Code Window */}
                    <div className="lg:col-span-8">
                        <div className="relative rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                                <span className="ml-2 text-xs font-mono text-brand-muted">index.ts</span>
                            </div>
                            <div className="p-6 overflow-x-auto min-h-[300px]">
                                <AnimatePresence mode="wait">
                                    <motion.pre
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="font-mono text-sm leading-loose"
                                    >
                                        <code className="text-gray-300">
                                            {/* Simple syntax highlighting via spans */}
                                            {snippets[activeTab].code.split('\n').map((line, i) => {
                                                // Very basic coloring for demo purposes
                                                let coloredLine = line;
                                                coloredLine = coloredLine.replace(/(\/\/.*)/g, '<span class="text-brand-muted">$1</span>');
                                                coloredLine = coloredLine.replace(/(const|await|true)/g, '<span class="text-violet-400">$1</span>');
                                                coloredLine = coloredLine.replace(/("[^"]*")/g, '<span class="text-green-400">$1</span>');
                                                coloredLine = coloredLine.replace(/([0-9]+)/g, '<span class="text-cyan-400">$1</span>');

                                                return (
                                                    <div key={i} dangerouslySetInnerHTML={{ __html: coloredLine }} />
                                                );
                                            })}
                                        </code>
                                    </motion.pre>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
