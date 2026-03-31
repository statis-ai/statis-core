"use client";

export function GlobalBackground() {
    return (
        <div
            aria-hidden
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0, background: "#0e0c0a" }}
        />
    );
}
