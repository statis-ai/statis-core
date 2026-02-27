"use client";

import { motion } from "framer-motion";

export function PrimitivesSection() {
    return (
        <section className="relative overflow-hidden py-32 bg-[#0a0a0a]">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-24">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-4">
                        Under the Hood
                    </h2>
                    <h3 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl font-serif">
                        How It Works
                    </h3>
                    <p className="mt-6 text-lg leading-8 text-slate-400">
                        Four primitives that turn autonomous chaos into predictable coordination.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Step 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="group flex flex-col gap-6 cursor-default"
                    >
                        <div className="h-64 rounded-3xl bg-white/5 border border-white/10 shadow-sm relative overflow-hidden flex items-center justify-center p-6 transition-all duration-500 hover:bg-white/10 hover:border-indigo-500/30">
                            {/* Inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Step 1 Animation (Stacking facts) */}
                            <div className="relative w-full h-full flex flex-col items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 font-mono text-[10px]">
                                <motion.div className="w-4/5 max-w-[140px] bg-slate-800 border border-slate-700 rounded-lg p-3 absolute bottom-8 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300">
                                    <span className="text-emerald-400">log</span>.info("event", data)
                                </motion.div>
                                <motion.div className="w-5/6 max-w-[160px] bg-slate-800 border border-slate-700 rounded-lg p-3 absolute bottom-12 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                                    <span className="text-emerald-400">log</span>.info("state", update)
                                </motion.div>
                                <motion.div className="w-full max-w-[180px] bg-indigo-900/50 border border-indigo-500/50 rounded-lg p-3 absolute bottom-16 z-20 opacity-50 group-hover:opacity-100 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-500">
                                    <span className="text-indigo-400">append</span>("semantic_log")
                                </motion.div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-5xl font-bold font-serif text-slate-700/50 group-hover:text-indigo-500 transition-colors leading-none -mt-1">1</span>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Capture What Happened</h3>
                                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                    Agents, services, and humans publish meaningful facts to an append-only semantic log.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="group flex flex-col gap-6 cursor-default"
                    >
                        <div className="h-64 rounded-3xl bg-white/5 border border-white/10 shadow-sm relative overflow-hidden flex items-center justify-center p-6 transition-all duration-500 hover:bg-white/10 hover:border-violet-500/30">
                            {/* Inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Step 2 Animation (JSON compiling) */}
                            <div className="relative w-full max-w-[200px] h-36 bg-[#0f172a] border border-slate-700/50 shadow-inner rounded-xl p-4 text-[11px] font-mono text-slate-400 overflow-hidden flex flex-col justify-center">
                                <div>{"{"}</div>
                                <div className="pl-4 pb-1">"id": "agent_x",</div>
                                <motion.div className="pl-4 pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    <span className="text-violet-400">"status"</span>: <span className="text-slate-300">"idle"</span>,
                                </motion.div>
                                <motion.div className="pl-4 pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300">
                                    <span className="text-violet-400">"context"</span>: <span className="text-slate-300">"ready"</span>
                                </motion.div>
                                <div>{"}"}</div>

                                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity delay-500 shadow-[0_0_10px_rgba(139,92,246,1)]" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-5xl font-bold font-serif text-slate-700/50 group-hover:text-violet-500 transition-colors leading-none -mt-1">2</span>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Materialize State</h3>
                                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                    Statis turns those facts into a single, trusted state per entity — deterministically.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="group flex flex-col gap-6 cursor-default"
                    >
                        <div className="h-64 rounded-3xl bg-white/5 border border-white/10 shadow-sm relative overflow-hidden flex items-center justify-center p-6 transition-all duration-500 hover:bg-white/10 hover:border-emerald-500/30">
                            {/* Inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Step 3 Animation (Webhooks pushing out) */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Center Node */}
                                <div className="w-12 h-12 rounded-full bg-slate-900 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] z-10 flex items-center justify-center group-hover:border-emerald-400 transition-colors">
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full group-hover:animate-ping opacity-80" />
                                </div>

                                {/* Orbiting Dots */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <motion.div className="absolute w-2 h-2 rounded-full bg-slate-400 left-8 top-12" />
                                    <motion.div className="absolute w-2 h-2 rounded-full bg-slate-400 right-8 top-16" />
                                    <motion.div className="absolute w-2 h-2 rounded-full bg-slate-400 right-14 bottom-12" />
                                </div>

                                {/* Dashed SVG lines */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <line x1="50%" y1="50%" x2="25%" y2="30%" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" className="group-hover:animate-flow-dash" opacity="0.5" />
                                    <line x1="50%" y1="50%" x2="75%" y2="35%" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" className="group-hover:animate-flow-dash" opacity="0.5" />
                                    <line x1="50%" y1="50%" x2="65%" y2="70%" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" className="group-hover:animate-flow-dash" opacity="0.5" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-5xl font-bold font-serif text-slate-700/50 group-hover:text-emerald-500 transition-colors leading-none -mt-1">3</span>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Push in Real Time</h3>
                                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                    When state changes, subscribed systems are notified instantly via webhooks.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Step 4 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="group flex flex-col gap-6 cursor-default"
                    >
                        <div className="h-64 rounded-3xl bg-white/5 border border-white/10 shadow-sm relative overflow-hidden flex items-center justify-center p-6 transition-all duration-500 hover:bg-white/10 hover:border-cyan-500/30">
                            {/* Inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Step 4 Animation (Time rewind) */}
                            <div className="relative w-full max-w-[200px] h-10 border border-slate-700/50 rounded-full bg-slate-900/50 flex items-center px-4 shadow-inner">
                                <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden relative">
                                    <div className="absolute inset-y-0 left-0 bg-cyan-500 w-full group-hover:w-1/3 transition-all duration-[1.5s] ease-in-out" />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 ml-3 flex items-center justify-center absolute right-[10px] group-hover:right-[120px] transition-all duration-[1.5s] ease-in-out z-10 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                    <svg className="w-3 h-3 text-cyan-400 -ml-0.5 group-hover:-rotate-180 transition-transform duration-[1.5s] ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </div>
                                {/* Ghost element showing old position */}
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 opacity-0 group-hover:opacity-50 absolute right-[20px] transition-opacity duration-300 delay-500" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-5xl font-bold font-serif text-slate-700/50 group-hover:text-cyan-500 transition-colors leading-none -mt-1">4</span>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Replay Any Moment</h3>
                                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                    Rebuild state at any revision. See exactly what the system knew, when.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>

                <div className="mt-20 pt-10 border-t border-white/5 text-center">
                    <p className="inline-block text-lg text-slate-400 font-medium px-6 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                        The same inputs always produce the same state. <span className="text-indigo-400 font-semibold cursor-default hover:text-indigo-300 transition-colors">Autonomy becomes predictable.</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
