"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        background: scrolled ? "rgba(17,17,17,0.95)" : "#111111",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.2s",
      }}
    >
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-6">
          <a href="https://docs.statis.dev" target="_blank" rel="noopener noreferrer"
             className="link hidden sm:inline text-xs">Docs</a>
          <a href="https://github.com/statis-ai/statis-sdk" target="_blank" rel="noopener noreferrer"
             className="link hidden sm:inline text-xs">GitHub</a>
          <a href="https://console.statis.dev" target="_blank" rel="noopener noreferrer"
             className="link-muted hidden sm:inline text-xs">Console</a>
          <a
            href="https://pypi.org/project/statis-ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="link text-xs px-3 py-1.5 rounded"
            style={{ border: "1px solid #2a2a2a" }}
          >
            Get Access
          </a>
        </div>
      </nav>
    </header>
  );
}
