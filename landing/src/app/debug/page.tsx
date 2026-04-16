import type { Metadata } from "next";
import { Lock, Zap, Eye } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { IsoDebugLens } from "@/components/ui/IsoIllustrations";

export const metadata: Metadata = {
  title: "Context Debugger — Statis",
  description:
    "Inspect your agent's context in your browser. Zero install. Nothing is uploaded. Coming with Statis Context Kit.",
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
      <div
        className="rounded-2xl p-10 md:p-14 text-center"
        style={{
          background: "rgba(0,212,255,0.03)",
          border: "1px solid rgba(0,212,255,0.15)",
          boxShadow: "0 0 80px -30px rgba(0,212,255,0.2)",
        }}
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.22em] font-semibold mb-6"
          style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.28)",
            color: "#00D4FF",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00D4FF", boxShadow: "0 0 8px #00D4FF" }} />
          Coming with Context Kit
        </div>
        <h2
          className="font-bold tracking-tight text-white mb-4"
          style={{ fontSize: "clamp(1.4rem, 2.6vw, 2rem)" }}
        >
          Get notified when it&apos;s live.
        </h2>
        <p
          className="text-[14px] leading-relaxed max-w-lg mx-auto mb-8"
          style={{ color: "var(--text-2)" }}
        >
          The debugger ships with the first public release of Statis Context Kit. Drop your
          email and we&apos;ll let you know the moment it&apos;s ready.
        </p>
        <div className="max-w-md mx-auto">
          <NewsletterForm />
        </div>
      </div>

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
