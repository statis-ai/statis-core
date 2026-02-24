import { AICard } from "@/components/ui/AICard";
import { motion } from "framer-motion";

export function ArchitectureSection() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32">
            {/* Background radial glow behind the Engine */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[120px]">
                <div className="absolute inset-0 rounded-full bg-violet-500/30 mix-blend-screen" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-brand-accent">ARCHITECTURE: WHERE STATIS SITS</h2>
                    <p className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        The Multi-Agent State Broker
                    </p>
                    <p className="mt-6 text-lg leading-8 text-brand-muted max-w-xl mx-auto">
                        You don't need another vector database to store fragmented memories. Statis sits between your agents as the definitive system of record.
                    </p>
                </div>

                <div className="mx-auto mt-20 max-w-5xl relative">

                    {/* Animated Connecting Lines (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
                        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[flowRight_2s_linear_infinite]" />
                        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-[flowRight_2s_linear_infinite_0.5s]" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative z-10 items-stretch">

                        {/* Ingress */}
                        <div className="flex flex-col justify-center">
                            <AICard glowColor="cyan" className="p-8 h-full bg-[#080808]/90">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                    <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Ingress</h3>
                                <p className="text-sm leading-relaxed text-brand-muted">
                                    Independent agents (Support, Sales, Billing) and systems of record publish semantic facts to the Statis Event API.
                                </p>
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                                        <span className="px-2 py-1 rounded bg-white/5 text-brand-muted">REST</span>
                                        <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400">Events</span>
                                        <span className="px-2 py-1 rounded bg-white/5 text-brand-muted">gRPC</span>
                                    </div>
                                </div>
                            </AICard>
                        </div>

                        {/* The Engine (Centerpiece) */}
                        <div className="flex flex-col justify-center lg:transform lg:scale-110 z-20">
                            <div className="relative group">
                                <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-b from-violet-500 to-brand-accent opacity-30 blur overflow-hidden transition-opacity group-hover:opacity-50 duration-500 animate-pulse" />
                                <AICard glowColor="violet" className="p-10 text-center bg-[#0d0d0d]/95 relative">
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                                        <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">The Engine</h3>
                                    <p className="text-sm leading-relaxed text-brand-muted">
                                        Sequences events into an append-only log, resolves conflicts, and deterministically materializes the current entity state.
                                    </p>

                                    {/* Visual representation of engine internals */}
                                    <div className="mt-8 flex flex-col gap-2">
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-violet-400/50 rounded-full" />
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full w-1/2 bg-brand-accent/50 rounded-full" />
                                        </div>
                                    </div>
                                </AICard>
                            </div>
                        </div>

                        {/* Egress */}
                        <div className="flex flex-col justify-center">
                            <AICard glowColor="green" className="p-8 h-full bg-[#080808]/90">
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Egress</h3>
                                <p className="text-sm leading-relaxed text-brand-muted">
                                    Evaluates subscription rules and pushes the new state directly to relevant connected agents via webhooks.
                                </p>
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                                        <span className="px-2 py-1 rounded bg-green-500/10 text-green-400">Webhooks</span>
                                        <span className="px-2 py-1 rounded bg-white/5 text-brand-muted">Kafka</span>
                                    </div>
                                </div>
                            </AICard>
                        </div>

                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes flowRight {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(300%); opacity: 0; }
        }
      `}} />
        </section>
    );
}
