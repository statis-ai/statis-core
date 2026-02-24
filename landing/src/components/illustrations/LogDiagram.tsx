"use client";

export function LogDiagram() {
  return (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="glow-log">
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
      {[40, 70, 100, 130, 160].map((x, i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={50}
            r="5"
            fill="none"
            stroke="#00ffc8"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          <circle
            cx={x}
            cy={50}
            r="2"
            fill="#00ffc8"
            opacity="0.6"
            filter="url(#glow-log)"
          >
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur={`${1.5 + i * 0.2}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </svg>
  );
}
