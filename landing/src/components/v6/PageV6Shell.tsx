import type { ReactNode } from "react";
import "./page-v6.css";
import { StatisMark } from "@/components/brand/StatisMark";

export function TopbarV6({ currentRoute }: { currentRoute?: string }) {
  const links = [
    { href: "/blog", label: "Blog" },
    { href: "https://github.com/statis-ai", label: "GitHub", external: true },
    { href: "https://docs.statis.dev", label: "Docs", external: true },
  ];

  return (
    <div className="pv6-topbar">
      <a href="/" className="pv6-brand">
        <span className="pv6-brand-mark">
          <StatisMark size={22} accent="#fb923c" bar="#fafafa" />
        </span>
        Statis
        <span className="pv6-brand-tag">v0.2 · beta</span>
      </a>

      <nav className="pv6-nav" aria-label="Primary">
        {links.map(({ href, label, external }) => (
          <a
            key={href}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener" } : {})}
            aria-current={currentRoute === href ? "page" : undefined}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="pv6-topbar-right">
        <a href="https://console.statis.dev" className="pv6-signin" rel="noopener">
          Sign in
        </a>
        <a href="/quickstart" className="pv6-cta-btn">
          Try in 5 min →
        </a>
      </div>
    </div>
  );
}

export function HeroV6({
  eyebrowNum,
  eyebrowText,
  title,
  titleStrong,
  subtitle,
}: {
  eyebrowNum?: string;
  eyebrowText: string;
  title: string;
  titleStrong?: string;
  subtitle?: string;
}) {
  return (
    <div className="pv6-hero">
      <div className="pv6-eyebrow">
        {eyebrowNum && <span className="pv6-eyebrow-num">{eyebrowNum}</span>}
        <span>{eyebrowText}</span>
      </div>
      <h1 className="pv6-hero-title">
        {title}
        {titleStrong && (
          <>
            {" "}
            <strong>{titleStrong}</strong>
          </>
        )}
      </h1>
      {subtitle && <p className="pv6-hero-subtitle">{subtitle}</p>}
    </div>
  );
}

export function SectionV6({
  number,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  number?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="pv6-section">
      {(number || eyebrow || title || subtitle) && (
        <div className="pv6-section-header">
          {(number || eyebrow) && (
            <div className="pv6-eyebrow">
              {number && <span className="pv6-eyebrow-num">{number}</span>}
              {eyebrow && <span>{eyebrow}</span>}
            </div>
          )}
          {title && <h2 className="pv6-section-title">{title}</h2>}
          {subtitle && <p className="pv6-section-subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function FooterV6() {
  return (
    <footer className="pv6-footer">
      <div className="pv6-footer-inner">
        <div className="pv6-footer-top">
          <div className="pv6-footer-brand">
            <a href="/" className="pv6-brand" style={{ fontSize: 15 }}>
              <span className="pv6-brand-mark">
                <StatisMark size={20} accent="#fb923c" bar="#fafafa" />
              </span>
              Statis
            </a>
            <p className="pv6-footer-tagline">
              One decorator. Your agent asks permission before it touches production.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <a href="/quickstart" className="pv6-btn-primary" style={{ fontSize: 10 }}>
                Try in 5 minutes →
              </a>
              <a
                href="mailto:hello@statis.dev?subject=Talk%20to%20a%20founder"
                className="pv6-btn-ghost"
              >
                Talk to a founder
              </a>
            </div>
          </div>

          <div className="pv6-footer-cols">
            <div className="pv6-footer-col">
              <div className="pv6-footer-col-head">Product</div>
              <a href="https://docs.statis.dev" rel="noopener">Documentation</a>
              <a href="/changelog">Changelog</a>
              <a href="/pricing">Pricing</a>
              <a href="https://pypi.org/project/statis-ai/" rel="noopener">PyPI</a>
            </div>
            <div className="pv6-footer-col">
              <div className="pv6-footer-col-head">Developers</div>
              <a href="https://docs.statis.dev/gate/reference" rel="noopener">Gate reference</a>
              <a href="https://docs.statis.dev/policies" rel="noopener">Policy syntax</a>
              <a href="https://docs.statis.dev/receipts/schema" rel="noopener">Receipt schema</a>
              <a href="https://github.com/statis-ai" rel="noopener">GitHub</a>
            </div>
            <div className="pv6-footer-col">
              <div className="pv6-footer-col-head">Company</div>
              <a href="/blog">Blog</a>
              <a href="/about">About</a>
              <a href="mailto:hello@statis.dev">Contact</a>
              <a href="/security">Security</a>
            </div>
          </div>
        </div>

        <div className="pv6-footer-bottom">
          <div className="pv6-footer-legal">
            <span>© 2026 Statis</span>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
          <div className="pv6-footer-seal">
            <span className="pv6-seal-mark">
              <StatisMark size={20} accent="#fb923c" bar="#fb923c" />
            </span>
            <span className="pv6-seal-text">Signed · Chained · Receipted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageV6Shell({
  children,
  currentRoute,
}: {
  children: ReactNode;
  currentRoute?: string;
}) {
  return (
    <>
      <TopbarV6 currentRoute={currentRoute} />
      <main style={{ minHeight: "70vh" }}>{children}</main>
      <FooterV6 />
    </>
  );
}

export function PageProseV6({ children }: { children: ReactNode }) {
  return <div className="pv6-prose">{children}</div>;
}

export function PageH2V6({ children }: { children: ReactNode }) {
  return <h2 className="pv6-h2">{children}</h2>;
}
