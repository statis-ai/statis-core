import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export function CTASection() {
  return (
    <section className="py-24" style={{ borderTop: "1px solid #141414" }}>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div
          className="rounded-xl px-8 py-16"
          style={{
            background: "linear-gradient(135deg, #0e0e0e 0%, #111 100%)",
            border: "1px solid #1e1e1e",
            borderTop: "1px solid rgba(200,92,26,0.3)",
            boxShadow: "0 0 80px rgba(200,92,26,0.05), 0 32px 80px rgba(0,0,0,0.4)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "400px",
              height: "200px",
              background: "radial-gradient(ellipse, rgba(200,92,26,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div className="mb-6">
            <SectionEyebrow align="center">Get started</SectionEyebrow>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 tracking-tight" style={{ color: "var(--text)" }}>
            Ship your first governed<br />action in 5 minutes.
          </h2>
          <p className="text-sm leading-relaxed mb-8 max-w-md mx-auto" style={{ color: "var(--text-2)" }}>
            Free to start. No credit card required. Scales to millions of actions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://console.statis.dev/auth?mode=signup"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-cta-btn rounded text-sm font-mono px-6 py-3 transition-all"
            >
              Start for free
            </a>
            <a
              href="https://docs.statis.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-docs-link text-sm font-mono transition-colors"
            >
              Read the docs →
            </a>
          </div>

          <p className="mt-8 text-[10px] font-mono" style={{ color: "#2e2e2e" }}>
            pip install statis-ai
          </p>
        </div>
      </div>
    </section>
  );
}
