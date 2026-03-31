"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
    {
        q: "What is Shadow Mode?",
        a: "Shadow mode lets you run Statis alongside your existing agents without changing a single line of agent code. Statis observes every action proposal, evaluates it against your policy rules, and flags what would have been DENIED or DUPLICATE — without blocking any execution. Zero production risk. Zero integration work. Purpose-built for design partners evaluating Statis before full adoption.",
    },
    {
        q: "How is Statis different from a vector database?",
        a: "Vector databases are for semantic retrieval — memory. Statis is for deterministic structured state and governed execution — reality. If an agent needs context, use RAG. If it needs to know what's true right now and act on it safely, it needs Statis.",
    },
    {
        q: "Do I need to rewrite my agent logic?",
        a: "No. Statis sits between your agents and your production systems. Your agents propose actions via a simple API. Statis handles evaluation, execution, and receipts. Minimal changes to existing agent code.",
    },
    {
        q: "What makes the Policy Engine different from an authorization layer?",
        a: "Authorization answers \"can this agent do this?\" Statis answers \"given the current state of this entity and its history, should this action happen right now?\" The policy evaluates entity state, not just roles — and every decision is receipted against a versioned rule.",
    },
    {
        q: "How does exactly-once execution work?",
        a: "When an action is approved, Statis acquires a distributed lock on the action ID, calls the adapter, writes the receipt atomically, and releases the lock. If any agent retries with the same action ID — even concurrently — the receipt is found and execution is blocked. The external system is never called twice.",
    },
    {
        q: "Can I self-host Statis?",
        a: "Statis is available as a hosted service today. VPC and self-hosted options are on the roadmap for enterprise design partners. If data residency is a requirement, reach out directly.",
    },
    {
        q: "How fast is state materialization?",
        a: "Sub-second in normal operation. State is materialized and pushed to subscribers in near real-time. The reducer pattern ensures state is always derived from the canonical event log, not from polling or caching.",
    },
];

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <svg
            className={`w-4 h-4 text-[#5a5a6a] transform transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
}

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <>
            {/* FAQ */}
            <section className="py-32 section-divider">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#00ffc8]">
                            Questions
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight text-[#e8e5de] sm:text-4xl">
                            Frequently asked.
                        </h2>
                    </motion.div>

                    <div className="space-y-2">
                        {FAQS.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className={`rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? "glass-card border-white/14" : "glass-card hover:border-white/12"}`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none gap-4 cursor-pointer"
                                    >
                                        <span className="font-semibold text-[#e8e5de] text-sm sm:text-base">{faq.q}</span>
                                        <ChevronIcon isOpen={isOpen} />
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.28, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-5 text-[#8a8a9a] leading-relaxed text-sm border-t border-white/6 pt-4">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative py-40 overflow-hidden section-divider grid-texture">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-[#00ffc8]/25 to-transparent" />

                <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        {/* Badge */}
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#00ffc8]/20 bg-[#00ffc8]/6 px-4 py-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] shadow-[0_0_6px_rgba(0,255,200,0.9)]" />
                            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-[#00ffc8]">
                                Design Partner Program
                            </span>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-[11px] font-mono text-[#4a4a5a] mb-6"
                        >
                            YC S25 deadline · EOW 2026-04-04
                        </motion.p>

                        <h2 className="text-5xl sm:text-6xl md:text-[4rem] font-bold text-[#e8e5de] mb-6 leading-[1.06]">
                            Your agents are about<br />
                            to do something real.<br />
                            <span className="font-display text-gradient" style={{ fontStyle: "italic" }}>Make sure they&rsquo;re governed.</span>
                        </h2>
                        <p className="text-lg text-[#7a7a8a] leading-relaxed max-w-xl mx-auto mb-10">
                            We&rsquo;re working with enterprise teams running production agents. Start with Shadow Mode — no code change, no production risk. See exactly which of your agent actions would have been blocked.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <a
                                href="https://www.surveymonkey.com/r/GVKH2KR"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-[#00ffc8] px-8 py-3.5 text-sm font-bold text-black transition-all hover:brightness-110 hover:scale-[1.02] shadow-[0_0_40px_rgba(0,255,200,0.3)] cursor-pointer btn-shimmer"
                            >
                                Request Design Partner Access
                                <span>→</span>
                            </a>
                            <a
                                href="https://docs.statis.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-8 py-3.5 text-sm font-medium text-[#c4c4d4] transition-all hover:bg-white/8 cursor-pointer"
                            >
                                Read the Docs
                            </a>
                        </div>

                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] font-mono text-[#3a3a4a]">
                            <span>api.statis.dev live</span>
                            <span>·</span>
                            <span>Python + TS SDKs on PyPI / npm</span>
                            <span>·</span>
                            <span>VPC options on roadmap</span>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
