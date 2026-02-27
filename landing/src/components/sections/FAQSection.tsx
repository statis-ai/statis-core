"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FAQSection() {
    const faqs = [
        {
            q: "How is Statis different from a vector database?",
            a: "Vector databases are for semantic retrieval — memory. Statis is for deterministic structured state — reality. If an agent needs context, use RAG. If an agent needs to know whether something is true right now, it needs shared reality."
        },
        {
            q: "Do I need to rewrite my agent logic?",
            a: "No. Statis acts as an event sink and webhook source. Your agents simply push JSON facts to our API instead of trying to mutate your production database directly, and they listen for state change webhooks."
        },
        {
            q: "Can I self-host Statis?",
            a: "We are currently enrolling design partners for our managed cloud offering. VPC and self-hosted deployments are on our near-term roadmap for enterprise compliance requirements."
        },
        {
            q: "How fast is state materialization?",
            a: "P95 state materialization takes less than 2 seconds from event ingestion to webhook delivery, making it suitable for near real-time agent coordination."
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 sm:py-32 bg-gray-50 border-t border-gray-200">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-serif">
                        Frequently Asked Questions
                    </h2>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} className="border border-gray-200 bg-white rounded-2xl overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                                >
                                    <span className="font-semibold text-gray-900">{faq.q}</span>
                                    <SVGIcon isOpen={isOpen} />
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 text-gray-500 leading-relaxed text-sm">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function SVGIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
}
