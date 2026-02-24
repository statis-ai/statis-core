import Link from "next/link";
import Image from "next/image";

export function FooterV2() {
    return (
        <footer className="border-t border-white/10 bg-[#050505]">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">

                <div className="xl:grid xl:grid-cols-3 xl:gap-8">

                    <div className="space-y-8 xl:col-span-1">
                        <Link href="/" className="flex items-center gap-3">
                            <Image
                                src="/statis-mark.svg"
                                alt="Statis logo"
                                width={40}
                                height={40}
                                className="shrink-0 drop-shadow-[0_0_15px_rgba(0,255,170,0.6)]"
                            />
                            <span className="text-3xl font-bold tracking-tight text-white">
                                Statis
                            </span>
                        </Link>
                        <p className="text-lg leading-6 text-brand-muted max-w-xs">
                            Multi-agent systems shouldn't run on vibes and vector similarity. Build on deterministic state.
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            {/* Padding column to align right side */}
                            <div></div>
                            <div className="mt-10 md:mt-0">
                                <div className="flex flex-col items-start gap-4">
                                    <a
                                        href="https://www.surveymonkey.com/r/GVKH2KR"
                                        target="_blank" rel="noopener noreferrer"
                                        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-gray-200"
                                    >
                                        Request Design Partner Access
                                    </a>
                                    <p className="text-xs text-brand-muted mt-2">
                                        <span className="text-brand-accent">Current Status:</span> Enrolling Design Partners (VP Engineering / Head of Platform). Hosted & VPC-ish deployment modes coming soon.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 md:flex md:items-center md:justify-between">
                    <div className="flex space-x-6 md:order-2">
                        <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" className="hidden text-sm leading-6 text-brand-muted hover:text-white sm:inline">Docs</a>
                        <a href="#" className="text-sm leading-6 text-brand-muted hover:text-white">Terms</a>
                        <a href="#" className="text-sm leading-6 text-brand-muted hover:text-white">Privacy</a>
                    </div>
                    <p className="mt-8 text-sm leading-5 text-brand-muted md:order-1 md:mt-0">
                        &copy; 2026 Statis Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
