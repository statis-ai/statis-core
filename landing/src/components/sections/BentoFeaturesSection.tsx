"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

function Incident({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-[7px] shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500/80" />
            <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed">{text}</p>
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
        <section className="relative py-32 bg-gray-50 overflow-hidden border-t border-gray-100">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-100/60 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/60 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">

                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto mb-20 text-center"
                >
                    <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-rose-600 flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        The Problem
                    </p>
                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-[3.5rem] font-serif mb-6 leading-[1.1] text-gradient">
                        Two ways autonomous systems
                        <br className="hidden sm:block" />
                        fail in production.
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        Demos work. Then agents hit real systems, real state, real consequences — and the cracks appear.
                    </p>
                </motion.div>

                {/* Problem cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Problem 01 — The Read Problem */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="group flex flex-col p-8 sm:p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-rose-200 transition-all duration-300 shadow-sm"
                    >
                        {/* Card header */}
                        <div className="mb-8">
                            <span className="inline-block text-[11px] font-mono font-semibold tracking-[0.22em] text-rose-500 uppercase mb-3">
                                Problem 01
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mb-5">
                                The Read Problem
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Agents fragment state. Each one materializes its own version of reality from slightly different data, at slightly different times. One agent thinks a customer is at risk. Another doesn&rsquo;t. Both act — on different truths.
                            </p>
                        </div>

                        {/* Incident log */}
                        <div className="flex-1 space-y-4 mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-100">
                            <p className="text-[11px] font-mono text-rose-400 uppercase tracking-widest mb-5">
                                — incident log
                            </p>
                            {READ_INCIDENTS.map((text) => (
                                <Incident key={text} text={text} />
                            ))}
                        </div>

                        {/* Closing statement */}
                        <p className="text-base sm:text-lg font-serif text-gray-900 leading-snug">
                            Today&rsquo;s AI systems coordinate messages.{" "}
                            <span className="text-rose-500">They don&rsquo;t coordinate state.</span>
                        </p>
                    </motion.div>

                    {/* Problem 02 — The Write Problem */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.2 }}
                        className="group flex flex-col p-8 sm:p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:border-rose-200 transition-all duration-300 shadow-sm"
                    >
                        {/* Card header */}
                        <div className="mb-8">
                            <span className="inline-block text-[11px] font-mono font-semibold tracking-[0.22em] text-rose-500 uppercase mb-3">
                                Problem 02
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif mb-5">
                                The Write Problem
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Now agents act. They call Stripe. They update Salesforce. They send emails. Once state is shared and agents agree on what&rsquo;s true — what stops them from acting on it without oversight, twice, or forever?
                            </p>
                        </div>

                        {/* Incident log */}
                        <div className="flex-1 space-y-4 mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-100">
                            <p className="text-[11px] font-mono text-rose-400 uppercase tracking-widest mb-5">
                                — incident log
                            </p>
                            {WRITE_INCIDENTS.map((text) => (
                                <Incident key={text} text={text} />
                            ))}
                        </div>

                        {/* Closing statement */}
                        <p className="text-base sm:text-lg font-serif text-gray-900 leading-snug">
                            Shared state tells agents what&rsquo;s true.{" "}
                            <span className="text-rose-500">It doesn&rsquo;t govern what they can do about it.</span>
                        </p>
                    </motion.div>

                </div>

            </div>
        </section>
    );
}
