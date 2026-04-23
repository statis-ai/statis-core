import type { Metadata } from "next";
import { Lock, Zap, Eye } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ContextPlayground } from "@/components/ui/ContextPlayground";
import { IsoDebugLens } from "@/components/ui/IsoIllustrations";

export const metadata: Metadata = {
  title: "Context Debugger — Statis",
  description:
    "Inspect your agent's context in your browser. Zero install. Nothing is uploaded. Powered by Statis Context Kit.",
};

const PROMISES = [
  {
    icon: Lock,
    title: "Runs in your browser",
    body: "Every computation happens client-side. Your transcripts never leave your device.",
  },
  {
    icon: Zap,
    title: "Zero install",
    body: "Paste a transcript, see what the compressor would pin, prune, and summarize — and what it would cost.",
  },
  {
    icon: Eye,
    title: "Risk and cost at a glance",
    body: "Token breakdown per turn. Prompt-injection patterns flagged. Cost estimates across GPT-4o, Claude, and Gemini.",
  },
];

export default function DebugPage() {
  return (
    <PageShell
      eyebrow="Context Debugger"
      title="Inspect your agent's context."
      titleAccent="In your browser."
      subtitle="The top-of-funnel tool for Context Kit. Paste a transcript, see what would be pinned, compressed, and pruned. Flag prompt injection. Estimate cost across models. Nothing is uploaded."
      illustration={<IsoDebugLens />}
    >
      <ContextPlayground />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
        {PROMISES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl p-6"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-4"
              style={{
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.22)",
              }}
            >
              <Icon size={16} style={{ color: "#00D4FF" }} />
            </div>
            <h3 className="text-[15px] font-bold text-white tracking-tight mb-2">{title}</h3>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-2)" }}>
              {body}
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
