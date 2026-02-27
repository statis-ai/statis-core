"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ShieldCheck, ServerCrash } from "lucide-react";

export function BeforeAfterSection() {
    const issues = [
        "Each system derives its own view",
        "Updates propagate unpredictably",
        "Race conditions emerge",
        "Debugging requires reconstruction",
        "Authority is unclear",
    ];

    const solutions = [
        "One materialized, authoritative state",
        "Explicit, deterministic state transitions",
        "Push on every revision",
        "Replayable, inspectable history",
        "Clear execution authority",
    ];

    return (
        <section className="py-24 sm:py-32 bg-white relative overflow-hidden border-t border-slate-200">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-100/50 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 blur-[120px] rounded-full pointer-events-none" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-5xl text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-6">
                            From Fragmentation to Coordination
                        </h2>
                        <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl font-serif mb-6 leading-[1.2]">
                            Autonomous systems don&rsquo;t just need better integrations.<br />
                            <span className="text-indigo-600 mt-2 block">They need coordination primitives.</span>
                        </h3>

                        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-14 max-w-3xl mx-auto">
                            As systems begin to act — not just respond — coordination stops being a convenience and becomes a requirement.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 relative z-10 max-w-5xl mx-auto">
                            <div className="bg-rose-50/80 border border-rose-100 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-sm hover:bg-rose-50 transition-colors">
                                <span className="text-rose-500 font-mono text-xs sm:text-sm mb-3 font-bold tracking-wider">POLLING</span>
                                <span className="text-rose-950/70 font-medium sm:text-lg">Scales traffic.</span>
                            </div>
                            <div className="bg-amber-50/80 border border-amber-100 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-sm hover:bg-amber-50 transition-colors">
                                <span className="text-amber-500 font-mono text-xs sm:text-sm mb-3 font-bold tracking-wider">POINT-TO-POINT APIS</span>
                                <span className="text-amber-950/70 font-medium sm:text-lg">Scale complexity.</span>
                            </div>
                            <div className="bg-fuchsia-50/80 border border-fuchsia-100 p-6 sm:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-sm hover:bg-fuchsia-50 transition-colors">
                                <span className="text-fuchsia-500 font-mono text-xs sm:text-sm mb-3 font-bold tracking-wider">IMPLICIT PROMPT LOGIC</span>
                                <span className="text-fuchsia-950/70 font-medium sm:text-lg">Scales unpredictability.</span>
                            </div>
                        </div>

                        <div className="text-lg sm:text-xl text-slate-700 leading-relaxed font-medium bg-slate-50/80 border border-slate-200 rounded-[2.5rem] p-8 sm:p-12 shadow-sm relative overflow-hidden backdrop-blur-sm max-w-4xl mx-auto">
                            <p className="text-rose-600 font-bold mb-4 text-xl sm:text-2xl">
                                Each workaround solves a local problem.<br />
                                None establish global authority.
                            </p>
                            <div className="w-16 h-px bg-slate-300 mx-auto my-8" />
                            <p className="mb-4 text-slate-500 text-base sm:text-lg">Execution cannot depend on scattered interpretations of state.</p>
                            <p className="text-slate-900 font-bold text-xl sm:text-2xl font-serif">
                                It requires a shared, authoritative surface — one place where truth is materialized, transitions are explicit, and reactions are deterministic.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
