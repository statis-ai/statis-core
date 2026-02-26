"use client";

import { motion } from "framer-motion";

export function PrimitivesSection() {
    return (
        <section className="relative overflow-hidden py-32 bg-gray-50">
            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-20">
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl font-serif">
                        How Statis Works
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-gray-500">
                        Built on four non-negotiable primitives to guarantee exact-state replication across your entire swarm.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {/* Step 1 */}
                    <div className="group flex flex-col gap-6 cursor-default">
                        <div className="h-64 rounded-3xl bg-white border border-gray-100 shadow-sm relative overflow-hidden flex items-center justify-center p-6 transition-all duration-500 group-hover:shadow-md group-hover:border-indigo-100">
                            {/* Graph paper bg */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-50" />

                            {/* Step 1 Animation (Stacking facts) */}
                            <div className="relative w-full h-full flex flex-col items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <motion.div
                                    className="w-3/4 max-w-[140px] bg-white border border-gray-200 rounded-lg p-3 shadow-sm absolute bottom-8 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300"
                                >
                                    <div className="h-2 w-16 bg-indigo-100 rounded mb-2" />
                                    <div className="h-1.5 w-full bg-gray-100 rounded" />
                                </motion.div>
                                <motion.div
                                    className="w-4/5 max-w-[160px] bg-white border border-gray-200 rounded-lg p-3 shadow-sm absolute bottom-12 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150"
                                >
                                    <div className="h-2 w-20 bg-indigo-200 rounded mb-2" />
                                    <div className="h-1.5 w-full bg-gray-100 rounded" />
                                </motion.div>
                                <motion.div
                                    className="w-full max-w-[180px] bg-white border border-gray-200 rounded-lg p-3 shadow-md absolute bottom-16 z-20 opacity-50 group-hover:opacity-100 transition-all duration-500"
                                >
                                    <div className="h-2 w-24 bg-indigo-600 rounded mb-2" />
                                    <div className="h-1.5 w-full bg-gray-100 rounded" />
                                </motion.div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-6xl font-serif text-gray-200 leading-none -mt-2">1</span>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">The Truth</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Agents append immutable facts to a central log. You always know exactly who claimed what, and when.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="group flex flex-col gap-6 cursor-default">
                        <div className="h-64 rounded-3xl bg-white border border-gray-100 shadow-sm relative overflow-hidden flex items-center justify-center p-6 transition-all duration-500 group-hover:shadow-md group-hover:border-violet-100">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-50" />

                            {/* Step 2 Animation (JSON compiling) */}
                            <div className="relative w-full max-w-[200px] h-32 bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-[10px] font-mono text-gray-400 overflow-hidden flex flex-col justify-center">
                                <div>{"{"}</div>
                                <div className="pl-4 pb-1">"id": "user_42",</div>
                                <motion.div className="pl-4 pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    <span className="text-violet-600">"status"</span>: <span className="text-gray-800">"active"</span>,
                                </motion.div>
                                <motion.div className="pl-4 pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300">
                                    <span className="text-violet-600">"plan"</span>: <span className="text-gray-800">"enterprise"</span>
                                </motion.div>
                                <div>{"}"}</div>

                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-400 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity delay-500" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-6xl font-serif text-gray-200 leading-none -mt-2">2</span>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Gold Record</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    We instantly reduce the event stream into a cryptographically verified, materialized JSON state.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="group flex flex-col gap-6 cursor-default">
                        <div className="h-64 rounded-3xl bg-white border border-gray-100 shadow-sm relative overflow-hidden flex items-center justify-center p-6 transition-all duration-500 group-hover:shadow-md group-hover:border-green-100">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-50" />

                            {/* Step 3 Animation (Webhooks pushing out) */}
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Center Node */}
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-green-500 shadow-sm z-10 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-green-500 rounded-full group-hover:animate-ping" />
                                </div>

                                {/* Orbiting / Connected Nodes */}
                                <motion.div className="absolute w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm z-20 flex items-center justify-center left-4 top-12 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100 text-xs">🎧</motion.div>
                                <motion.div className="absolute w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm z-20 flex items-center justify-center right-4 top-16 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-200 text-xs">💼</motion.div>
                                <motion.div className="absolute w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm z-20 flex items-center justify-center right-12 bottom-8 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-300 text-xs">🤖</motion.div>

                                {/* Dashed SVG lines */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" className="group-hover:animate-flow-dash" />
                                    <line x1="50%" y1="50%" x2="80%" y2="35%" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" className="group-hover:animate-flow-dash" />
                                    <line x1="50%" y1="50%" x2="65%" y2="75%" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" className="group-hover:animate-flow-dash" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-6xl font-serif text-gray-200 leading-none -mt-2">3</span>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">The Pulse</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Statis pushes the golden state to your entire swarm via webhooks the millisecond it changes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="group flex flex-col gap-6 cursor-default">
                        <div className="h-64 rounded-3xl bg-white border border-gray-100 shadow-sm relative overflow-hidden flex items-center justify-center p-6 transition-all duration-500 group-hover:shadow-md group-hover:border-cyan-100">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-50" />

                            {/* Step 4 Animation (Time rewind) */}
                            <div className="relative w-full max-w-[200px] h-10 border border-gray-200 rounded-full bg-white flex items-center px-4 shadow-sm">
                                <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden relative">
                                    <div className="absolute inset-y-0 left-0 bg-cyan-400 w-full group-hover:w-1/3 transition-all duration-1000 ease-in-out" />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm ml-3 flex items-center justify-center absolute right-[10px] group-hover:right-[120px] transition-all duration-1000 ease-in-out z-10">
                                    <svg className="w-3 h-3 text-cyan-600 group-hover:animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                {/* Ghost element showing old position */}
                                <div className="w-4 h-4 rounded-full border border-gray-200 opacity-0 group-hover:opacity-50 absolute right-[14px] transition-opacity duration-300 delay-500" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-6xl font-serif text-gray-200 leading-none -mt-2">4</span>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Time Machine</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Replay any event sequence to audit workflows. See exactly what an agent knew at revision <em className="italic">N</em>.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
