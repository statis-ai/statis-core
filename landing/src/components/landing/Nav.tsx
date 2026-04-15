"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatisGlyph } from "./StatisLogo";

const NAV_LINKS = [
  { label: "Docs", href: "https://docs.statis.dev", external: true },
  { label: "GitHub", href: "https://github.com/statis-ai/statis-sdk", external: true },
  { label: "Playground", href: "https://console.statis.dev", external: true },
  { label: "Method", href: "#method", external: false },
  { label: "FAQ", href: "#faq", external: false },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(0,0,0,0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-[24px] font-bold tracking-tight text-white"
        >
          <StatisGlyph size={40} />
          <span>statis</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] transition-colors"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] transition-colors"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://console.statis.dev"
            className="text-[13px] transition-colors"
            style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
          >
            Log in
          </a>
          <a
            href="https://www.surveymonkey.com/r/GVKH2KR"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-medium px-4 py-1.5 rounded-full transition-all"
            style={{
              background: "var(--text)",
              color: "var(--bg)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--text)";
            }}
          >
            Get Access
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-[1.5px] bg-white transition-transform" style={{ transform: menuOpen ? "rotate(45deg) translate(2px, 5px)" : "none" }} />
          <span className="block w-5 h-[1.5px] bg-white transition-opacity" style={{ opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-5 h-[1.5px] bg-white transition-transform" style={{ transform: menuOpen ? "rotate(-45deg) translate(2px, -5px)" : "none" }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-6 pt-2"
          style={{ background: "rgba(0,0,0,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="block py-3 text-[14px]"
              style={{ color: "var(--text-2)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-4 mt-4">
            <a href="https://console.statis.dev" className="text-[14px]" style={{ color: "var(--text-2)" }}>
              Log in
            </a>
            <a
              href="https://www.surveymonkey.com/r/GVKH2KR"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] font-medium px-4 py-1.5 rounded-full"
              style={{ background: "var(--text)", color: "var(--bg)" }}
            >
              Get Access
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
