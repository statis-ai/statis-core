export function StatisMark({
  size = 24,
  accent = "#fb923c",
  bar = "#fafafa",
}: {
  size?: number;
  accent?: string;
  bar?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <rect x="20" y="40" width="40" height="180" fill={bar} />
      <rect x="180" y="40" width="40" height="180" fill={bar} />
      <rect x="110" y="40" width="110" height="30" fill={accent} />
      <rect x="110" y="200" width="20" height="20" fill={bar} />
    </svg>
  );
}
