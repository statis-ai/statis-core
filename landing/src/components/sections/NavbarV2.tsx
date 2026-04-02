"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function NavbarV2() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${
        scrolled ? "border-b border-white/[0.06] backdrop-blur-md" : ""
      }`}
      style={{ background: scrolled ? "rgba(9,9,9,0.92)" : "transparent" }}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <Image
            src="/logomark-transparent.png"
            alt="Statis"
            width={26}
            height={26}
            className="shrink-0 rounded"
            priority
          />
          <span className="text-sm font-mono font-semibold text-white tracking-tight">
            Statis
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {[
            { label: "Docs",       href: "https://docs.statis.dev",                     external: true },
            { label: "Primitives", href: "#primitives",                                  external: false },
            { label: "Adapters",   href: "#ecosystem",                                   external: false },
            { label: "GitHub",     href: "https://github.com/statis-ai/statis-sdk",      external: true },
          ].map(link =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-xs font-mono text-[#71717a] hover:text-white transition-colors sm:inline"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="hidden text-xs font-mono text-[#71717a] hover:text-white transition-colors sm:inline"
              >
                {link.label}
              </Link>
            )
          )}

          <a
            href="https://console.statis.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-xs font-mono text-[#52525b] hover:text-white transition-colors sm:inline"
          >
            Sign in
          </a>

          <a
            href="https://www.surveymonkey.com/r/GVKH2KR"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded text-xs font-mono font-medium text-black px-3.5 py-1.5 transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Get Access
          </a>
        </div>
      </nav>
    </header>
  );
}
