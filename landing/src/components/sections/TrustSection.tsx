"use client";

import { motion } from "framer-motion";

/* ── Metrics ────────────────────────────────────────────────── */

const metrics = [
    {
        value: "< 2s",
        badge: "P95",
        label: "State Update Latency",
        description: "Event ingestion → materialized state commit.",
    },
    {
        value: "< 300ms",
        badge: "P95",
        label: "Trigger Latency",
        description: "State commit → webhook delivered to your agent.",
    },
    {
        value: "100%",
        badge: "Guaranteed",
        label: "Replay Correctness",
        description:
            "SHA-256 state hashes ensure replay(log) always equals the original state.",
    },
];

/* ── Trust pillar cards ─────────────────────────────────────── */

const pillars = [
    {
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.37 8.138 3.75 3.75 0 005.898 3.262m-4.8-5.4a48.86 48.86 0 017.618-4.88M14.25 18.75a48.86 48.86 0 00-7.618 4.88m4.8 5.4a3.75 3.75 0 01-5.898-3.262 48.892 48.892 0 011.37-8.138" />
            </svg>
        ),
        title: "Deterministic Hashing",
        description:
            "Every materialized state is signed with SHA-256. Replay any event sequence — you'll get the exact same state_hash.",
        color: "cyan",
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
            </svg>
        ),
        title: "Conflict Hierarchy",
        description:
            "Explicit resolution: Human > System > Agent. AI agents can never override human decisions, by design.",
        color: "violet",
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        title: "Role-Based Visibility",
        description:
            "RBAC at the state field level. Billing can't see sentiment. Sales can't see payment data.",
        color: "green",
    },
];

const colorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    cyan: {
        border: "border-cyan-500/20 hover:border-cyan-500/40",
        bg: "bg-cyan-500/5",
        text: "text-cyan-400",
        glow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]",
    },
    violet: {
        border: "border-violet-500/20 hover:border-violet-500/40",
        bg: "bg-violet-500/5",
        text: "text-violet-400",
        glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]",
    },
    green: {
        border: "border-green-500/20 hover:border-green-500/40",
        bg: "bg-green-500/5",
        text: "text-green-400",
        glow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.08)]",
    },
};

/* ── Code block with IDE frame ──────────────────────────────── */

const codeLines = [
    { num: 1, text: "// Reconstruct the exact state at any revision", cls: "text-gray-500" },
    { num: 2, text: "const audit = await statis.state.at({", cls: "text-gray-300" },
    { num: 3, text: '  entity_id: "acct-42",', cls: "text-gray-300" },
    { num: 4, text: "  rev: 105,", cls: "text-gray-300" },
    { num: 5, text: "});", cls: "text-gray-300" },
    { num: 6, text: "", cls: "" },
    { num: 7, text: "audit.state_hash;   // Cryptographic proof", cls: "text-cyan-300" },
    { num: 8, text: "audit.provenance;   // Who caused this change", cls: "text-cyan-300" },
    { num: 9, text: "audit.triggered_by; // The exact event", cls: "text-cyan-300" },
];

/* ── Main Section ───────────────────────────────────────────── */

export function TrustSection() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32 border-t border-white/5 bg-[#060606]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-2xl text-center mb-16"
                >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent mb-4">
                        Engineer to Engineer
                    </p>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Built for the P95.
                    </h2>
                    <p className="mt-5 text-lg text-brand-muted max-w-xl mx-auto">
                        The performance guarantees and governance model your VP
                        of Engineering needs to say yes.
                    </p>
                </motion.div>

                {/* Compact metric row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
                >
                    {metrics.map((m, i) => (
                        <div
                            key={i}
                            className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center group hover:border-brand-accent/20 transition-all duration-300"
                        >
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-4xl font-extrabold tracking-tight text-white">
                                    {m.value}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full border border-brand-accent/20">
                                    {m.badge}
                                </span>
                            </div>
                            <div className="mt-2 text-sm font-semibold text-brand-muted uppercase tracking-wide">
                                {m.label}
                            </div>
                            <p className="mt-2 text-xs text-brand-muted/70 leading-relaxed">
                                {m.description}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* Identity cards for trust pillars */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                >
                    {pillars.map((p, i) => {
                        const c = colorMap[p.color];
                        return (
                            <div
                                key={i}
                                className={`group rounded-2xl border ${c.border} ${c.glow} bg-white/[0.02] p-6 transition-all duration-300`}
                            >
                                <div
                                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} ${c.text}`}
                                >
                                    {p.icon}
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">
                                    {p.title}
                                </h3>
                                <p className="text-sm text-brand-muted leading-relaxed">
                                    {p.description}
                                </p>
                            </div>
                        );
                    })}
                </motion.div>

                {/* IDE-framed code snippet */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="rounded-xl bg-[#0c0c0c] border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)]">
                        {/* IDE title bar */}
                        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                                <span className="ml-3 text-[10px] font-mono text-brand-muted/60">
                                    audit.ts
                                </span>
                            </div>
                            {/* Verified badge */}
                            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-0.5">
                                <svg
                                    className="w-3 h-3 text-green-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">
                                    Verified
                                </span>
                            </div>
                        </div>

                        {/* Code with line numbers */}
                        <pre className="p-0 font-mono text-xs leading-relaxed overflow-x-auto">
                            {codeLines.map((line) => (
                                <div
                                    key={line.num}
                                    className="flex hover:bg-white/[0.02] transition-colors"
                                >
                                    <span className="select-none w-10 text-right px-3 py-0.5 text-brand-muted/30 border-r border-white/5">
                                        {line.num}
                                    </span>
                                    <code
                                        className={`px-4 py-0.5 ${line.cls}`}
                                    >
                                        {line.text}
                                    </code>
                                </div>
                            ))}
                        </pre>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
