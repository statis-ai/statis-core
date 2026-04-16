"use client";

import Link from "next/link";
import { StatisGlyph } from "./StatisLogo";

const LINKS = {
  Product: [
    { label: "Pricing", href: "/pricing", external: false },
    { label: "Console", href: "https://console.statis.dev", external: true },
    { label: "Docs", href: "https://docs.statis.dev", external: true },
    { label: "Changelog", href: "/changelog", external: false },
  ],
  Developers: [
    { label: "Context Debugger", href: "/debug", external: false },
    { label: "GitHub", href: "https://github.com/statis-ai/statis-sdk", external: true },
    { label: "Python SDK", href: "https://pypi.org/project/statis-kit/", external: true },
    { label: "TypeScript SDK", href: "https://www.npmjs.com/package/statis-kit", external: true },
    { label: "API Reference", href: "https://docs.statis.dev/api", external: true },
  ],
  Resources: [
    { label: "Blog", href: "/blog", external: false },
    { label: "Integrations", href: "/integrations", external: false },
    { label: "MCP", href: "/mcp", external: false },
  ],
  Company: [
    { label: "About", href: "/about", external: false },
    { label: "Enterprise", href: "mailto:hello@statis.dev?subject=Enterprise%20inquiry", external: false },
    { label: "Contact", href: "mailto:hello@statis.dev", external: false },
  ],
  Legal: [
    { label: "Terms", href: "/terms", external: false },
    { label: "Privacy", href: "/privacy", external: false },
    { label: "Security", href: "/security", external: false },
  ],
};

function SocialIcon({ d, label, href }: { d: string; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors"
      style={{ color: "var(--text-muted)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
      aria-label={label}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d={d} />
      </svg>
    </a>
  );
}

export function LandingFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-[1200px] px-6 pt-20 pb-10">
        {/* Top: brand + status */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-16 pb-14" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <div className="inline-flex items-center gap-3.5 text-white">
              <StatisGlyph size={52} />
              <span className="text-[30px] font-bold tracking-tight">statis</span>
            </div>
            <p className="text-[13px] mt-5 max-w-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              The trust layer for agent runtimes. Every context evaluated. Every action
              authorized. Every execution receipted.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399" }} />
              <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>All systems operational</span>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-20">
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-[11px] uppercase tracking-[0.18em] mb-5 font-semibold" style={{ color: "var(--text-muted)" }}>
                {group}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] transition-colors"
                        style={{ color: "var(--text-2)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-2)"; }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[13px] transition-colors"
                        style={{ color: "var(--text-2)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-2)"; }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between flex-wrap gap-5 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-6 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <span>&copy; 2026 Statis Inc.</span>
            <span className="hidden sm:inline">Made in San Francisco</span>
          </div>
          <div className="flex items-center gap-5">
            <SocialIcon
              label="GitHub"
              href="https://github.com/statis-ai"
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
            <SocialIcon
              label="Twitter / X"
              href="https://x.com/statis_ai"
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
            <SocialIcon
              label="LinkedIn"
              href="https://linkedin.com/company/statis-ai"
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
