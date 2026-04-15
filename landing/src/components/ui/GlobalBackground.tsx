"use client";

export function GlobalBackground() {
    return (
        <>
            <div
                aria-hidden
                className="fixed inset-0 pointer-events-none grid-bg"
                style={{ zIndex: -2, background: "#000000" }}
            />
            {/* Subtle grain texture overlay */}
            <svg aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: -1, width: "100%", height: "100%", opacity: 0.03 }}>
                <filter id="grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain)" />
            </svg>
        </>
    );
}
