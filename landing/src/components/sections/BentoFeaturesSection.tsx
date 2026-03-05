"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

function Incident({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2.5">
            <span className="mt-[6px] shrink-0 w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]" />
            <p className="text-sm text-gray-600 leading-snug">{text}</p>
        </div>
    );
}

const READ_INCIDENTS = [
    "Support agent flags churn risk. Sales agent books an upsell call. No one told Sales.",
    "State cached 6 minutes ago. Action taken now. Gap is invisible until it isn't.",
    "No single \"moment in time\" you can query. You reconstruct — after the damage.",
];

const WRITE_INCIDENTS = [
    "Retry logic fires twice. Stripe is charged twice. Customer is furious twice.",
    "Agent applies a 40% discount. No rule said it could. No record says it happened.",
    "Auditor asks: who approved this? What policy? You have logs. Not proof.",
];

export function BentoFeaturesSection() {
    return (
        <section className="relative py-24 bg-gray-50/50 overflow-hidden border-t border-gray-100">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-100/40 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">

                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto mb-16 text-center"
                >
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-rose-500 flex items-center justify-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        The Problem
                    </p>
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-[2.75rem] font-serif mb-4 leading-[1.1] text-gradient">
                        Two ways autonomous systems
                        <br className="hidden sm:block" />
                        fail in production.
                    </h2>
                    <p className="text-base sm:text-lg text-gray-500 leading-relaxed mx-auto">
                        Demos work. Then agents hit real systems, real state, real consequences — and the cracks appear.
                    </p>
                </motion.div>

                {/* Problem cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">

                    {/* Problem 01 — The Read Problem */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="group flex flex-col p-7 sm:p-8 rounded-[2rem] bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                    >
                        {/* Card header */}
                        <div className="mb-6">
                            <span className="inline-block text-[10px] font-mono font-semibold tracking-[0.2em] text-rose-400 uppercase mb-2.5">
                                Problem 01
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif mb-3">
                                The Read Problem
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Agents fragment state. Each one materializes its own version of reality from slightly different data, at slightly different times. One agent thinks a customer is at risk. Another doesn&rsquo;t. Both act — on different truths.
                            </p>
                        </div>

                        {/* Incident log */}
                        <div className="flex-1 space-y-3 mb-6 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3.5 flex items-center gap-2">
                                <span className="w-2 h-[1px] bg-gray-300" /> incident log
                            </p>
                            {READ_INCIDENTS.map((text) => (
                                <Incident key={text} text={text} />
                            ))}
                        </div>

                        {/* Closing statement */}
                        <p className="text-sm sm:text-base font-serif text-gray-900 leading-snug">
                            Today&rsquo;s AI systems coordinate messages.{" "}
                            <span className="text-rose-500 italic font-medium">They don&rsquo;t coordinate state.</span>
                        </p>
                    </motion.div>

                    {/* Problem 02 — The Write Problem */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="group flex flex-col p-7 sm:p-8 rounded-[2rem] bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                    >
                        {/* Card header */}
                        <div className="mb-6">
                            <span className="inline-block text-[10px] font-mono font-semibold tracking-[0.2em] text-rose-400 uppercase mb-2.5">
                                Problem 02
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif mb-3">
                                The Write Problem
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Now agents act. They call Stripe. They update Salesforce. They send emails. Once state is shared and agents agree on what&rsquo;s true — what stops them from acting on it without oversight, twice, or forever?
                            </p>
                        </div>

                        {/* Incident log */}
                        <div className="flex-1 space-y-3 mb-6 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3.5 flex items-center gap-2">
                                <span className="w-2 h-[1px] bg-gray-300" /> incident log
                            </p>
                            {WRITE_INCIDENTS.map((text) => (
                                <Incident key={text} text={text} />
                            ))}
                        </div>

                        {/* Closing statement */}
                        <p className="text-sm sm:text-base font-serif text-gray-900 leading-snug">
                            Shared state tells agents what&rsquo;s true.{" "}
                            <span className="text-rose-500 italic font-medium">It doesn&rsquo;t govern what they can do about it.</span>
                        </p>
                    </motion.div>

                </div>

            </div>
        </section>
    );
}
