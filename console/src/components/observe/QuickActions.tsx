"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function QuickActions() {
  return (
    <div
      className="bg-brand-paper border border-brand-rule p-4"
      style={{ borderRadius: "var(--radius)" }}
    >
      <p className="eyebrow mb-3">Quick actions</p>

      <div className="flex flex-col gap-2">
        <Link
          href="/policies"
          className="flex items-center gap-2 px-3 py-2 font-mono text-brand-ink border border-brand-rule hover:border-brand-accent hover:text-brand-accent transition-colors"
          style={{ fontSize: 12, borderRadius: "var(--radius-sm)" }}
        >
          + New policy
        </Link>

        <Link
          href="/team"
          className="flex items-center gap-2 px-3 py-2 font-mono text-brand-ink border border-brand-rule hover:border-brand-accent hover:text-brand-accent transition-colors"
          style={{ fontSize: 12, borderRadius: "var(--radius-sm)" }}
        >
          + Invite teammate
        </Link>

        <a
          href="https://docs.statis.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 px-3 py-2 font-mono text-brand-muted border border-brand-rule hover:border-brand-muted hover:text-brand-ink-soft transition-colors"
          style={{ fontSize: 12, borderRadius: "var(--radius-sm)" }}
        >
          View docs
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
