"use client";

export function StabilityDiagram() {
  return (
    <svg
      viewBox="0 0 400 200"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <filter id="glow-stability">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ffc8" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#00ffc8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00ffc8" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Grid hints */}
      {[50, 100, 150, 200, 250, 300, 350].map((x) => (
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={200}
          stroke="currentColor"
          strokeOpacity="0.04"
          strokeWidth="0.5"
        />
      ))}
      {[40, 80, 120, 160].map((y) => (
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={400}
          y2={y}
          stroke="currentColor"
          strokeOpacity="0.04"
          strokeWidth="0.5"
        />
      ))}
      {/* Central core */}
      <circle
        cx={200}
        cy={100}
        r={28}
        fill="none"
        stroke="#00ffc8"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        filter="url(#glow-stability)"
      />
      <circle
        cx={200}
        cy={100}
        r={12}
        fill="#00ffc8"
        fillOpacity="0.25"
        filter="url(#glow-stability)"
      />
      {/* Orbiting nodes */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = 200 + Math.cos(angle) * 80;
        const y = 100 + Math.sin(angle) * 80;
        return (
          <g key={i}>
            <line
              x1={200}
              y1={100}
              x2={x}
              y2={y}
              stroke="#00ffc8"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
            <circle
              cx={x}
              cy={y}
              r={6}
              fill="none"
              stroke="#00ffc8"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
          </g>
        );
      })}
    </svg>
  );
}
