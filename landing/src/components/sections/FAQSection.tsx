"use client";

import { useState } from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

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
        a: "Yes. Statis ships with a Docker Compose setup for self-hosted deployment. VPC and managed hosting options are also on the roadmap for enterprise design partners. If data residency is a requirement, reach out directly.",
    },
    {
        q: "How fast is state materialization?",
        a: "Sub-second in normal operation. State is materialized and pushed to subscribers in near real-time. The reducer pattern ensures state is always derived from the canonical event log, not from polling or caching.",
    },
];

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <svg
            className="w-4 h-4 shrink-0"
            style={{
                color: "var(--text-muted)",
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.25s ease",
            }}
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
        <section className="py-20">
            <div className="mx-auto max-w-3xl px-6">
                <div className="text-center mb-14">
                    <div className="mb-5">
                        <SectionEyebrow align="center">Questions</SectionEyebrow>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
                        Frequently asked.
                    </h2>
                </div>

                <div className="space-y-2">
                    {FAQS.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                style={{
                                    background: "var(--bg-surface)",
                                    border: `1px solid ${isOpen ? "rgba(200,92,26,0.2)" : "var(--border)"}`,
                                    borderLeft: isOpen ? "2px solid rgba(200,92,26,0.4)" : "2px solid transparent",
                                    borderRadius: "var(--radius)",
                                    transition: "border-color 0.2s ease",
                                }}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full flex justify-between items-center px-5 py-4 text-left focus:outline-none gap-4 cursor-pointer"
                                >
                                    <span
                                        className="font-medium text-sm"
                                        style={{ color: "var(--text)" }}
                                    >
                                        {faq.q}
                                    </span>
                                    <ChevronIcon isOpen={isOpen} />
                                </button>
                                <div
                                    style={{
                                        maxHeight: isOpen ? "300px" : "0",
                                        opacity: isOpen ? 1 : 0,
                                        overflow: "hidden",
                                        transition: "max-height 0.25s ease, opacity 0.2s ease",
                                    }}
                                >
                                    <div
                                        className="px-5 pb-4 text-sm leading-relaxed"
                                        style={{
                                            color: "var(--text-2)",
                                            borderTop: "1px solid var(--border)",
                                            paddingTop: "1rem",
                                        }}
                                    >
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
