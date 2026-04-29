"use client";

/**
 * Global cream/paper background with the halftone dot pattern that
 * matches the home page hero. Kept as a fixed full-bleed layer behind
 * page content so child pages feel continuous with the landing.
 */
export function GlobalBackground() {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -3, background: "var(--bg-body, #f3efe7)" }}
      />

      {/* halftone — top-right (denser, larger dots) */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -2,
          backgroundImage:
            "radial-gradient(circle, rgba(184, 68, 46, 0.22) 1.4px, transparent 1.7px)",
          backgroundSize: "14px 14px",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 55% at 100% 0%, black 0%, transparent 65%)",
          maskImage:
            "radial-gradient(ellipse 60% 55% at 100% 0%, black 0%, transparent 65%)",
        }}
      />

      {/* halftone — bottom-left (sparser, smaller dots) */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -2,
          backgroundImage:
            "radial-gradient(circle, rgba(251, 146, 60, 0.18) 1px, transparent 1.4px)",
          backgroundSize: "8px 8px",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 55% at 0% 100%, black 0%, transparent 70%)",
          maskImage:
            "radial-gradient(ellipse 60% 55% at 0% 100%, black 0%, transparent 70%)",
        }}
      />

      {/* subtle paper grain */}
      <svg
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1, width: "100%", height: "100%", opacity: 0.04, mixBlendMode: "multiply" }}
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix
            values="0 0 0 0 0.10  0 0 0 0 0.06  0 0 0 0 0.02  0 0 0 0.5 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </>
  );
}
