import Link from "next/link";
import Image from "next/image";

export function FooterV2() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">

                <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">

                    <div className="space-y-6 max-w-sm">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/new-statis-logo.png"
                                alt="Statis logo"
                                width={48}
                                height={48}
                                className="shrink-0 rounded-xl"
                            />
                            <span className="text-3xl font-bold tracking-tight text-gray-900 font-serif">
                                Statis
                            </span>
                        </Link>
                        <p className="text-lg leading-6 text-gray-500">
                            Multi-agent systems shouldn&rsquo;t run on vibes and vector similarity. Build on deterministic state.
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-4 md:items-end md:text-right">
                        <a
                            href="https://www.surveymonkey.com/r/GVKH2KR"
                            target="_blank" rel="noopener noreferrer"
                            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 shadow-sm"
                        >
                            Request Design Partner Access
                        </a>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm">
                            <span className="text-indigo-600 font-semibold">Current Status:</span> Enrolling Design Partners (VP Engineering / Head of Platform). Hosted &amp; VPC-ish deployment modes coming soon.
                        </p>
                    </div>
                </div>

                <div className="mt-16 border-t border-gray-200 pt-8 sm:mt-20 md:flex md:items-center md:justify-between">
                    <div className="flex space-x-6 md:order-2">
                        <a href="https://statis.mintlify.app" target="_blank" rel="noopener noreferrer" className="hidden text-sm leading-6 text-gray-500 hover:text-gray-900 sm:inline">Docs</a>
                        <a href="/blog" className="text-sm leading-6 text-gray-500 hover:text-gray-900">Blog</a>
                        <a href="#" className="text-sm leading-6 text-gray-500 hover:text-gray-900">Terms</a>
                        <a href="#" className="text-sm leading-6 text-gray-500 hover:text-gray-900">Privacy</a>
                    </div>
                    <p className="mt-8 text-sm leading-5 text-gray-500 md:order-1 md:mt-0">
                        &copy; 2026 Statis Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
