"use client";

export function ReplayDiagram() {
  return (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="glow-replay">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line
        x1="20"
        y1="50"
        x2="180"
        y2="50"
        stroke="#00ffc8"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      {[50, 90, 130].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={50}
          r="4"
          fill="none"
          stroke="#00ffc8"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
      ))}
      {/* Rewind sweep */}
      <rect
        x="165"
        y="38"
        width="6"
        height="24"
        rx="3"
        fill="#00ffc8"
        fillOpacity="0.4"
        filter="url(#glow-replay)"
      >
        <animate
          attributeName="x"
          values="165;25;165"
          dur="4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.6;0.2;0.6"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  );
}
