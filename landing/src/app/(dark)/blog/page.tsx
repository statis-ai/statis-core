import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "@/data/posts";

export const metadata: Metadata = {
  title: "Blog — Statis",
  description:
    "Notes on agent governance, decorator-first design, and what we learn running Statis on Statis.",
};

const PALETTES: Array<[string, string]> = [
  ["#d97706", "#84cc16"],
  ["#7c3aed", "#0ea5e9"],
  ["#dc2626", "#f59e0b"],
  ["#0d9488", "#fde68a"],
  ["#6366f1", "#22d3ee"],
  ["#be185d", "#f97316"],
  ["#16a34a", "#facc15"],
  ["#1e3a8a", "#06b6d4"],
];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Six abstract templates — each card picks one based on slug hash. */
function AbstractArt({ slug }: { slug: string }) {
  const hash = hashStr(slug);
  const palette = PALETTES[hash % PALETTES.length];
  const variant = hash % 6;
  const gradId = `bgrad-${slug}`;
  const grainId = `bgrain-${slug}`;
  const fadeId = `bfade-${slug}`;
  const gridId = `bgrid-${slug}`;

  const rand = (seed: number) => {
    const x = Math.sin((hash + seed) * 12.9898) * 43758.5453;
    return Math.abs(x - Math.floor(x));
  };

  const renderVariant = () => {
    switch (variant) {
      case 0: {
        const bars = 9;
        const heights = Array.from({ length: bars }, (_, i) => 0.35 + rand(i) * 0.55);
        return (
          <g>
            {heights.map((h, i) => {
              const w = 320 / (bars + 2);
              const x = w + i * w;
              const barHeight = 150 * h;
              const y = 180 - barHeight - 14;
              return (
                <rect
                  key={i}
                  x={x + 3}
                  y={y}
                  width={w - 6}
                  height={barHeight}
                  fill="rgba(245, 240, 226, 0.85)"
                  opacity={0.7 + (i / bars) * 0.18}
                  rx="1"
                />
              );
            })}
          </g>
        );
      }
      case 1: {
        const points: string[] = [];
        const n = 32;
        for (let i = 0; i <= n; i++) {
          const x = (i / n) * 320;
          const phase = (i / n) * Math.PI * 2.5 + hash * 0.13;
          const y = 100 + Math.sin(phase) * 28 + Math.cos(phase * 0.7 + hash * 0.07) * 14;
          points.push(`${x},${y}`);
        }
        const path = `M0,180 L${points.join(" L")} L320,180 Z`;
        return (
          <g>
            <path d={path} fill="rgba(245, 240, 226, 0.78)" />
            <path d={`M${points.join(" L")}`} fill="none" stroke="rgba(245, 240, 226, 0.95)" strokeWidth="1.4" />
          </g>
        );
      }
      case 2: {
        return (
          <g stroke="rgba(245, 240, 226, 0.7)" fill="none" strokeWidth="1.2">
            {[42, 64, 86, 110, 134, 158].map((r, i) => (
              <ellipse
                key={r}
                cx={64 + (rand(i) - 0.5) * 30}
                cy={120 + (rand(i + 7) - 0.5) * 20}
                rx={r}
                ry={r * 0.78}
                opacity={0.55 + i * 0.05}
              />
            ))}
            <circle cx={64} cy={120} r="6" fill="rgba(245, 240, 226, 0.95)" stroke="none" />
          </g>
        );
      }
      case 3: {
        const dots: React.ReactElement[] = [];
        const cols = 16;
        const rows = 10;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = 16 + c * 19;
            const y = 14 + r * 16;
            const a = rand(r * cols + c);
            if (a <= 0.35) continue;
            dots.push(
              <circle
                key={`${r}-${c}`}
                cx={x}
                cy={y}
                r={1.4 + a * 1.6}
                fill="rgba(245, 240, 226, 0.85)"
                opacity={a}
              />,
            );
          }
        }
        return <g>{dots}</g>;
      }
      case 4: {
        return (
          <g>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect
                key={i}
                x={-40 + i * 50}
                y={-20}
                width={26}
                height={240}
                transform={`rotate(${-22 + (rand(i) - 0.5) * 8} ${-40 + i * 50 + 13} 90)`}
                fill="rgba(245, 240, 226, 0.78)"
                opacity={0.55 + rand(i + 11) * 0.4}
              />
            ))}
          </g>
        );
      }
      case 5:
      default: {
        const spokes = 14;
        const lines: React.ReactElement[] = [];
        for (let i = 0; i < spokes; i++) {
          const angle = (i / spokes) * Math.PI * 2 + hash * 0.05;
          const r1 = 10 + rand(i) * 18;
          const r2 = 70 + rand(i + 9) * 60;
          const cx = 160;
          const cy = 100;
          lines.push(
            <line
              key={i}
              x1={cx + Math.cos(angle) * r1}
              y1={cy + Math.sin(angle) * r1}
              x2={cx + Math.cos(angle) * r2}
              y2={cy + Math.sin(angle) * r2}
              stroke="rgba(245, 240, 226, 0.85)"
              strokeWidth={1.2 + rand(i + 3) * 1.4}
              strokeLinecap="round"
              opacity={0.7 + rand(i + 5) * 0.25}
            />,
          );
        }
        return (
          <g>
            <circle cx="160" cy="100" r="14" fill="rgba(245, 240, 226, 0.85)" />
            {lines}
          </g>
        );
      }
    }
  };

  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette[0]} />
          <stop offset="100%" stopColor={palette[1]} />
        </linearGradient>
        <pattern id={gridId} x="0" y="0" width="32" height="22" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
        </pattern>
        <filter id={grainId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0.18 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
        </linearGradient>
      </defs>

      <rect width="320" height="180" fill={`url(#${gradId})`} />
      <rect width="320" height="180" fill={`url(#${gridId})`} opacity="0.5" />
      {renderVariant()}
      <rect width="320" height="180" filter={`url(#${grainId})`} opacity="0.85" />
      <rect width="320" height="60" y="120" fill={`url(#${fadeId})`} />
    </svg>
  );
}

export default function BlogPage() {
  return (
    <div className="blog-index">
      <header className="blog-index-header">
        <div className="blog-index-eyebrow">
          <span className="blog-index-rule" />
          <span className="blog-index-num">§ 09</span>
          <span>From the lab</span>
        </div>
        <h1 className="blog-index-title">
          Writing.<span> Notes from the runtime.</span>
        </h1>
        <p className="blog-index-sub">
          Notes on agent governance, decorator-first design, and what we learn
          running Statis on Statis.
        </p>
      </header>

      <div className="blog-index-grid">
        {posts.map((post) => {
          const isExternal = !!post.external;
          const href = isExternal ? post.external! : `/blog/${post.slug}`;

          const inner = (
            <article className="blog-card">
              <div className="blog-card-art">
                <AbstractArt slug={post.slug} />
                <span className="blog-card-tag">{post.tag}</span>
              </div>

              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-desc">{post.description}</p>
                <div className="blog-card-cta">
                  <span>{isExternal ? "Read on Medium →" : "Read article →"}</span>
                </div>
              </div>
            </article>
          );

          if (isExternal) {
            return (
              <a
                key={post.slug}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-card-link"
              >
                {inner}
              </a>
            );
          }

          return (
            <Link key={post.slug} href={href} className="blog-card-link">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
