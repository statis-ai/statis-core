"use client";

interface UseCasePanelArtProps {
  activeIndex?: number;
  className?: string;
}

export function UseCasePanelArt({ activeIndex = 0, className }: UseCasePanelArtProps) {
  const nodes = [
    { x: 80, y: 60 },
    { x: 200, y: 40 },
    { x: 320, y: 60 },
    { x: 200, y: 120 },
    { x: 120, y: 100 },
    { x: 280, y: 100 },
  ];
  return (
    <svg
      viewBox="0 0 400 180"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <filter id="uc-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Flowing line through active node */}
      <path
        d="M 40 90 Q 100 90 200 90 Q 300 90 360 90"
        fill="none"
        stroke="#00ffc8"
        strokeOpacity="0.08"
        strokeWidth="2"
      />
      <path
        d="M 40 90 Q 100 90 200 90 Q 300 90 360 90"
        fill="none"
        stroke="#00ffc8"
        strokeOpacity={0.15 + activeIndex * 0.05}
        strokeWidth="1.5"
        strokeDasharray="8 4"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="24"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      {nodes.map((n, i) => {
        const isActive = i === activeIndex % nodes.length;
        return (
          <g key={i}>
            <circle
              cx={n.x}
              cy={n.y}
              r={isActive ? 14 : 8}
              fill="none"
              stroke="#00ffc8"
              strokeOpacity={isActive ? 0.5 : 0.2}
              strokeWidth={isActive ? 2 : 1}
              filter={isActive ? "url(#uc-glow)" : undefined}
            />
            <circle
              cx={n.x}
              cy={n.y}
              r={isActive ? 4 : 2}
              fill="#00ffc8"
              fillOpacity={isActive ? 0.6 : 0.3}
            />
          </g>
        );
      })}
    </svg>
  );
}
