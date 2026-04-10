import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

// Minimal syntax token types for the code block
type Token = { text: string; color: string };

function line(tokens: Token[]) {
  return tokens;
}

const C = {
  comment:   "#3a3a3a",
  keyword:   "#888",
  string:    "#7a5a3a",
  orange:    "#c85c1a",
  fn:        "#aaa",
  dim:       "#555",
  plain:     "#ccc",
  key:       "#888",
};

const CODE_LINES: Token[][] = [
  line([{ text: "from", color: C.keyword }, { text: " statis_ai ", color: C.plain }, { text: "import", color: C.keyword }, { text: " StatisClient", color: C.fn }]),
  line([]),
  line([{ text: "client", color: C.plain }, { text: " = ", color: C.dim }, { text: "StatisClient", color: C.fn }, { text: "(api_key=", color: C.plain }, { text: '"sk-statis-..."', color: C.string }, { text: ")", color: C.plain }]),
  line([]),
  line([{ text: "# Propose an action — nothing executes yet", color: C.comment }]),
  line([{ text: "action", color: C.plain }, { text: " = await ", color: C.dim }, { text: "client", color: C.plain }, { text: ".", color: C.dim }, { text: "propose", color: C.orange }, { text: "(", color: C.dim }]),
  line([{ text: "    entity_id", color: C.key }, { text: "=", color: C.dim }, { text: '"acct-8821"', color: C.string }, { text: ",", color: C.dim }]),
  line([{ text: "    action_type", color: C.key }, { text: "=", color: C.dim }, { text: '"apply_discount"', color: C.string }, { text: ",", color: C.dim }]),
  line([{ text: "    payload", color: C.key }, { text: "={", color: C.dim }, { text: '"percent"', color: C.string }, { text: ": ", color: C.dim }, { text: "15", color: C.orange }, { text: ', "reason": ', color: C.dim }, { text: '"churn_risk"', color: C.string }, { text: "},", color: C.dim }]),
  line([{ text: ")", color: C.plain }]),
  line([]),
  line([{ text: "# Policy engine evaluates. Execute if approved.", color: C.comment }]),
  line([{ text: "if", color: C.keyword }, { text: " action.status", color: C.plain }, { text: " == ", color: C.dim }, { text: '"APPROVED"', color: C.string }, { text: ":", color: C.dim }]),
  line([{ text: "    receipt", color: C.plain }, { text: " = await ", color: C.dim }, { text: "action", color: C.plain }, { text: ".", color: C.dim }, { text: "execute", color: C.orange }, { text: "()", color: C.plain }]),
  line([{ text: "    ", color: C.plain }, { text: "print", color: C.fn }, { text: "(receipt.id)", color: C.plain }, { text: "  # sha256:a3f29c...", color: C.comment }]),
];

export function CodeSnippetSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div>
            <div className="mb-4">
              <SectionEyebrow>SDK</SectionEyebrow>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
              Three lines to<br />
              governed execution.
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>
              Propose an action. The policy engine evaluates it against your rules.
              Execute with an exactly-once guarantee. Every outcome gets a tamper-evident receipt.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { step: "01", label: "pip install statis-ai" },
                { step: "02", label: "Set STATIS_API_KEY" },
                { step: "03", label: "propose → execute" },
              ].map(({ step, label }) => (
                <div key={step} className="flex items-center gap-4">
                  <span className="text-[10px] font-bold w-6 shrink-0" style={{ color: "var(--orange)" }}>{step}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-2)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: code block */}
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: "#090909",
              border: "1px solid #1e1e1e",
              borderTop: "1px solid rgba(200,92,26,0.25)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 60px rgba(200,92,26,0.03)",
            }}
          >
            {/* Terminal title bar */}
            <div
              className="flex items-center gap-3 px-4 py-2.5"
              style={{ background: "#111", borderBottom: "1px solid #1a1a1a" }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#3a1f1f" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#2e2a1a" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#1a2a1a" }} />
              </div>
              <span className="text-[9px] flex-1 text-center" style={{ color: "#333" }}>agent.py — python3</span>
            </div>

            {/* Shell prompt header */}
            <div className="px-4 pt-3 pb-1 font-mono text-[10px]" style={{ borderBottom: "1px solid #111" }}>
              <span style={{ color: "#3a3a3a" }}>~/projects/my-agent </span>
              <span style={{ color: "#c85c1a" }}>❯ </span>
              <span style={{ color: "#555" }}>python3 agent.py</span>
            </div>

            {/* Code with line numbers */}
            <pre className="text-[11px] leading-[1.8] overflow-x-auto flex">
              {/* Line numbers */}
              <div className="select-none py-4 pl-3 pr-3 text-right" style={{ color: "#252525", borderRight: "1px solid #151515", minWidth: "2.5rem" }}>
                {CODE_LINES.map((_, li) => (
                  <div key={li}>{li + 1}</div>
                ))}
              </div>
              {/* Code body */}
              <div className="py-4 pl-4 flex-1">
                {CODE_LINES.map((tokens, li) => (
                  <div key={li}>
                    {tokens.length === 0 ? (
                      <span>&nbsp;</span>
                    ) : (
                      tokens.map((tok, ti) => (
                        <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
                      ))
                    )}
                  </div>
                ))}
                {/* Blinking cursor */}
                <div className="mt-1">
                  <span style={{ color: "#c85c1a" }}>❯ </span>
                  <span className="terminal-cursor" style={{ display: "inline-block", width: "7px", height: "13px", background: "#c85c1a", verticalAlign: "middle", marginBottom: "1px" }} />
                </div>
              </div>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
