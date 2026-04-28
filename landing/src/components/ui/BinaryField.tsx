"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Glyph = "0" | "1" | "•" | " ";

const VOCAB: { glyph: Glyph; weight: number }[] = [
  { glyph: " ", weight: 30 },
  { glyph: "•", weight: 30 },
  { glyph: "0", weight: 20 },
  { glyph: "1", weight: 20 },
];

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickGlyph(rand: () => number): Glyph {
  const total = VOCAB.reduce((n, v) => n + v.weight, 0);
  const r = rand() * total;
  let acc = 0;
  for (const v of VOCAB) {
    acc += v.weight;
    if (r < acc) return v.glyph;
  }
  return " ";
}

type Props = {
  cols?: number;
  rows?: number;
  seed?: number;
  color?: string;
  baseOpacity?: [number, number];
  litRatio?: number;
  flipRatio?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function BinaryField({
  cols = 80,
  rows = 30,
  seed = 0xa5b3,
  color = "#b8442e",
  baseOpacity = [0.18, 0.42],
  litRatio = 0.03,
  flipRatio = 0.012,
  className,
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  const cells = useMemo(() => {
    const r = mulberry32(seed);
    const list: { glyph: Glyph; baseOpacity: number; phase: number }[] = [];
    const [lo, hi] = baseOpacity;
    for (let i = 0; i < cols * rows; i++) {
      list.push({
        glyph: pickGlyph(r),
        baseOpacity: lo + r() * (hi - lo),
        phase: r() * Math.PI * 2,
      });
    }
    return list;
  }, [cols, rows, seed, baseOpacity]);

  const [tick, setTick] = useState(0);
  const [overrides, setOverrides] = useState<Record<number, Glyph>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const handler = () => setReduced(m.matches);
    m.addEventListener?.("change", handler);
    return () => m.removeEventListener?.("change", handler);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || reduced) return;
    let raf = 0;
    const start = performance.now();
    const loop = (t: number) => {
      const elapsed = (t - start) / 1000;
      setTick(elapsed);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, reduced]);

  useEffect(() => {
    if (!visible || reduced) return;
    const r = mulberry32(seed ^ 0xdeadbeef);
    const interval = setInterval(() => {
      setOverrides((prev) => {
        const next = { ...prev };
        const flips = Math.floor(cells.length * flipRatio);
        for (let i = 0; i < flips; i++) {
          const idx = Math.floor(r() * cells.length);
          const cur = next[idx] ?? cells[idx].glyph;
          if (cur === " ") continue;
          if (cur === "0") next[idx] = "1";
          else if (cur === "1") next[idx] = "•";
          else next[idx] = "0";
        }
        const keys = Object.keys(next);
        if (keys.length > cells.length * 0.15) {
          for (let i = 0; i < flips; i++) {
            delete next[Number(keys[i])];
          }
        }
        return next;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [visible, reduced, cells.length, flipRatio, seed]);

  const litCells = useMemo(() => {
    if (reduced) return new Set<number>();
    const speed = 0.18;
    const set = new Set<number>();
    const target = Math.floor(cells.length * litRatio);
    let i = 0;
    while (set.size < target && i < cells.length * 4) {
      const t = tick * speed;
      const idx = Math.floor(((Math.sin(t + i * 0.31) + 1) / 2) * cells.length);
      set.add(idx);
      i++;
    }
    return set;
  }, [tick, cells.length, litRatio, reduced]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        fontFamily: "var(--mono, ui-monospace, Menlo, monospace)",
        fontSize: "clamp(10px, 1.05vw, 14px)",
        lineHeight: 1,
        letterSpacing: "0.08em",
        color,
        userSelect: "none",
        pointerEvents: "none",
        ...style,
      }}
      aria-hidden="true"
    >
      {cells.map((cell, i) => {
        const lit = litCells.has(i);
        const glyph = overrides[i] ?? cell.glyph;
        const opacity = lit ? 1 : cell.baseOpacity;
        return (
          <span
            key={i}
            style={{
              opacity,
              transition: "opacity 380ms ease-out",
              textAlign: "center",
              fontWeight: lit ? 600 : 400,
            }}
          >
            {glyph}
          </span>
        );
      })}
    </div>
  );
}
