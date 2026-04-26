/**
 * IdentityCard — D16
 *
 * 2-line identity card on the approval page. Renders the FROZEN
 * `agent_identity_snapshot` from the action (OV-T2) — never live-joins
 * against the agents table, so a forwarded URL keeps the original
 * handle/version even after the agent is renamed or retired.
 *
 * Layout:
 *   line 1 (--text 13px medium):    `{handle} · {version}`
 *   line 2 (--text-muted 11px):     `{spawned_by} · {actions_today} actions today · {denied_today} denied`
 */
import * as React from "react";
import type { AgentIdentitySnapshot } from "@/lib/approval-types";

export interface IdentityCardProps {
  agent: AgentIdentitySnapshot;
}

export function IdentityCard({ agent }: IdentityCardProps): React.ReactElement {
  const handle = agent.version
    ? `${agent.handle} · ${agent.version}`
    : agent.handle;

  const lineageBits: string[] = [];
  if (agent.spawned_by) lineageBits.push(`spawned by ${agent.spawned_by}`);
  lineageBits.push(`${agent.actions_today} actions today`);
  lineageBits.push(`${agent.denied_today} denied`);

  return (
    <div className="identity-card" data-testid="identity-card">
      <div className="identity-card__handle">{handle}</div>
      <div className="identity-card__lineage">{lineageBits.join(" · ")}</div>
    </div>
  );
}
