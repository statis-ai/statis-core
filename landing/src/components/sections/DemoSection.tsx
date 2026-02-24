"use client";

import { Reveal } from "@/components/ui/reveal";

export function DemoSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">See it in action</h2>
            <p className="mt-4 text-brand-muted">
              A CSM coordination scenario: outage cascade prevention in real time.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="glass-card overflow-hidden rounded-xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-brand-border px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="ml-4 h-6 flex-1 rounded-md bg-white/5 px-3 text-xs leading-6 text-brand-muted">
                app.statis.dev/console
              </div>
            </div>

            {/* Placeholder content */}
            <div className="flex min-h-[340px] items-center justify-center p-12">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10">
                  <svg
                    className="h-6 w-6 text-brand-accent"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      d="M5 3l14 9-14 9V3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm text-brand-muted">
                  Interactive demo coming soon
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
