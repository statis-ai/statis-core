// Lightweight SVG histogram for stat cards and page headers.
// Accepts an array of numeric buckets and renders vertical bars scaled
// to the tallest bucket. Uses brand orange with a soft tail gradient.

export function MiniHistogram({
  data,
  width = 120,
  height = 34,
  color = "#FB923C",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          borderRadius: 6,
          background: "color-mix(in srgb, var(--text) 3%, transparent)",
        }}
      />
    );
  }

  const max = Math.max(...data, 1);
  const barGap = 2;
  const barWidth = Math.max((width - barGap * (data.length - 1)) / data.length, 1);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="histBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const h = Math.max((v / max) * height, v > 0 ? 2 : 1);
        const x = i * (barWidth + barGap);
        const y = height - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={h}
            rx={1}
            fill={v > 0 ? "url(#histBar)" : "color-mix(in srgb, var(--text) 6%, transparent)"}
          />
        );
      })}
    </svg>
  );
}
