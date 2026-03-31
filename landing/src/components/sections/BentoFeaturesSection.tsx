"use client";

import { motion } from "framer-motion";
import { AnimatedTerminal, TerminalLine } from "@/components/ui/AnimatedTerminal";


// Two agents reading divergent state of the same customer
const AGENT_STATES = [
    {
        name: "Agent A",
        color: "text-[#8a8aaa]",
        border: "border-white/10",
        bg: "bg-white/[0.03]",
        dot: "bg-[#6a6aaa]",
        fields: [
            { key: "churn_risk", value: "HIGH",       accent: "text-[#a06060]" },
            { key: "last_action", value: "email_sent", accent: "text-[#6a8a9a]" },
            { key: "cached_at",  value: "T−06:00",    accent: "text-[#8a7040]" },
        ],
        action: "→ books upsell call",
        actionColor: "text-[#6a8a9a]",
    },
    {
        name: "Agent B",
        color: "text-[#7a7a9a]",
        border: "border-white/8",
        bg: "bg-white/[0.02]",
        dot: "bg-[#5a5a8a]",
        fields: [
            { key: "churn_risk", value: "LOW",        accent: "text-[#406a50]" },
            { key: "last_action", value: "none",      accent: "text-[#5a5a7a]" },
            { key: "cached_at",  value: "T−18:00",   accent: "text-[#a06060]" },
        ],
        action: "→ sends churn warning",
        actionColor: "text-[#7a7a9a]",
    },
];

// Salesforce mass-update disaster
const WRITE_LINES: TerminalLine[] = [
    { type: "comment", text: "# Agent: mark trial_expired accounts as churned" },
    { type: "prompt",  text: "salesforce.bulk_update(filter='status=trial_expired'," },
    { type: "code",    text: "  fields={'status': 'churned'}, n=847)" },
    { type: "success", text: "→ 200  updated 847 records  job_id: BJ-7821" },
    { type: "spacer",  text: "" },
    { type: "comment", text: "# network blip — agent retries 8s later" },
    { type: "prompt",  text: "salesforce.bulk_update(filter='status=trial_expired'," },
    { type: "code",    text: "  fields={'status': 'churned'}, n=847)" },
    { type: "success", text: "→ 200  updated 847 records  job_id: BJ-7822" },
    { type: "spacer",  text: "" },
    { type: "blocked", text: "✗ 1,694 history entries. Timeline corrupted." },
    { type: "blocked", text: "✗ No policy approved this. No receipt exists." },
    { type: "blocked", text: "✗ Auditor: \"who ran this at 03:14?\"  You: \"...\"" },
];

export function BentoFeaturesSection() {
    return (
        <section className="relative py-28 overflow-hidden section-divider">

            <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto mb-16 text-center"
                >
                    <p className="mb-4 text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#7a4040]">
                        The Problem
                    </p>
                    <h2 className="text-4xl sm:text-5xl font-bold text-[#e8e5de] leading-[1.1] mb-5">
                        Agents acting on
                        <span className="text-[#7a756e]"> different truths.</span>
                    </h2>
                    <p className="text-[#7a7a8a] text-lg leading-relaxed">
                        Without a shared execution layer, every agent materialises its own version of reality — then acts on it, unsupervised.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    {/* Problem 1 — Fragmented State */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                    <div className="rounded-3xl border border-t-2 border-white/8 border-t-[#2d1a1a] p-7 flex flex-col gap-6" style={{ background: 'linear-gradient(135deg, rgba(30,15,15,0.6) 0%, #0c0b0d 100%)' }}>
                        <div>
                            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#7a4040] uppercase">Problem 01</span>
                            <h3 className="text-xl font-bold text-[#e8e5de] mt-2 mb-1.5">Fragmented State</h3>
                            <p className="text-sm text-[#7a7a8a] leading-relaxed">
                                Two agents. Same customer. Cached at different times. Both act — on different truths. Customer receives both.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {AGENT_STATES.map((agent) => (
                                <div key={agent.name} className={`rounded-xl border ${agent.border} ${agent.bg} p-3.5`}>
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <span className={`w-1.5 h-1.5 rounded-full ${agent.dot}`} />
                                        <span className={`text-[10px] font-mono font-bold ${agent.color}`}>{agent.name}</span>
                                    </div>
                                    <div className="space-y-1.5 mb-3">
                                        {agent.fields.map(f => (
                                            <div key={f.key} className="flex justify-between gap-2">
                                                <span className="font-mono text-[10px] text-[#4a4a6a]">{f.key}</span>
                                                <span className={`font-mono text-[10px] font-bold ${f.accent}`}>{f.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={`text-[10px] font-mono border-t border-white/6 pt-2 ${agent.actionColor}`}>
                                        {agent.action}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-[#6a3030] font-mono border-t border-white/6 pt-4">
                            ✗ No shared reality. Conflicting actions. Customer receives both.
                        </p>
                    </div>
                    </motion.div>

                    {/* Problem 2 — Unguarded Execution: Salesforce mass-update */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                    <div className="rounded-3xl border border-t-2 border-white/8 border-t-[#2d1a1a] p-7 flex flex-col gap-5" style={{ background: 'linear-gradient(135deg, rgba(15,15,25,0.6) 0%, #0c0b0d 100%)' }}>
                        <div>
                            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#7a4040] uppercase">Problem 02</span>
                            <h3 className="text-xl font-bold text-[#e8e5de] mt-2 mb-1.5">Unguarded Execution</h3>
                            <p className="text-sm text-[#7a7a8a] leading-relaxed">
                                Agent bulk-updates 847 Salesforce records. Network blips. It retries. 1,694 history entries. No policy. No receipt. Auditor asks who approved this.
                            </p>
                        </div>

                        <AnimatedTerminal
                            lines={WRITE_LINES}
                            title="crm-agent"
                            className="flex-1"
                        />
                    </div>
                    </motion.div>

                    {/* Problem 3 — No Audit Trail */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                    <div className="rounded-3xl border border-t-2 border-white/8 border-t-[#2d1a1a] p-7 flex flex-col gap-5" style={{ background: 'linear-gradient(135deg, rgba(15,20,15,0.6) 0%, #0c0b0d 100%)' }}>
                        <div>
                            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#7a4040] uppercase">Problem 03</span>
                            <h3 className="text-xl font-bold text-[#e8e5de] mt-2 mb-1.5">No Audit Trail</h3>
                            <p className="text-sm text-[#7a7a8a] leading-relaxed">
                                Agent ran at 03:14. Bulk-updated 847 records. No policy approved it. No receipt exists. The timestamp in your logs is what the agent told you — not what actually happened.
                            </p>
                        </div>
                        <div className="font-mono text-[11px] leading-[1.85] rounded-xl border border-[#2d1a1a] bg-[#06070e] p-4 space-y-0.5">
                            <div className="text-[#4a4a6a]"># Post-incident investigation</div>
                            <div className="text-[#5a5a7a]">grep logs "03:14" → 847 entries</div>
                            <div className="text-[#5a5a7a]">grep receipts "BJ-7821" → no results</div>
                            <div className="text-[#5a5a7a]">grep policy_approvals → no results</div>
                            <div className="text-[#7a4040] pt-1">✗ No policy. No receipt. No proof.</div>
                            <div className="text-[#7a4040]">✗ Auditor: "who approved this?" You: "..."</div>
                        </div>
                    </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
