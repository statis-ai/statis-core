"use client";

import Link from "next/link";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/reveal";

const POSTS = [
  {
    title: "Exactly-Once Execution for AI Agents",
    description: "Agents retry blindly. Retry logic in agent code hopes for idempotency. Here's why exactly-once execution needs to be infrastructure — not application code.",
    date: "2026-04",
    category: "Architecture",
    href: "/blog",
  },
  {
    title: "The Multi-Agent Coordination Problem",
    description: "Two agents. Same customer. Conflicting decisions. The coordination layer that prevents this doesn't exist yet — here's what it needs to look like.",
    date: "2026-05",
    category: "Research",
    href: "/blog",
  },
  {
    title: "EU AI Act Article 12 and AI Agents",
    description: "Article 12 requires logging. Article 14 requires human oversight. Here's how tamper-evident receipts and HITL escalation map to both requirements.",
    date: "2026-05",
    category: "Compliance",
    href: "/blog",
  },
];

export function BlogSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="text-center mb-12">
            <div className="mb-5">
              <SectionEyebrow align="center" variant="accent">
                Writing
              </SectionEyebrow>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3" style={{ color: "var(--text)" }}>
              From the team.
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-2)" }}>
              Thinking on agent infrastructure, governance, and the systems that make AI production-safe.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {POSTS.map((post, i) => (
            <Reveal key={post.title} delay={i * 0.08}>
              <Link
                href={post.href}
                className="group flex flex-col rounded-lg p-6 transition-all duration-200"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderTop: "1px solid rgba(249,115,22,0.20)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(249,115,22,0.25)";
                  e.currentTarget.style.borderTopColor = "rgba(249,115,22,0.45)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.10), 0 0 24px rgba(249,115,22,0.04)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.borderTopColor = "rgba(249,115,22,0.20)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-[9px] font-mono font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full"
                    style={{
                      color: "var(--orange)",
                      background: "rgba(249,115,22,0.08)",
                      border: "1px solid rgba(249,115,22,0.18)",
                    }}
                  >
                    {post.category}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{post.date}</span>
                </div>
                <h3 className="font-bold text-sm leading-snug mb-3 group-hover:text-[var(--orange)] transition-colors" style={{ color: "var(--text)" }}>
                  {post.title}
                </h3>
                <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--text-2)" }}>
                  {post.description}
                </p>
                <div
                  className="mt-5 pt-4 text-[11px] font-mono group-hover:opacity-100 opacity-60 transition-opacity"
                  style={{ borderTop: "1px solid var(--border)", color: "var(--orange)" }}
                >
                  Read article →
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="text-sm transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--orange)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              All posts →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
