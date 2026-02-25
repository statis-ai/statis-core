"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export function NavbarV2() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/statis-mark.svg"
                        alt="Statis logo"
                        width={36}
                        height={36}
                        className="shrink-0 drop-shadow-[0_0_15px_rgba(0,255,170,0.5)]"
                        priority
                    />
                    <span className="hidden text-2xl font-bold tracking-tight text-white md:inline">
                        Statis
                    </span>
                </Link>

                <div className="flex items-center gap-8">
                    <a href="https://docs.statis.dev" target="_blank" rel="noopener noreferrer" className="hidden text-sm text-brand-muted hover:text-white sm:inline transition-colors">
                        Docs
                    </a>
                    <Link href="/#architecture" className="hidden text-sm text-brand-muted hover:text-white sm:inline transition-colors">
                        Architecture
                    </Link>
                    <Link href="/blog" className="hidden text-sm text-brand-muted hover:text-white sm:inline transition-colors">
                        Blog
                    </Link>
                    <a href="https://github.com/statis-ai/statis-core" target="_blank" rel="noopener noreferrer" className="hidden text-sm text-brand-muted hover:text-white sm:inline transition-colors">
                        GitHub
                    </a>
                    <a
                        href="https://www.surveymonkey.com/r/GVKH2KR"
                        target="_blank" rel="noopener noreferrer"
                        className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
                    >
                        Request Design Partner Access
                    </a>
                </div>
            </nav>
        </header>
    );
}
