import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export function ManifestoSection() {
  return (
    <section className="relative py-40 overflow-hidden">
      {/* Orange ambient glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,92,26,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Subtle horizon lines */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(200,92,26,0.25) 50%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(200,92,26,0.25) 50%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <div className="mb-10">
          <SectionEyebrow align="center" variant="accent">
            The Statis Manifesto
          </SectionEyebrow>
        </div>

        <h2
          className="font-bold leading-[1.02] tracking-[-0.03em]"
          style={{ fontSize: "clamp(2.6rem, 6vw, 4.8rem)" }}
        >
          Agents need
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #c85c1a 0%, #FB923C 50%, #FED7AA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            infrastructure,
          </span>
          <br />
          not guardrails.
        </h2>

        <p
          className="text-base sm:text-lg mt-12 max-w-2xl mx-auto leading-relaxed"
          style={{ color: "var(--text-2)" }}
        >
          Every action flows through a deterministic trust layer. Every outcome is receipted.
          Every decision is reversible, auditable, and reproducible. That&apos;s the product.
        </p>
      </div>
    </section>
  );
}
