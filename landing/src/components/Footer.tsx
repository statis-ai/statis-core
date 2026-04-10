import Link from "next/link";
import { Logo } from "./Logo";
import { StatusPill } from "./ui/StatusPill";
import { NewsletterForm } from "./ui/NewsletterForm";

const LINKS = {
  Product: [
    { label: "Console",   href: "https://console.statis.dev", external: true },
    { label: "Docs",      href: "https://docs.statis.dev",    external: true },
    { label: "Changelog", href: "/changelog",                 external: false },
    { label: "Method",    href: "#method",                    external: false },
  ],
  Developers: [
    { label: "GitHub",         href: "https://github.com/statis-ai/statis-sdk",  external: true },
    { label: "Python SDK",     href: "https://pypi.org/project/statis-ai/",      external: true },
    { label: "TypeScript SDK", href: "https://www.npmjs.com/package/statis-ai",  external: true },
    { label: "API Reference",  href: "https://docs.statis.dev/api",              external: true },
    { label: "Self-host",      href: "https://docs.statis.dev/self-host",        external: true },
  ],
  Resources: [
    { label: "Blog",           href: "/blog",         external: false },
    { label: "Integrations",   href: "/integrations", external: false },
    { label: "MCP Connectors", href: "/mcp",          external: false },
  ],
  Company: [
    { label: "About",       href: "/about",                                  external: false },
    { label: "Enterprise",  href: "https://www.surveymonkey.com/r/GVKH2KR",  external: true  },
    { label: "Contact",     href: "mailto:hello@statis.dev",                 external: false },
  ],
  Legal: [
    { label: "Terms",    href: "/terms",    external: false },
    { label: "Privacy",  href: "/privacy",  external: false },
    { label: "Security", href: "/security", external: false },
  ],
};

function TwitterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "#0A0806",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-10 relative z-10">
        {/* ── Top row: brand + newsletter ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 pb-14"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="md:col-span-2">
            <Logo />
            <p className="text-[13px] mt-5 max-w-md leading-relaxed" style={{ color: "#A1A1AA" }}>
              Agent execution infrastructure. Policy before every action. Exactly-once
              execution guarantee. SHA-256 tamper-evident receipt on every outcome.
            </p>
            <div className="mt-6">
              <StatusPill />
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.18em] mb-3 font-semibold"
              style={{ color: "#71717A" }}
            >
              Stay updated
            </p>
            <p className="text-[13px] mb-4 leading-relaxed" style={{ color: "#A1A1AA" }}>
              Monthly updates on agent infrastructure and governance. No spam, unsubscribe anytime.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* ── Link columns ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-20">
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h3
                className="text-[11px] uppercase tracking-[0.18em] mb-5 font-semibold"
                style={{ color: "#71717A" }}
              >
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
                        className="text-[13px] transition-colors hover:text-white"
                        style={{ color: "#A1A1AA" }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[13px] transition-colors hover:text-white"
                        style={{ color: "#A1A1AA" }}
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

        {/* ── Bottom row: legal + social ── */}
        <div
          className="flex items-center justify-between flex-wrap gap-5 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-6 text-[11px]" style={{ color: "#71717A" }}>
            <span>© 2026 Statis Inc.</span>
            <span className="hidden sm:inline">Made in San Francisco</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/statis-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
              style={{ color: "#71717A" }}
              aria-label="GitHub"
            >
              <GitHubIcon />
            </a>
            <a
              href="https://x.com/statis_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
              style={{ color: "#71717A" }}
              aria-label="Twitter / X"
            >
              <TwitterIcon />
            </a>
            <a
              href="https://linkedin.com/company/statis-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
              style={{ color: "#71717A" }}
              aria-label="LinkedIn"
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>
      </div>

      {/* ── Giant brand wordmark ── */}
      <div
        aria-hidden
        className="relative pointer-events-none select-none"
        style={{ marginTop: "1rem", marginBottom: "-3%" }}
      >
        <div
          className="text-center font-black leading-[0.8] tracking-[-0.05em]"
          style={{
            fontSize: "clamp(7rem, 26vw, 24rem)",
            background:
              "linear-gradient(180deg, rgba(232,196,140,0.09) 0%, rgba(232,196,140,0.02) 70%, rgba(232,196,140,0) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          statis
        </div>
      </div>
    </footer>
  );
}
