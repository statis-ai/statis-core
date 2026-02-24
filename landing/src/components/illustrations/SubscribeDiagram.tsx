"use client";

export function SubscribeDiagram() {
  const nodes = [
    { x: 50, y: 25 },
    { x: 150, y: 25 },
    { x: 40, y: 75 },
    { x: 160, y: 75 },
  ];
  return (
    <svg viewBox="0 0 200 100" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="glow-sub">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="50" r="6" fill="#00ffc8" fillOpacity="0.5" />
      {nodes.map((n, i) => (
        <g key={i}>
          <line
            x1="100"
            y1="50"
            x2={n.x}
            y2={n.y}
            stroke="#00ffc8"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
          <circle
            cx={n.x}
            cy={n.y}
            r="4"
            fill="none"
            stroke="#00ffc8"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          <circle cx={n.x} cy={n.y} r="1.5" fill="#00ffc8" opacity="0.6">
            <animate
              attributeName="opacity"
              values="0.2;0.8;0.2"
              dur={`${2 + i * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </svg>
  );
}
