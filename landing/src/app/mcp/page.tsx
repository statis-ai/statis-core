import { PageShell, PageH2, PageProse } from "@/components/PageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Connectors — Statis",
  description: "Route Claude and Cursor tool calls through the Statis policy engine. Governance-first MCP integration.",
};

export default function MCPPage() {
  return (
    <PageShell
      eyebrow="MCP Connectors"
      title="Every tool call,"
      titleAccent="governed."
      subtitle="Statis ships a first-class MCP adapter. Register your MCP servers, apply policy rules to tool calls, and get a full receipt ledger for every Claude and Cursor interaction."
    >
      <PageProse>
        <PageH2>What is MCP?</PageH2>
        <p>
          The Model Context Protocol is Anthropic&apos;s open standard for connecting AI models
          to external tools. Claude, Cursor, and a growing ecosystem of AI clients use MCP to
          discover and invoke tools on behalf of users.
        </p>
        <p>
          Statis sits in front of your MCP servers as a governance layer: every tool call is
          proposed, evaluated against policy, locked for exactly-once execution, and receipted.
        </p>

        <PageH2>How it works</PageH2>
        <div
          className="rounded-xl p-6 my-6 font-mono text-[12px] leading-relaxed"
          style={{
            background: "#0E0E10",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#E4E4E7",
          }}
        >
          <div className="space-y-1">
            <div><span style={{ color: "#71717A" }}>$</span> statis connector create \</div>
            <div className="pl-4"><span style={{ color: "#00D4FF" }}>--name</span> my-mcp-server \</div>
            <div className="pl-4"><span style={{ color: "#00D4FF" }}>--url</span> https://mcp.example.com \</div>
            <div className="pl-4"><span style={{ color: "#00D4FF" }}>--auth-type</span> bearer \</div>
            <div className="pl-4"><span style={{ color: "#00D4FF" }}>--auth-token</span> $MCP_TOKEN</div>
            <div className="mt-3"><span style={{ color: "#22C55E" }}>✓</span> Connector <span style={{ color: "#00D4FF" }}>my-mcp-server</span> registered</div>
          </div>
        </div>

        <PageH2>Policy conditions</PageH2>
        <p>
          Write policy rules that match on MCP server, tool name, and tool arguments. Allow,
          deny, or escalate any tool call before it runs against the real backend.
        </p>
        <div
          className="rounded-xl p-6 my-6 font-mono text-[12px] leading-relaxed overflow-x-auto"
          style={{
            background: "#0E0E10",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#E4E4E7",
          }}
        >
          <pre className="text-white">
{`rule: mcp_file_write_safety
when:
  action_type: mcp_tool_call
  mcp_server: my-mcp-server
  tool_name: write_file
then:
  condition: path.startswith("/workspace/")
  on_true:  APPROVE
  on_false: ESCALATE`}
          </pre>
        </div>

        <PageH2>SDK: the mcp_guard decorator</PageH2>
        <p>
          Wrap any MCP handler with the Statis SDK decorator and every tool call flows through
          the governance layer automatically.
        </p>
        <div
          className="rounded-xl p-6 my-6 font-mono text-[12px] leading-relaxed overflow-x-auto"
          style={{
            background: "#0E0E10",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#E4E4E7",
          }}
        >
          <pre className="text-white">
{`from statis import mcp_guard

@mcp_guard(connector="my-mcp-server")
async def write_file(path: str, content: str):
    # Statis evaluates policy before this runs
    # Receipt written after completion
    return await actually_write_file(path, content)`}
          </pre>
        </div>

        <PageH2>Supported auth types</PageH2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-white">Bearer token</strong> — OAuth2 access tokens, API keys as bearer</li>
          <li><strong className="text-white">Basic auth</strong> — username/password pairs, base64 encoded automatically</li>
          <li><strong className="text-white">API key header</strong> — custom header name and value</li>
          <li><strong className="text-white">None</strong> — public MCP servers</li>
        </ul>

        <PageH2>Read the docs</PageH2>
        <p>
          Full reference:{" "}
          <a
            href="https://docs.statis.dev/mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00D4FF] hover:underline"
          >
            docs.statis.dev/mcp →
          </a>
        </p>
      </PageProse>
    </PageShell>
  );
}
