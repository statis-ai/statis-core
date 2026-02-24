"use client";

import { Reveal } from "@/components/ui/reveal";

export function ProblemStrip() {
  return (
    <section className="border-y border-brand-border bg-brand-surface py-16">
      <Reveal>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xl font-medium leading-relaxed text-brand-muted md:text-2xl">
            AI agents and automations generate{" "}
            <span className="text-white">mountains of state changes</span> with{" "}
            <span className="text-white">no single source of truth</span>. Teams
            debug with logs, hope webhooks fire, and pray state is consistent.
          </p>
          <p className="mt-4 text-lg text-brand-accent">
            There has to be a better base layer.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
