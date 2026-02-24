import { AICard } from "@/components/ui/AICard";

export function ProblemSection() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32 bg-[#0a0a0a]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-brand-accent">THE CHALLENGE</h2>
                    <p className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Agent synchronization is broken.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* The Problem (Red) */}
                    <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-red-500/20 to-transparent">
                        <div className="absolute inset-0 bg-red-500/5 blur-xl group-hover:bg-red-500/10 transition-colors duration-500 rounded-3xl" />
                        <div className="relative h-full bg-[#0d0d0d] rounded-[23px] p-8 md:p-10 border border-white/5 flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">The Problem: Stale State</h3>
                            </div>

                            <p className="text-brand-muted leading-relaxed flex-grow">
                                When multiple autonomous agents operate on the same customer, polling fragmented memory stores leads to race conditions.
                            </p>

                            <div className="mt-8 p-5 rounded-xl bg-red-500/5 border border-red-500/10">
                                <p className="text-sm text-red-200/80 italic">
                                    "Your Support agent knows a customer is furious about a billing error, but your Sales agent is still firing off automated upsells because its local context hasn't updated."
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-red-400 text-sm font-semibold">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                Result: Costly mistakes & churn liability
                            </div>
                        </div>
                    </div>

                    {/* The Solution (Green) */}
                    <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-brand-accent/40 to-transparent">
                        <div className="absolute inset-0 bg-brand-accent/5 blur-xl group-hover:bg-brand-accent/10 transition-colors duration-500 rounded-3xl" />
                        <div className="relative h-full bg-[#0d0d0d] rounded-[23px] p-8 md:p-10 border border-white/5 flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">The Solution: Statis</h3>
                            </div>

                            <p className="text-brand-muted leading-relaxed flex-grow">
                                Statis replaces chaotic polling with a deterministic, event-driven pipeline. It guarantees every agent operates on the exact same, cryptographically verifiable truth.
                            </p>

                            <div className="mt-8 p-5 rounded-xl bg-brand-accent/5 border border-brand-accent/10">
                                <p className="text-sm text-brand-accent/80 italic">
                                    "Support logs the billing error fact. Statis instantly materializes the new state and actively pushes an event to stop the Sales agent's outreach."
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-brand-accent text-sm font-semibold">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Result: 100% synchronized workflows
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
