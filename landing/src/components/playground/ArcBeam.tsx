"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, useMemo, useEffect, useState } from "react";

export type Point = { x: number; y: number };

type ArcBeamProps = {
  from: Point;
  to: Point;
  /** Arc bend magnitude in px. Positive = bulge "up" in SVG space (negative y). */
  bend?: number;
  duration?: number;
  delay?: number;
  /** Whether the beam should actually draw. Parent controls this from the timeline. */
  active: boolean;
  onComplete?: () => void;
};

/** Build a quadratic bezier path from `from` to `to`, bent perpendicular to the segment. */
function buildPath(from: Point, to: Point, bend: number) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  // Perpendicular unit vector (rotated -90deg from direction vector).
  const px = -dy / len;
  const py = dx / len;
  const cx = mx + px * bend;
  const cy = my + py * bend;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

export function ArcBeam({
  from,
  to,
  bend = 40,
  duration = 0.9,
  delay = 0,
  active,
  onComplete,
}: ArcBeamProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, "");
  const gradId = `arc-grad-${uid}`;
  const filterId = `arc-blur-${uid}`;
  const pathId = `arc-path-${uid}`;
  const reduced = useReducedMotion();

  const d = useMemo(() => buildPath(from, to, bend), [from, to, bend]);

  // Track completion for the crackle burst.
  const [crackle, setCrackle] = useState(0);
  // Reset crackle state when the beam becomes inactive (replay).
  useEffect(() => {
    if (!active) setCrackle(0);
  }, [active]);

  const coreDuration = reduced ? 0.01 : duration;
  const beamDuration = coreDuration;

  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1={from.x} y1={from.y} x2={to.x} y2={to.y} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7a1f00" />
          <stop offset="35%" stopColor="#c85c1a" />
          <stop offset="70%" stopColor="#ff8a3d" />
          <stop offset="100%" stopColor="#fff6e6" />
        </linearGradient>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <path id={pathId} d={d} fill="none" />
      </defs>

      {/* Outer halo (blurred, wide) */}
      <motion.path
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={14}
        strokeLinecap="round"
        filter={`url(#${filterId})`}
        opacity={0.35}
        style={{ pathLength: 0 }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 0.35 } : { pathLength: 0, opacity: 0 }}
        transition={{ pathLength: { delay, duration: beamDuration, ease: [0.25, 0.1, 0.25, 1] }, opacity: { delay, duration: 0.2 } }}
      />

      {/* Mid beam */}
      <motion.path
        d={d}
        fill="none"
        stroke="#c85c1a"
        strokeWidth={3.5}
        strokeLinecap="round"
        style={{ pathLength: 0 }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ pathLength: { delay, duration: beamDuration, ease: [0.25, 0.1, 0.25, 1] }, opacity: { delay, duration: 0.15 } }}
      />

      {/* White-hot core */}
      <motion.path
        d={d}
        fill="none"
        stroke="#fff6e6"
        strokeWidth={1.3}
        strokeLinecap="round"
        style={{ pathLength: 0 }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ pathLength: { delay, duration: coreDuration, ease: [0.25, 0.1, 0.25, 1] }, opacity: { delay, duration: 0.1 } }}
        onAnimationComplete={() => {
          if (active) {
            setCrackle((n) => n + 1);
            onComplete?.();
          }
        }}
      />

      {/* Riding particle — SMIL motionPath keeps it glued to the beam head. */}
      {active && !reduced && (
        <motion.circle
          r={3.2}
          fill="#fff6e6"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay, duration: coreDuration, times: [0, 0.1, 0.9, 1] }}
        >
          <animateMotion
            dur={`${coreDuration}s`}
            begin={`${delay}s`}
            fill="freeze"
            rotate="auto"
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </motion.circle>
      )}

      {/* Crackle burst at impact — 6 short radial sparks. */}
      {crackle > 0 && active && !reduced && (
        <g transform={`translate(${to.x}, ${to.y})`}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 6;
            const x2 = Math.cos(angle) * 18;
            const y2 = Math.sin(angle) * 18;
            return (
              <motion.line
                key={`${crackle}-${i}`}
                x1={0}
                y1={0}
                x2={x2}
                y2={y2}
                stroke="#ff8a3d"
                strokeWidth={1.4}
                strokeLinecap="round"
                initial={{ opacity: 0.9, scale: 0.2 }}
                animate={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            );
          })}
        </g>
      )}
    </g>
  );
}
