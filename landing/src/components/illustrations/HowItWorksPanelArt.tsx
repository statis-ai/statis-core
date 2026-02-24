"use client";

interface HowItWorksPanelArtProps {
  activeStep?: number;
  className?: string;
}

const stepConfig = [
  { label: "Publish", cx: 80, cy: 90, accent: true },
  { label: "Materialize", cx: 200, cy: 90, accent: true },
  { label: "Push", cx: 320, cy: 90, accent: true },
  { label: "Replay", cx: 200, cy: 90, accent: true },
];

export function HowItWorksPanelArt({ activeStep = 0, className }: HowItWorksPanelArtProps) {
  const step = stepConfig[Math.min(activeStep, 3)];
  return (
    <svg
      viewBox="0 0 400 180"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <filter id="hiw-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Connector line */}
      <line
        x1="40"
        y1="90"
        x2="360"
        y2="90"
        stroke="#00ffc8"
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      {[80, 200, 320].map((x, i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={90}
            r="12"
            fill="none"
            stroke="#00ffc8"
            strokeOpacity={activeStep === i ? 0.5 : 0.15}
            strokeWidth={activeStep === i ? 2 : 1}
          />
          <circle
            cx={x}
            cy={90}
            r="4"
            fill="#00ffc8"
            fillOpacity={activeStep === i ? 0.6 : 0.2}
            filter={activeStep === i ? "url(#hiw-glow)" : undefined}
          />
        </g>
      ))}
      {/* Replay step: center emphasis */}
      {activeStep === 3 && (
        <circle
          cx="200"
          cy="90"
          r="24"
          fill="none"
          stroke="#00ffc8"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        >
          <animate
            attributeName="r"
            values="20;28;20"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
}
