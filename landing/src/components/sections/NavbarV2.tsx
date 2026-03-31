"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function NavbarV2() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <header className={`fixed inset-x-0 top-0 z-50 border-b border-white/6 backdrop-blur-xl transition-colors duration-300 ${scrolled ? "bg-[#050508]/95" : "bg-[#080810]/80"}`}>
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
                    <Image
                        src="/logomark-transparent.png"
                        alt="Statis mark"
                        width={28}
                        height={28}
                        className="shrink-0 rounded-md"
                        style={{ filter: "drop-shadow(0 0 6px rgba(0,255,200,0.45))" }}
                        priority
                    />
                    <span className="text-lg font-semibold tracking-tight text-gradient">
                        Statis
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    <a href="https://docs.statis.dev" target="_blank" rel="noopener noreferrer" className="hidden text-sm text-[#8a8a9a] hover:text-white sm:inline transition-colors duration-150 cursor-pointer">
                        Docs
                    </a>
                    <Link href="#primitives" className="hidden text-sm text-[#8a8a9a] hover:text-white sm:inline transition-colors duration-150 cursor-pointer">
                        Primitives
                    </Link>
                    <a href="#ecosystem" className="hidden text-sm text-[#8a8a9a] hover:text-white sm:inline transition-colors duration-150 cursor-pointer">
                        Adapters
                    </a>
                    <Link href="/blog" className="hidden text-sm text-[#8a8a9a] hover:text-white sm:inline transition-colors duration-150 cursor-pointer">
                        Blog
                    </Link>
                    <a href="https://github.com/statis-ai/statis-sdk" target="_blank" rel="noopener noreferrer" className="hidden text-sm text-[#8a8a9a] hover:text-white sm:inline transition-colors duration-150 cursor-pointer">
                        GitHub
                    </a>
                    <a
                        href="https://console.statis.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden text-sm text-[#6a6a7a] hover:text-white sm:inline transition-colors duration-150 cursor-pointer"
                    >
                        Sign in
                    </a>
                    <a
                        href="https://www.surveymonkey.com/r/GVKH2KR"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-[#00ffc8]/30 bg-[#00ffc8]/10 px-4 py-2 text-sm font-medium text-[#00ffc8] transition-all hover:bg-[#00ffc8]/18 hover:border-[#00ffc8]/50 cursor-pointer"
                    >
                        Get Access
                    </a>
                </div>
            </nav>
        </header>
    );
}
