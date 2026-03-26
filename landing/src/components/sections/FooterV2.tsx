import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = {
    Product: [
        { label: "Console", href: "https://console.statis.dev", external: true },
        { label: "Docs", href: "https://docs.statis.dev", external: true },
        { label: "Primitives", href: "#primitives", external: false },
    ],
    Developers: [
        { label: "GitHub", href: "https://github.com/statis-ai/statis-sdk", external: true },
        { label: "Python SDK", href: "https://pypi.org/project/statis-ai/", external: true },
        { label: "TypeScript SDK", href: "https://www.npmjs.com/package/statis-ai", external: true },
    ],
    Company: [
        { label: "Blog", href: "/blog", external: false },
        { label: "Design Partners", href: "https://www.surveymonkey.com/r/GVKH2KR", external: true },
    ],
};

export function FooterV2() {
    return (
        <footer className="bg-[#050508] section-divider">
            <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 lg:px-8">

                <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-16">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1 space-y-5">
                        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
                            <Image
                                src="/logomark-transparent.png"
                                alt="Statis"
                                width={28}
                                height={28}
                                className="shrink-0 rounded-md"
                                style={{ filter: "drop-shadow(0 0 6px rgba(0,255,200,0.45))" }}
                            />
                            <span className="text-lg font-semibold tracking-tight text-gradient">
                                Statis
                            </span>
                        </Link>
                        <p className="text-sm leading-6 text-[#6a6a7a] max-w-[200px]">
                            Agent execution infrastructure. Shared state in. Governed action out.
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc8] shadow-[0_0_6px_rgba(0,255,200,0.8)]" />
                            <span className="text-xs text-[#00ffc8] font-mono">api.statis.dev live</span>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                        <div key={group}>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a5a6a] mb-4">
                                {group}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        {link.external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-[#8a8a9a] hover:text-white transition-colors duration-150 cursor-pointer"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-sm text-[#8a8a9a] hover:text-white transition-colors duration-150 cursor-pointer"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 border-t border-white/6 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-xs text-[#3a3a4a]">
                        &copy; 2026 Statis Inc.
                    </p>
                    <div className="flex gap-5">
                        <a href="#" className="text-xs text-[#3a3a4a] hover:text-[#8a8a9a] transition-colors cursor-pointer">Terms</a>
                        <a href="#" className="text-xs text-[#3a3a4a] hover:text-[#8a8a9a] transition-colors cursor-pointer">Privacy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
