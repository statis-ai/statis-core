"use client";

import { motion } from "framer-motion";
import { AICard } from "@/components/ui/AICard";
import { FallbackImage } from "@/components/ui/FallbackImage";
import {
  LogDiagram,
  StateDiagram,
  ReplayDiagram,
} from "@/components/illustrations";

// ── SVG fallback: simple dots → block pipeline ────────────────────────────
function PipelineFallback() {
  return (
    <svg viewBox="0 0 440 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="ph-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Grid */}
      {[80, 160, 240, 320, 400].map((x) => (
        <line key={x} x1={x} y1={0} x2={x} y2={180} stroke="currentColor" strokeOpacity="0.04" strokeWidth="0.5" />
      ))}
      {[45, 90, 135].map((y) => (
        <line key={y} x1={0} y1={y} x2={440} y2={y} stroke="currentColor" strokeOpacity="0.04" strokeWidth="0.5" />
      ))}
      {/* Events → dots */}
      {[40, 70, 100, 130].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={90} r="5" fill="none" stroke="#00ffc8" strokeOpacity="0.4" strokeWidth="1.5" />
          <circle cx={x} cy={90} r="2" fill="#00ffc8" fillOpacity="0.6" filter="url(#ph-glow)" />
        </g>
      ))}
      {/* Arrow */}
      <line x1="155" y1="90" x2="210" y2="90" stroke="#00ffc8" strokeOpacity="0.25" strokeWidth="1.5" />
      <polygon points="210,87 216,90 210,93" fill="#00ffc8" fillOpacity="0.4" />
      {/* State block */}
      <rect x="222" y="72" width="90" height="36" rx="6" fill="none" stroke="#00ffc8" strokeOpacity="0.35" strokeWidth="1.5" filter="url(#ph-glow)" />
      <text x="267" y="94" textAnchor="middle" fill="#00ffc8" fillOpacity="0.6" fontSize="10" fontFamily="monospace">state</text>
      {/* Arrow */}
      <line x1="312" y1="90" x2="368" y2="90" stroke="#00ffc8" strokeOpacity="0.25" strokeWidth="1.5" />
      <polygon points="368,87 374,90 368,93" fill="#00ffc8" fillOpacity="0.4" />
      {/* Subscribers */}
      {[[-6, -24], [0, 0], [-6, 24]].map(([dy1, dy2], i) => (
        <g key={i}>
          <line x1="380" y1="90" x2="400" y2={90 + (dy2 as number)} stroke="#00ffc8" strokeOpacity="0.15" strokeWidth="1" />
          <circle cx="404" cy={90 + (dy2 as number)} r="4" fill="none" stroke="#00ffc8" strokeOpacity="0.3" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  );
}

const features = [
  {
    title: "Append-only log",
    description: "One ordered source of truth for semantic events.",
    imgSrc: "/illustrations/feature_append_only.png",
    Diagram: LogDiagram,
  },
  {
    title: "Deterministic state",
    description: "Materialize the same events into the same state.",
    imgSrc: "/illustrations/feature_deterministic.png",
    Diagram: StateDiagram,
  },
  {
    title: "Replayable by design",
    description: "Ask what was known at revision N with provenance.",
    imgSrc: "/illustrations/feature_replayable.png",
    Diagram: ReplayDiagram,
  },
];

export function PostHeroStatement() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            AI isn&apos;t reliable until{" "}
            <span className="text-gradient">state is stable.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">
            Memory isn&apos;t Record. RAG isn&apos;t State.
          </p>
        </motion.div>

        {/* Big pipeline visual */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <AICard
            className="flex h-[280px] min-h-[280px] items-center justify-center overflow-hidden p-8 sm:h-[320px]"
            interactive={false}
          >
            <FallbackImage
              src="/illustrations/event_to_state.png"
              alt="Event to state pipeline"
              width={800}
              height={280}
              className="h-full w-full object-contain"
              fallback={<PipelineFallback />}
            />
          </AICard>
        </motion.div>

        {/* 3 feature items */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {features.map((f, i) => {
            const Diagram = f.Diagram;
            return (
              <motion.div
                key={f.title}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="relative flex h-20 w-full max-w-[200px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <FallbackImage
                    src={f.imgSrc}
                    alt={f.title}
                    width={160}
                    height={64}
                    className="h-full w-full object-contain"
                    fallback={<Diagram />}
                  />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-brand-muted">
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
