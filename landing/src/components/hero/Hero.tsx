"use client";

import { HeroCopy } from "./HeroCopy";
import { Hero3D } from "./Hero3D";
import { HeroFallback } from "./HeroFallback";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-12 lg:gap-16">
        {/* Left: copy + CTAs */}
        <div className="relative z-10 lg:col-span-7">
          <HeroCopy />
        </div>

        {/* Right: framed WebGL viewport (desktop only) */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
            <Hero3D />
            {/* Inner edge fade mask */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-black/[0.03] to-black/10" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/[0.03]" />
          </div>
        </div>

        {/* Mobile fallback (below copy) */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 lg:hidden">
          <HeroFallback />
        </div>
      </div>
    </section>
  );
}
