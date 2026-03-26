"use client";

/* Fixed full-page background: grid + three slow-drift gradient orbs.
   Sits at z-index 0; all page content renders above it. */
export function GlobalBackground() {
    return (
        <div
            aria-hidden
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        >
            {/* Orb 1 — cyan, top-left */}
            <div
                className="absolute rounded-full"
                style={{
                    top: "-10%",
                    left: "-5%",
                    width: "55vw",
                    height: "55vw",
                    background: "radial-gradient(ellipse at center, rgba(0,255,200,0.055) 0%, transparent 68%)",
                    animation: "orb1Drift 20s ease-in-out infinite alternate",
                }}
            />

            {/* Orb 2 — violet, center-right */}
            <div
                className="absolute rounded-full"
                style={{
                    top: "30%",
                    right: "-15%",
                    width: "60vw",
                    height: "60vw",
                    background: "radial-gradient(ellipse at center, rgba(99,102,241,0.045) 0%, transparent 68%)",
                    animation: "orb2Drift 26s ease-in-out infinite alternate-reverse",
                }}
            />

            {/* Orb 3 — indigo/cyan, bottom-left */}
            <div
                className="absolute rounded-full"
                style={{
                    bottom: "-10%",
                    left: "10%",
                    width: "50vw",
                    height: "50vw",
                    background: "radial-gradient(ellipse at center, rgba(56,189,248,0.035) 0%, transparent 68%)",
                    animation: "orb3Drift 32s ease-in-out infinite alternate",
                }}
            />
        </div>
    );
}
