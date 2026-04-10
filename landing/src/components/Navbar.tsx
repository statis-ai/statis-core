"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { PlaygroundModal } from "./PlaygroundModal";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: scrolled ? "rgba(25,25,25,0.55)" : "rgba(25,25,25,0.30)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          borderBottom: "1px solid var(--border)",
          transition: "background 0.2s, backdrop-filter 0.2s",
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

            <button
              onClick={() => setPlaygroundOpen(true)}
              className="hidden sm:inline text-xs font-mono transition-colors"
              style={{ color:"#71717a" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#71717a")}
            >
              Playground
            </button>

            <a href="https://console.statis.dev/auth?mode=signin" target="_blank" rel="noopener noreferrer"
               className="link-muted hidden sm:inline text-xs">Log In</a>
            <a
              href="https://console.statis.dev/auth?mode=signup"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-cta-btn text-xs font-mono px-3.5 py-1.5 rounded transition-all"
            >
              Get Access
            </a>
          </div>
        </nav>

        {/* Horizon glow bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, var(--orange-glow) 25%, var(--orange) 50%, var(--orange-glow) 75%, transparent 100%)",
            boxShadow: "0 0 20px 6px var(--orange-glow), 0 2px 48px 0 rgba(200,92,26,0.15)",
            pointerEvents: "none",
          }}
        />
      </header>

      <PlaygroundModal open={playgroundOpen} onClose={() => setPlaygroundOpen(false)} />
    </>
  );
}
