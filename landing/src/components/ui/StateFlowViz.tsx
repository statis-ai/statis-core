"use client";

import { motion, AnimatePresence } from "framer-motion";

function LogViz() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full">
      <line
        x1="40"
        y1="100"
        x2="280"
        y2="100"
        stroke="rgba(0,255,200,0.15)"
        strokeWidth="2"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle
          key={i}
          r="4"
          fill="#00ffc8"
          initial={{ cx: 40, cy: 100, opacity: 0 }}
          animate={{ cx: 280, cy: 100, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3,
            delay: i * 0.6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      {[80, 130, 180, 230].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={100}
          r="6"
          fill="none"
          stroke="rgba(0,255,200,0.3)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

function StateViz() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full">
      {[60, 45, 30].map((r, i) => (
        <motion.circle
          key={i}
          cx="160"
          cy="100"
          r={r}
          fill="none"
          stroke="#00ffc8"
          strokeWidth="1"
          initial={{ opacity: 0.1 + i * 0.1 }}
          animate={{
            opacity: [0.1 + i * 0.1, 0.4 + i * 0.1, 0.1 + i * 0.1],
          }}
          transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
      <motion.circle
        cx="160"
        cy="100"
        r="14"
        fill="#00ffc8"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

function SubscriptionsViz() {
  const nodes = [
    { x: 80, y: 50 },
    { x: 260, y: 50 },
    { x: 60, y: 160 },
    { x: 280, y: 160 },
  ];
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full">
      <circle cx="160" cy="100" r="10" fill="#00ffc8" opacity="0.8" />
      {nodes.map((n, i) => (
        <g key={i}>
          <line
            x1="160"
            y1="100"
            x2={n.x}
            y2={n.y}
            stroke="rgba(0,255,200,0.12)"
            strokeWidth="1"
          />
          <circle
            cx={n.x}
            cy={n.y}
            r="6"
            fill="none"
            stroke="rgba(0,255,200,0.35)"
            strokeWidth="1.5"
          />
          <motion.circle
            r="3"
            fill="#00ffc8"
            initial={{ cx: 160, cy: 100, opacity: 0 }}
            animate={{
              cx: [160, n.x],
              cy: [100, n.y],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </g>
      ))}
    </svg>
  );
}

function ReplayViz() {
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full">
      <line
        x1="40"
        y1="100"
        x2="280"
        y2="100"
        stroke="rgba(0,255,200,0.15)"
        strokeWidth="2"
      />
      {[80, 130, 180, 230].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={100}
          r="5"
          fill="none"
          stroke="rgba(0,255,200,0.3)"
          strokeWidth="1.5"
        />
      ))}
      <motion.rect
        x="280"
        y="85"
        width="6"
        height="30"
        rx="3"
        fill="#00ffc8"
        opacity="0.5"
        animate={{ x: [280, 40], opacity: [0.6, 0.2, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.line
        x1="280"
        y1="100"
        x2="40"
        y2="100"
        stroke="#00ffc8"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: [0, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

const vizComponents = [LogViz, StateViz, SubscriptionsViz, ReplayViz];

export function StateFlowViz({ activeIndex }: { activeIndex: number }) {
  const Viz = vizComponents[activeIndex] ?? LogViz;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.4 }}
        className="h-full w-full"
        aria-hidden="true"
      >
        <Viz />
      </motion.div>
    </AnimatePresence>
  );
}
