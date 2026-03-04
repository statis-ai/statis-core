"use client";

import Link from "next/link";
import Image from "next/image";

export function NavbarV2() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                <Link href="/" className="flex items-center gap-2.5">
                    <Image
                        src="/logomark-transparent.png"
                        alt="Statis mark"
                        width={32}
                        height={32}
                        className="shrink-0"
                        priority
                    />
                    <span className="text-xl font-bold tracking-tight text-gray-900 font-serif">
                        Statis
                    </span>
                </Link>

                <div className="flex items-center gap-8">
                    <a href="https://docs.statis.dev" target="_blank" rel="noopener noreferrer" className="hidden text-sm text-gray-500 hover:text-gray-900 sm:inline transition-colors">
                        Docs
                    </a>
                    <Link href="#demo" className="hidden text-sm text-gray-500 hover:text-gray-900 sm:inline transition-colors">
                        Demo
                    </Link>
                    <Link href="#primitives" className="hidden text-sm text-gray-500 hover:text-gray-900 sm:inline transition-colors">
                        Primitives
                    </Link>
                    <Link href="/blog" className="hidden text-sm text-gray-500 hover:text-gray-900 sm:inline transition-colors">
                        Blog
                    </Link>
                    <a href="https://github.com/statis-ai/statis-core" target="_blank" rel="noopener noreferrer" className="hidden text-sm text-gray-500 hover:text-gray-900 sm:inline transition-colors">
                        GitHub
                    </a>
                    <a
                        href="https://www.surveymonkey.com/r/GVKH2KR"
                        target="_blank" rel="noopener noreferrer"
                        className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 shadow-sm"
                    >
                        Request Design Partner Access
                    </a>
                </div>
            </nav>
        </header>
    );
}
