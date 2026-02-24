import { AICard } from "@/components/ui/AICard";

export function PrimitivesSection() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32 bg-[#050505]">

            {/* Abstract background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-sm font-bold text-brand-accent uppercase tracking-widest">HOW IT WORKS: THE 4 PRIMITIVES</h2>
                    <p className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Stop polling. Start pushing.
                    </p>
                    <p className="mt-6 text-lg leading-8 text-brand-muted max-w-xl mx-auto">
                        Statis is built on four non-negotiable primitives for engineering teams who demand absolute reliability and debuggability.
                    </p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

                    {/* 1. Append-Only Log (Spans 2 columns on lg) */}
                    <AICard glowColor="cyan" className="lg:col-span-2 group/card">
                        <div className="p-8 pb-0">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20">
                                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">1. Append-Only Event Log <span className="text-cyan-400 font-medium text-lg ml-2">(The Truth)</span></h3>
                            <p className="text-brand-muted leading-relaxed max-w-2xl">
                                Agents don't mutate state; they publish claims. Every fact is committed to an immutable log with an <code className="text-cyan-300">event_id</code>, timestamp, monotonic entity revision (<code className="text-cyan-300">rev</code>), and exact provenance.
                            </p>
                        </div>
                        {/* Visual element */}
                        <div className="mt-8 h-32 w-full relative overflow-hidden bg-[#0A0A0A] border-t border-white/5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                            <div className="flex items-center gap-2 h-full px-8 overflow-hidden">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className={`h-12 w-32 shrink-0 rounded border border-white/10 bg-white/5 flex items-center justify-center font-mono text-xs text-brand-muted opacity-${100 - (i * 15)} transform group-hover/card:scale-105 transition-transform duration-500`}>
                                        rev: {100 + i}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AICard>

                    {/* 2. Materialized State */}
                    <AICard glowColor="violet" className="lg:col-span-1 group/card">
                        <div className="p-8 pb-0">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20">
                                <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">2. Materialized State <span className="block text-violet-400 font-medium text-base mt-1">(The Golden Record)</span></h3>
                            <p className="text-brand-muted text-sm leading-relaxed mt-4">
                                Deterministically derives current entity state from the log. Strict validation rules and timestamp precedence ensure identical <code className="text-violet-300">state_hash</code> generation every time.
                            </p>
                        </div>
                        {/* Visual element */}
                        <div className="mt-8 h-32 w-full relative overflow-hidden bg-[#0A0A0A] border-t border-white/5 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full border border-violet-500/30 bg-violet-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.2)] group-hover/card:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-500">
                                <span className="font-mono text-xs text-violet-300">hash: 8f9a2b</span>
                            </div>
                        </div>
                    </AICard>

                    {/* 3. Reactive Subscriptions */}
                    <AICard glowColor="green" className="lg:col-span-1 group/card">
                        <div className="p-8 pb-0">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 ring-1 ring-green-500/20">
                                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">3. Reactive Subscriptions <span className="block text-green-400 font-medium text-base mt-1">(Push Delivery)</span></h3>
                            <p className="text-brand-muted text-sm leading-relaxed mt-4">
                                Define rules to push state-change notifications directly to agents. Built-in guardrails: intelligent debouncing, rate limits, and DLQs.
                            </p>
                        </div>
                        <div className="mt-auto pt-8 flex px-8 pb-8 gap-2">
                            <span className="h-2 flex-1 rounded bg-green-500/20 group-hover/card:bg-green-400 transition-colors delay-100" />
                            <span className="h-2 flex-1 rounded bg-green-500/20 group-hover/card:bg-green-400 transition-colors delay-200" />
                            <span className="h-2 flex-1 rounded bg-green-500/20 group-hover/card:bg-green-400 transition-colors delay-300" />
                        </div>
                    </AICard>

                    {/* 4. Time Machine & Replay (Spans 2 columns on lg) */}
                    <AICard glowColor="cyan" className="lg:col-span-2 group/card">
                        <div className="p-8 pb-0">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20">
                                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">4. Time Machine & Replay <span className="text-cyan-400 font-medium text-lg ml-2">(The Audit)</span></h3>
                            <p className="text-brand-muted leading-relaxed max-w-2xl">
                                "What exactly did Sales know when it paused outreach?" Statis gives you <code className="text-cyan-300">state_at(rev)</code>, the triggering event, evaluated predicates, and a full delivery trace. Replay logs for flawless debugging.
                            </p>
                        </div>
                        {/* Visual element */}
                        <div className="mt-8 h-24 w-full relative overflow-hidden bg-[#0A0A0A] border-t border-white/5 flex flex-col justify-center px-8">
                            <div className="flex justify-between items-end relative py-4">
                                <div className="h-0.5 w-full bg-white/10 absolute bottom-4 left-0" />
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="relative group-hover/card:-translate-y-2 transition-transform duration-500" style={{ transitionDelay: `${i * 50}ms` }}>
                                        <div className="text-[10px] text-brand-muted mb-2 opacity-50 font-mono">T-{7 - i}</div>
                                        <div className={`h-3 w-3 rounded-full border border-white/20 bg-white/5 ${i === 4 ? 'ring-2 ring-cyan-400 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] z-10' : ''}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AICard>

                </div>
            </div>
        </section>
    );
}
