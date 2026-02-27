"use client";

import { motion } from "framer-motion";
import { Network, GitBranch, Cpu, ShieldCheck } from "lucide-react";

export function UseCasesSection() {
    const useCases = [
        {
            title: "Cross-Workflow Automation",
            description: "When execution spans systems, state fragmentation creates drift. Statis ensures a single state transition propagates across dependent workflows instantly.",
            bullets: [
                "No polling.",
                "No redundant logic.",
                "No integration sprawl."
            ],
            icon: Network,
            color: "text-blue-600",
            bgLight: "bg-blue-50",
            borderLight: "border-blue-100",
            gradient: "from-blue-500/5 via-transparent to-transparent",
        },
        {
            title: "Transaction & Lifecycle Coordination",
            description: "Financial state, lifecycle status, approvals, risk flags — these are not just events. They are authoritative state transitions. Statis materializes the canonical transaction state and ensures every system reacts to the same revision.",
            bullets: [
                "Deterministic execution.",
                "Explicit transitions.",
                "Zero ambiguity."
            ],
            icon: GitBranch,
            color: "text-amber-600",
            bgLight: "bg-amber-50",
            borderLight: "border-amber-100",
            gradient: "from-amber-500/5 via-transparent to-transparent",
        },
        {
            title: "Multi-Agent Systems",
            description: "Agents reason independently. Execution must remain consistent. Statis provides a shared, deterministic state surface so autonomous agents act against the same authoritative reality — not their own derived interpretation.",
            bullets: [
                "Aligned action without coupling agents together."
            ],
            icon: Cpu,
            color: "text-fuchsia-600",
            bgLight: "bg-fuchsia-50",
            borderLight: "border-fuchsia-100",
            gradient: "from-fuchsia-500/5 via-transparent to-transparent",
        },
        {
            title: "Governance & Audit",
            description: "Autonomous systems must be explainable. Statis allows you to reconstruct any revision, inspect contributing events, and trace state transitions.",
            bullets: [
                "Verify what was true at the moment of action.",
                "Coordination without audit is incomplete."
            ],
            icon: ShieldCheck,
            color: "text-emerald-600",
            bgLight: "bg-emerald-50",
            borderLight: "border-emerald-100",
            gradient: "from-emerald-500/5 via-transparent to-transparent",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
    };

    return (
        <section className="py-24 sm:py-32 bg-slate-50 relative w-full overflow-hidden border-t border-slate-200">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60 mix-blend-multiply pointer-events-none" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-3xl text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl font-serif mb-8 leading-[1.1]"
                    >
                        Built for <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Coordinated Autonomy</span>
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg sm:text-xl leading-relaxed text-slate-500 space-y-4 font-medium"
                    >
                        <p>Wherever systems must act from shared truth, coordination becomes a first-class concern.</p>
                        <p className="text-slate-800 font-bold bg-white border border-slate-200 rounded-2xl p-6 shadow-sm inline-block">
                            Statis provides the state layer that keeps execution aligned across workflows, agents, and services.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
                >
                    {useCases.map((uc, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="group relative flex flex-col h-full rounded-[2.5rem] bg-white border border-slate-200 p-8 sm:p-10 hover:border-slate-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 overflow-hidden"
                        >
                            {/* Subtle Radial Gradient Background */}
                            <div className={`absolute top-0 right-0 w-[250px] h-[250px] bg-gradient-to-bl ${uc.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-bl-full`} />

                            <div className={`w-14 h-14 rounded-2xl ${uc.bgLight} border ${uc.borderLight} flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10`}>
                                <uc.icon className={`w-6 h-6 ${uc.color}`} strokeWidth={1.5} />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-700 group-hover:to-slate-900 transition-colors">
                                {uc.title}
                            </h3>

                            <p className="text-slate-600 leading-relaxed text-[15px] sm:text-base relative z-10 flex-grow group-hover:text-slate-700 transition-colors duration-300 mb-8">
                                {uc.description}
                            </p>

                            <div className="mt-auto space-y-3 relative z-10 font-mono text-sm">
                                {uc.bullets.map((bullet, idx) => (
                                    <p key={idx} className={`p-4 rounded-xl border bg-slate-50 border-slate-100 ${uc.color} bg-opacity-50 break-words`}>
                                        {bullet}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
