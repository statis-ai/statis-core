"use client";

import Link from "next/link";

const STEPS = [
  {
    n: "1",
    title: "Get your API key",
    body: "Create a key in the Developers tab. Your agents will use it to propose actions.",
    cta: { label: "Developers →", href: "/developers" },
  },
  {
    n: "2",
    title: "Install the SDK",
    body: "Wrap any function your agent calls. No framework assumptions.",
    code: "pip install statis-ai",
  },
  {
    n: "3",
    title: "Gate your first function",
    body: "One decorator. Your agent asks permission before it executes.",
    snippet: `from statis import gate\n\n@gate("send_money")\ndef send_money(amount, recipient):\n    ...`,
  },
];

export function EmptyHome() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <p className="eyebrow mb-2">Workspace ready</p>
        <h1
          className="text-brand-ink"
          style={{ fontSize: 28, fontWeight: 300, letterSpacing: "-0.03em" }}
        >
          No actions yet. Let&apos;s get your first agent running.
        </h1>
      </div>

      <div
        className="halftone-bg relative bg-brand-paper border border-brand-rule p-8 overflow-hidden"
        style={{ borderRadius: "var(--radius)" }}
      >
        <p
          className="font-mono uppercase text-brand-muted mb-6"
          style={{ fontSize: 10, letterSpacing: "0.14em" }}
        >
          Get started in 3 steps
        </p>

        <div className="flex flex-col gap-8">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-5">
              <div
                className="shrink-0 w-7 h-7 border border-brand-rule bg-brand-deep flex items-center justify-center font-mono text-brand-muted"
                style={{ borderRadius: "var(--radius-sm)", fontSize: 11 }}
              >
                {step.n}
              </div>
              <div>
                <p className="text-sm font-medium text-brand-ink mb-1">{step.title}</p>
                <p className="text-brand-muted mb-3" style={{ fontSize: 13 }}>{step.body}</p>
                {step.cta && (
                  <Link
                    href={step.cta.href}
                    className="inline-flex items-center gap-1.5 font-mono text-brand-ink border border-brand-rule px-3 py-1.5 hover:border-brand-accent hover:text-brand-accent transition-colors"
                    style={{ fontSize: 12, borderRadius: "var(--radius-sm)" }}
                  >
                    {step.cta.label}
                  </Link>
                )}
                {step.code && (
                  <div
                    className="font-mono text-brand-ink-soft bg-brand-deep border border-brand-rule px-3 py-2 w-fit"
                    style={{ fontSize: 12, borderRadius: "var(--radius-sm)" }}
                  >
                    {step.code}
                  </div>
                )}
                {step.snippet && (
                  <pre
                    className="font-mono text-brand-muted bg-brand-deep border border-brand-rule px-4 py-3 overflow-x-auto"
                    style={{ fontSize: 12, lineHeight: 1.7, borderRadius: "var(--radius-sm)" }}
                  >
                    {step.snippet}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-brand-rule flex items-center gap-4">
          <a
            href="https://docs.statis.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-brand-muted hover:text-brand-accent transition-colors"
            style={{ fontSize: 12 }}
          >
            Docs →
          </a>
          <a
            href="https://statis.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-brand-muted hover:text-brand-accent transition-colors"
            style={{ fontSize: 12 }}
          >
            How it works →
          </a>
        </div>
      </div>
    </div>
  );
}
