"use client";

import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/ui/reveal";

export function CTASection() {
  return (
    <section className="py-24 md:py-36" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-5xl px-6">
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-inset) 100%)",
            border: "1px solid var(--border)",
            borderTop: "1px solid rgba(249,115,22,0.30)",
            boxShadow: "0 0 80px rgba(249,115,22,0.05), 0 32px 80px rgba(0,0,0,0.08)",
            position: "relative",
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
              background: "radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left: Receipt card (dogfood) */}
            <Reveal delay={0.1}>
              <div
                className="flex flex-col items-center justify-center px-8 py-14 md:py-16"
                style={{ borderRight: "1px solid var(--border)" }}
              >
                <div
                  className="font-mono text-[9px] px-5 py-3.5 rounded-lg text-left mb-6"
                  style={{
                    background: "#0C0C0F",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderTop: "1px solid rgba(249,115,22,0.25)",
                    color: "#A1A1AA",
                    lineHeight: "1.8",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <div><span style={{ color: "#71717A" }}>receipt_id</span>  <span style={{ color: "#A1A1AA" }}>sha256:a3f29c...</span></div>
                  <div><span style={{ color: "#71717A" }}>action    </span>  <span style={{ color: "#E8813A" }}>deploy_landing_page</span></div>
                  <div><span style={{ color: "#71717A" }}>status    </span>  <span style={{ color: "#34D399" }}>COMPLETED</span></div>
                  <div><span style={{ color: "#71717A" }}>policy    </span>  <span style={{ color: "#D4D4D8" }}>infra_deploy_v1</span></div>
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  We used Statis to build Statis.
                </p>
                <p className="text-xs mt-2 max-w-xs text-center leading-relaxed" style={{ color: "var(--text-2)" }}>
                  Every action on this site ran through our own infrastructure.
                </p>
              </div>
            </Reveal>

            {/* Right: CTA */}
            <Reveal delay={0.2}>
              <div className="flex flex-col items-center justify-center px-8 py-14 md:py-16 text-center">
                <div className="mb-6">
                  <SectionEyebrow align="center" variant="accent">
                    Get started
                  </SectionEyebrow>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4 tracking-tight" style={{ color: "var(--text)" }}>
                  Ship your first governed<br />action in 5 minutes.
                </h2>
                <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: "var(--text-2)" }}>
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

                <p className="mt-8 text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                  pip install statis-ai
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
