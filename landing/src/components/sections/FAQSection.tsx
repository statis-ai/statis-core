"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
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
            className={`w-4 h-4 text-slate-500 transform transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}
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
            <section className="py-32 bg-gray-50 border-t border-gray-200">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                            Questions
                        </p>
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-serif">
                            Frequently asked.
                        </h2>
                    </motion.div>

                    <div className="space-y-3">
                        {FAQS.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="border border-gray-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-200"
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none gap-4"
                                    >
                                        <span className="font-semibold text-gray-900 text-sm sm:text-base">{faq.q}</span>
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
                                                <div className="px-6 pb-5 text-gray-500 leading-relaxed text-sm">
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
            <section className="relative py-32 bg-[#020617] overflow-hidden border-t border-white/5">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[800px] h-[400px] bg-indigo-900/15 blur-[120px] rounded-full" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

                <div className="relative z-10 mx-auto max-w-3xl px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-[3.25rem] font-serif mb-6 leading-[1.1]">
                            Build agents that act
                            <br className="hidden sm:block" />
                            with authority.
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
                            Statis is looking for design partners — enterprise teams running AI agents with write-access to production systems. If your agents are about to do something real, let&rsquo;s talk.
                        </p>
                        <a
                            href="https://www.surveymonkey.com/r/GVKH2KR"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                        >
                            Request Design Partner Access →
                        </a>
                        <p className="mt-6 text-xs text-slate-600 uppercase tracking-widest">
                            Hosted today · VPC &amp; self-hosted options coming soon
                        </p>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
