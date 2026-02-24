"use client";

import { motion } from "framer-motion";

export function InActionSection() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base/7 font-semibold text-brand-accent uppercase tracking-wide">IN ACTION: SUB-SECOND SYNCHRONIZATION</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        The Incident Cascade
                    </p>
                    <p className="mt-6 text-lg leading-8 text-brand-muted">
                        <span className="text-white font-medium">Scenario:</span> Prevent an automated outreach disaster during a platform outage.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-4xl">
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">

                        {/* T=0ms */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#0D0D0D] text-red-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                🔴
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] relative">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-white text-lg">Support Agent Publishes</h3>
                                    <time className="font-mono text-xs font-medium text-brand-muted">T=0ms</time>
                                </div>
                                <p className="text-sm text-brand-muted font-mono italic">
                                    "Login outage; customer furious; threatened churn."
                                </p>
                            </div>
                        </motion.div>

                        {/* T=150ms */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#0D0D0D] text-violet-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                ⚙️
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[28px] border border-violet-500/20 bg-violet-500/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(139,92,246,0.2)] md:text-right relative">
                                <div className="flex items-center justify-between md:flex-row-reverse mb-1">
                                    <h3 className="font-bold text-white text-lg">Statis Materializer</h3>
                                    <time className="font-mono text-xs font-medium text-violet-400">T=150ms</time>
                                </div>
                                <p className="text-sm text-brand-muted mt-2 space-y-1 block text-left md:text-right relative">
                                    <span className="block border-l-2 md:border-l-0 md:border-r-2 border-white/10 pl-3 md:pr-3 md:pl-0">Validates event.</span>
                                    <span className="block border-l-2 md:border-l-0 md:border-r-2 border-white/10 pl-3 md:pr-3 md:pl-0">Flips <code className="text-white bg-white/10 px-1 rounded">churn_risk: true</code>.</span>
                                    <span className="block border-l-2 md:border-l-0 md:border-r-2 border-white/10 pl-3 md:pr-3 md:pl-0">Adds <code className="text-white bg-white/10 px-1 rounded">login_outage</code> to blockers array.</span>
                                    <span className="block border-l-2 md:border-l-0 md:border-r-2 border-white/10 pl-3 md:pr-3 md:pl-0">Bumps entity to <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded">rev: 105</code>.</span>
                                </p>
                            </div>
                        </motion.div>

                        {/* T=280ms */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-green-500/50 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                🟢
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[28px] border border-glow border-green-500/30 bg-green-500/10 backdrop-blur-md relative">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-white text-lg">Push Subscriptions Fire</h3>
                                    <time className="font-mono text-xs font-medium text-green-400">T=280ms</time>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-[#0D0D0D]/50 border border-white/5 rounded-xl p-3">
                                        <div className="text-sm font-semibold text-white">Sales Agent Webhook</div>
                                        <div className="text-xs text-brand-muted flex items-center gap-2 mt-1"><svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg> Receives state push → Automatically pauses scheduled upsell.</div>
                                    </div>
                                    <div className="bg-[#0D0D0D]/50 border border-white/5 rounded-xl p-3">
                                        <div className="text-sm font-semibold text-white">Billing Agent Webhook</div>
                                        <div className="text-xs text-brand-muted flex items-center gap-2 mt-1"><svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg> Receives state push → Suspends dunning retries.</div>
                                    </div>
                                    <div className="bg-[#0D0D0D]/50 border border-white/5 rounded-xl p-3">
                                        <div className="text-sm font-semibold text-white">CSM Agent Webhook</div>
                                        <div className="text-xs text-brand-muted flex items-center gap-2 mt-1"><svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg> Receives state push → Escalates to a human and drafts response.</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 mx-auto max-w-2xl text-center border-t border-white/10 pt-10"
                >
                    <p className="text-xl font-medium text-white flex items-center justify-center gap-2 flex-wrap">
                        <span className="text-brand-accent">Outcome:</span> Zero polling. Zero stale reads. 100% explainable automation.
                    </p>
                </motion.div>

            </div>
        </section>
    );
}
