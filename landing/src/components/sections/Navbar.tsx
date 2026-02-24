"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled
          ? "border-b border-white/10 bg-black/50 backdrop-blur-xl"
          : "bg-transparent"
        }`}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/statis-mark.svg"
            alt="Statis logo"
            width={36}
            height={36}
            className="shrink-0 drop-shadow-[0_0_15px_rgba(0,255,200,0.5)]"
            priority
          />
          <span className="hidden text-2xl font-bold tracking-tight text-white md:inline">
            STATIS
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <a
            href="#"
            className="hidden text-sm text-brand-muted transition-colors hover:text-white sm:inline"
          >
            Docs
          </a>
          <a
            href="#"
            className="hidden text-sm text-brand-muted transition-colors hover:text-white sm:inline"
          >
            GitHub
          </a>
          <Button variant="primary" size="default">
            View Demo
          </Button>
        </div>
      </nav>
    </header>
  );
}
