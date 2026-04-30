import { PageV6Shell, HeroV6, SectionV6, PageProseV6, PageH2V6 } from "@/components/v6/PageV6Shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP — Statis",
  description: "Wrap any MCP tool call in @statis.gate. Every Claude, Cursor, or custom tool call gets policy-evaluated and receipted.",
};

export default function MCPPage() {
  return (
    <PageV6Shell currentRoute="/mcp">
      <HeroV6
        eyebrowNum="§ 01"
        eyebrowText="MCP"
        title="Wrap any MCP tool in"
        titleStrong="@statis.gate."
        subtitle="The Model Context Protocol surfaces tools — Statis governs them. One decorator around your MCP handler and every Claude, Cursor, or custom tool call is policy-evaluated and receipted."
      />

      <SectionV6 number="§ 02" eyebrow="How it works">
        <PageProseV6>
          <p>
            MCP is a surface. <code>@statis.gate</code> is the loop. When Claude or Cursor invokes
            a tool on your MCP server, the gate intercepts: proposes the action, evaluates your
            policy rules, and either approves execution or escalates to a human. Every outcome
            writes a tamper-evident receipt.
          </p>

          <PageH2V6>Decorate your handler</PageH2V6>
        </PageProseV6>

        <div className="pv6-code-block">
          <pre>{`from statis_ai import gate

@gate(action_type="mcp_write_file")
async def write_file(path: str, content: str):
    # gate proposes + evaluates before this runs
    # receipt written atomically after completion
    return await actually_write_file(path, content)`}</pre>
        </div>

        <PageProseV6>
          <PageH2V6>Policy rule for MCP</PageH2V6>
          <p>
            Write rules that match on action type and arguments. The gate evaluates them
            deterministically — no ML, no drift.
          </p>
        </PageProseV6>

        <div className="pv6-code-block">
          <pre>{`rule: mcp_file_write_safety
when:
  action_type: mcp_write_file
then:
  condition: args.path.startswith("/workspace/")
  on_true:  APPROVE
  on_false: ESCALATE`}</pre>
        </div>
      </SectionV6>

      <SectionV6 number="§ 03" eyebrow="Supported auth types">
        <PageProseV6>
          <ul>
            <li><strong>Bearer token</strong> — OAuth2 access tokens, API keys as bearer</li>
            <li><strong>Basic auth</strong> — username/password pairs, base64 encoded automatically</li>
            <li><strong>API key header</strong> — custom header name and value</li>
            <li><strong>None</strong> — public MCP servers</li>
          </ul>
        </PageProseV6>
      </SectionV6>

      <SectionV6 number="§ 04" eyebrow="Full reference">
        <PageProseV6>
          <p>
            See the{" "}
            <a href="https://docs.statis.dev/frameworks/mcp" target="_blank" rel="noopener noreferrer">
              MCP integration docs →
            </a>{" "}
            for the full connector API, async usage, and idempotency configuration.
          </p>
        </PageProseV6>

        <div className="pv6-cta-block" style={{ marginTop: 32 }}>
          <p className="pv6-cta-block-text">
            Five minutes to your first gated MCP tool call.
          </p>
          <div className="pv6-cta-block-links">
            <a href="https://docs.statis.dev/docs/quickstart" className="pv6-btn-primary" rel="noopener">Try in 5 minutes →</a>
            <a
              href="https://calendly.com/aniket-statis/30min"
              className="pv6-btn-ghost"
              target="_blank"
              rel="noopener"
            >
              Book 30 min with a founder
            </a>
          </div>
        </div>
      </SectionV6>
    </PageV6Shell>
  );
}
