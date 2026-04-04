import Link from "next/link";
import { Logo } from "./Logo";

const LINKS = {
  Product: [
    { label: "Console",    href: "https://console.statis.dev",             external: true  },
    { label: "Docs",       href: "https://docs.statis.dev",                external: true  },
  ],
  Developers: [
    { label: "GitHub",         href: "https://github.com/statis-ai/statis-sdk", external: true },
    { label: "Python SDK",     href: "https://pypi.org/project/statis-ai/",     external: true },
    { label: "TypeScript SDK", href: "https://www.npmjs.com/package/statis-ai", external: true },
  ],
  Company: [
    { label: "Blog",            href: "/blog",                                    external: false },
    { label: "Enterprise",       href: "https://www.surveymonkey.com/r/GVKH2KR", external: true  },
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

export function Footer() {
  return (
    <footer style={{ background: "#191919", borderTop: "1px solid #1a1a1a" }}>
      <div className="mx-auto max-w-5xl px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-16">

          {/* brand */}
          <div className="space-y-3">
            <Logo />
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Agent execution infrastructure.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://x.com/statis_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="link-muted"
                aria-label="Twitter / X"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://linkedin.com/company/statis-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="link-muted"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* links */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h3
                className="text-[10px] uppercase tracking-[0.2em] mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link text-xs"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="link text-xs">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-10 pt-6 flex items-center justify-between"
          style={{ borderTop: "1px solid #1a1a1a" }}
        >
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            &copy; 2026 Statis Inc.
          </span>
          <div className="flex gap-5">
            <a href="#" className="link-muted text-[10px]">Terms</a>
            <a href="#" className="link-muted text-[10px]">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
