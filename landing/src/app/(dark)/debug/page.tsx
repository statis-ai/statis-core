import type { Metadata } from "next";
import { Lock, Zap, Eye } from "lucide-react";
import { PageV6Shell, HeroV6 } from "@/components/v6/PageV6Shell";
import { ContextPlayground } from "@/components/ui/ContextPlayground";

export const metadata: Metadata = {
  title: "Context Debugger — statis-kit",
  description:
    "Inspect your agent's context in your browser. Zero install. Nothing is uploaded. Powered by statis-kit.",
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
    <PageV6Shell currentRoute="/debug">
      <HeroV6
        eyebrowNum="§ 01"
        eyebrowText="statis-kit · Context Debugger"
        title="Inspect your agent's context."
        titleStrong="In your browser."
        subtitle="The top-of-funnel tool for statis-kit. Paste a transcript, see what would be pinned, compressed, and pruned. Flag prompt injection. Estimate cost across models. Nothing is uploaded."
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px 48px" }}>
        <ContextPlayground />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 12,
            marginTop: 40,
          }}
        >
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="pv6-card"
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius)",
                  marginBottom: 14,
                  background: "var(--accent-bg)",
                  border: "1px solid var(--accent-border)",
                }}
              >
                <Icon size={16} style={{ color: "var(--accent)" }} />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font)",
                  fontSize: 12,
                  lineHeight: 1.65,
                  color: "var(--text-muted)",
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 32,
            padding: "16px 20px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font)",
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            Looking for offline pre-call hygiene in your code?{" "}
            <a
              href="https://pypi.org/project/statis-kit/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              pip install statis-kit →
            </a>
            {" "}or{" "}
            <a
              href="https://www.npmjs.com/package/statis-kit"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              npm install statis-kit →
            </a>
          </p>
        </div>
      </div>
    </PageV6Shell>
  );
}
