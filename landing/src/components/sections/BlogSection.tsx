"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const POSTS = [
  {
    title: "Exactly-Once Execution for AI Agents",
    description: "Agents retry blindly. Retry logic in agent code hopes for idempotency. Here's why exactly-once execution needs to be infrastructure — not application code.",
    date: "2026-04",
    category: "Architecture",
    accent: "text-[#00ffc8]",
    border: "border-[#00ffc8]/15",
    href: "/blog",
  },
  {
    title: "The Multi-Agent Coordination Problem",
    description: "Two agents. Same customer. Conflicting decisions. The coordination layer that prevents this doesn't exist yet — here's what it needs to look like.",
    date: "2026-05",
    category: "Research",
    accent: "text-[#7a756e]",
    border: "border-[#7a756e]/15",
    href: "/blog",
  },
  {
    title: "EU AI Act Article 12 and AI Agents",
    description: "Article 12 requires logging. Article 14 requires human oversight. Here's how tamper-evident receipts and HITL escalation map to both requirements.",
    date: "2026-05",
    category: "Compliance",
    accent: "text-[#7a756e]",
    border: "border-[#7a756e]/15",
    href: "/blog",
  },
];

export function BlogSection() {
  return (
    <section className="relative py-32 overflow-hidden section-divider">

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12 gap-6"
        >
          <div>
            <p className="mb-3 text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#7a756e]">
              Writing
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#e8e5de] leading-[1.1]">
              From the team.
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex text-sm font-medium text-[#5a5a7a] hover:text-white transition-colors duration-150 whitespace-nowrap cursor-pointer"
          >
            All posts →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {POSTS.map((post, i) => (
            <motion.a
              key={post.title}
              href={post.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group flex flex-col rounded-3xl border ${post.border} bg-[#0a0a12] p-7 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className={`text-[10px] font-mono font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${post.border} ${post.accent}`}>
                  {post.category}
                </span>
                <span className="text-[10px] font-mono text-[#3a3a4a]">{post.date}</span>
              </div>
              <h3 className="text-[#e8e5de] font-bold text-base leading-snug mb-3 group-hover:text-white transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-[#6a6a7a] leading-relaxed flex-1">
                {post.description}
              </p>
              <div className={`mt-5 pt-4 border-t border-white/6 text-[11px] font-mono ${post.accent} group-hover:opacity-100 opacity-60 transition-opacity`}>
                Read article →
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/blog" className="text-sm text-[#5a5a7a] hover:text-white transition-colors cursor-pointer">
            All posts →
          </Link>
        </div>

      </div>
    </section>
  );
}
