"use client";

export function StateDiagram() {
  return (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="glow-state">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[35, 25, 15].map((r, i) => (
        <circle
          key={i}
          cx="100"
          cy="50"
          r={r}
          fill="none"
          stroke="#00ffc8"
          strokeWidth="1"
          strokeOpacity={0.15 + i * 0.08}
        >
          <animate
            attributeName="r"
            values={`${r};${r + 2};${r}`}
            dur={`${3 - i * 0.5}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      <circle
        cx="100"
        cy="50"
        r="8"
        fill="#00ffc8"
        fillOpacity="0.4"
        filter="url(#glow-state)"
      >
        <animate attributeName="r" values="6;9;6" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
