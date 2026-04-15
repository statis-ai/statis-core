"use client";

import { CanvasShell } from "@/components/three/CanvasShell";
import { PipelineScene } from "@/components/three/scenes/GlobeNetwork";
import { Section, Eyebrow, SectionReveal } from "./shared";

function PipelineFallback() {
  return (
    <div
      className="w-full aspect-[16/9] rounded-xl flex items-center justify-center"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/50" />
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>Agents</span>
          </div>
          <div className="w-16 h-px" style={{ background: "var(--border)" }} />
          <div className="flex flex-col items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ background: "var(--accent)", opacity: 0.8 }} />
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>Policy</span>
          </div>
          <div className="w-16 h-px" style={{ background: "var(--accent)", opacity: 0.3 }} />
          <div className="flex flex-col items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/50" />
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>Targets</span>
          </div>
        </div>
        <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>Action governance pipeline</span>
      </div>
    </div>
  );
}

export function Globe() {
  return (
    <Section>
      <SectionReveal>
        <div className="text-center mb-12">
          <Eyebrow>How It Works</Eyebrow>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-4">
            Every action flows through governance
          </h2>
          <p className="text-[16px] mt-4 max-w-lg mx-auto" style={{ color: "var(--text-2)" }}>
            Agents propose. The policy engine evaluates. Approved actions execute with exactly-once guarantees. Every outcome is receipted.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.15}>
        <div className="relative w-full aspect-[16/9] max-w-4xl mx-auto">
          <CanvasShell fallback={<PipelineFallback />}>
            <PipelineScene />
          </CanvasShell>
        </div>

        {/* Labels below */}
        <div className="flex items-center justify-center gap-12 mt-8">
          {[
            { label: "Propose", color: "var(--text-2)" },
            { label: "Evaluate", color: "var(--accent)" },
            { label: "Execute", color: "var(--text-2)" },
            { label: "Receipt", color: "var(--text-2)" },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[13px] font-medium" style={{ color: step.color }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </SectionReveal>

      {/* Status pill */}
      <div className="flex justify-center mt-6">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-mono"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399" }} />
          governed
        </div>
      </div>
    </Section>
  );
}
