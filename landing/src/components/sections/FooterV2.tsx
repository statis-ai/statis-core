import Link from "next/link";
import Image from "next/image";

export function FooterV2() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

                <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-4 max-w-sm">
                        <Link href="/" className="flex items-center gap-2.5">
                            <Image
                                src="/new-statis-logo.png"
                                alt="Statis"
                                width={32}
                                height={32}
                                className="shrink-0"
                            />
                            <span className="text-xl font-bold tracking-tight text-gray-900 font-serif">
                                Statis
                            </span>
                        </Link>
                        <p className="text-base leading-6 text-gray-500">
                            Multi-agent systems shouldn&rsquo;t run on vibes.<br />Build on shared reality.
                        </p>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 md:order-2">
                        <a href="https://docs.statis.dev" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Docs</a>
                        <a href="/blog" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Blog</a>
                        <a href="https://github.com/statis-ai/statis-core" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">GitHub</a>
                        <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms</a>
                        <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy</a>
                    </div>
                    <p className="mt-6 text-sm text-gray-400 md:order-1 md:mt-0">
                        &copy; 2026 Statis Inc.
                    </p>
                </div>
            </div>
        </footer>
    );
}
