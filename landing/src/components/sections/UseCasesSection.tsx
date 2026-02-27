"use client";

import { motion } from "framer-motion";
import { Headphones, BriefcaseBusiness, ShieldCheck } from "lucide-react";

export function UseCasesSection() {
    const useCases = [
        {
            title: "Customer Operations",
            description: "When an outage is reported: churn risk updates, sales pauses outreach, billing suspends dunning, CSM escalates. All triggered from the same shared state. No race conditions. No cross-team misfires.",
            icon: Headphones,
            color: "text-blue-500",
            bgLight: "bg-blue-50/50",
            borderLight: "border-blue-100",
            gradient: "from-blue-500/10 via-transparent to-transparent",
        },
        {
            title: "Revenue & Lifecycle Automation",
            description: "When billing changes: outreach adjusts, risk recalculates, workflows react. No polling. No stale dashboards.",
            icon: BriefcaseBusiness,
            color: "text-amber-500",
            bgLight: "bg-amber-50/50",
            borderLight: "border-amber-100",
            gradient: "from-amber-500/10 via-transparent to-transparent",
        },
        {
            title: "Governance & Audit",
            description: "For high-risk AI decisions: replay any revision, inspect contributing facts, trace which rule fired, verify what an agent knew. Autonomous systems require explainable foundations.",
            icon: ShieldCheck,
            color: "text-emerald-500",
            bgLight: "bg-emerald-50/50",
            borderLight: "border-emerald-100",
            gradient: "from-emerald-500/10 via-transparent to-transparent",
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
        <section className="py-24 sm:py-32 bg-[#fafafa] relative w-full overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 mix-blend-multiply pointer-events-none" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl font-serif mb-6"
                    >
                        Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Coordinated Autonomy</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg leading-8 text-slate-500"
                    >
                        Stop hardcoding logic between agents. Build loosely coupled systems that react to a shared reality.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                >
                    {useCases.map((uc, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="group relative flex flex-col h-full rounded-[2.5rem] bg-white border border-slate-200/60 p-10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300 transition-all duration-500 overflow-hidden"
                        >
                            {/* Subtle Radial Gradient Background */}
                            <div className={`absolute top-0 right-0 w-[250px] h-[250px] bg-gradient-to-bl ${uc.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-bl-full`} />

                            <div className={`w-14 h-14 rounded-2xl ${uc.bgLight} border ${uc.borderLight} flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10`}>
                                <uc.icon className={`w-6 h-6 ${uc.color}`} strokeWidth={1.5} />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-colors">
                                {uc.title}
                            </h3>

                            <p className="text-slate-500 leading-relaxed text-[15px] relative z-10 flex-grow group-hover:text-slate-600 transition-colors duration-300">
                                {uc.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
