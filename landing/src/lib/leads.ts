/**
 * Lead intake — stub wiring for /api/contact, /api/demo, /api/subscribe.
 *
 * In production, swap the `forwardLead` body for whichever tool(s) you want
 * to capture into. Examples below — all optional, all opt-in via env vars:
 *
 *   LEAD_LINEAR_API_KEY=lin_api_xxx   → creates a Linear issue in team STA
 *   LEAD_LINEAR_TEAM_ID=STA           → team to post into
 *   LEAD_RESEND_API_KEY=re_xxx        → sends notification email
 *   LEAD_SLACK_WEBHOOK_URL=https://…  → posts to a Slack channel
 *   LEAD_NOTION_DB=xxx                → appends a row to a Notion DB
 *
 * Each forwarder is wrapped in try/catch so one failing integration never
 * blocks the request from succeeding.
 */

export type LeadKind = "contact" | "demo" | "subscribe";

export interface LeadPayload {
  kind: LeadKind;
  email: string;
  name?: string;
  company?: string;
  role?: string;
  teamSize?: string;
  useCase?: string;
  message?: string;
  source?: string;
  /** Populated server-side */
  receivedAt?: string;
  ip?: string | null;
  userAgent?: string | null;
}

export interface LeadValidation {
  ok: boolean;
  errors: Record<string, string>;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function validateLead(kind: LeadKind, body: Partial<LeadPayload>): LeadValidation {
  const errors: Record<string, string> = {};

  if (!body.email || !EMAIL_RE.test(body.email)) errors.email = "Enter a valid work email.";

  if (kind === "contact") {
    if (!body.name || body.name.trim().length < 2) errors.name = "Name is required.";
    if (!body.message || body.message.trim().length < 10) errors.message = "Tell us a little more — at least a sentence.";
  }

  if (kind === "demo") {
    if (!body.name || body.name.trim().length < 2) errors.name = "Name is required.";
    if (!body.company || body.company.trim().length < 2) errors.company = "Company is required.";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export async function forwardLead(payload: LeadPayload): Promise<void> {
  // Log every lead server-side. Replace this with your ingest path.
  // eslint-disable-next-line no-console
  console.log("[lead]", {
    kind: payload.kind,
    email: payload.email,
    source: payload.source,
    receivedAt: payload.receivedAt,
  });

  // —— Optional integrations. Each guarded by env; each swallows errors. ——

  await Promise.allSettled([
    forwardToLinear(payload),
    forwardToSlack(payload),
    forwardToResend(payload),
  ]);
}

async function forwardToLinear(payload: LeadPayload): Promise<void> {
  const apiKey = process.env.LEAD_LINEAR_API_KEY;
  const teamId = process.env.LEAD_LINEAR_TEAM_ID;
  if (!apiKey || !teamId) return;

  const title = leadTitle(payload);
  const description = leadMarkdown(payload);

  const mutation = `
    mutation IssueCreate($teamId: String!, $title: String!, $description: String!) {
      issueCreate(input: { teamId: $teamId, title: $title, description: $description }) {
        success
        issue { id identifier url }
      }
    }
  `;

  try {
    await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: apiKey },
      body: JSON.stringify({ query: mutation, variables: { teamId, title, description } }),
    });
  } catch {
    // swallow — we don't fail the user-facing request for a downstream hiccup
  }
}

async function forwardToSlack(payload: LeadPayload): Promise<void> {
  const url = process.env.LEAD_SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `*${leadTitle(payload)}*\n${leadPlain(payload)}` }),
    });
  } catch {}
}

async function forwardToResend(payload: LeadPayload): Promise<void> {
  const apiKey = process.env.LEAD_RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_TO || "hello@statis.dev";
  const from = process.env.LEAD_NOTIFY_FROM || "no-reply@statis.dev";
  if (!apiKey) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to: [to],
        subject: leadTitle(payload),
        text: leadPlain(payload),
      }),
    });
  } catch {}
}

function leadTitle(p: LeadPayload): string {
  if (p.kind === "demo") return `Demo request · ${p.company || p.name || p.email}`;
  if (p.kind === "contact") return `Contact · ${p.name || p.email}`;
  return `Newsletter · ${p.email}`;
}

function leadPlain(p: LeadPayload): string {
  const lines: string[] = [];
  if (p.name) lines.push(`Name: ${p.name}`);
  if (p.email) lines.push(`Email: ${p.email}`);
  if (p.company) lines.push(`Company: ${p.company}`);
  if (p.role) lines.push(`Role: ${p.role}`);
  if (p.teamSize) lines.push(`Team size: ${p.teamSize}`);
  if (p.useCase) lines.push(`Use case: ${p.useCase}`);
  if (p.message) lines.push(`\n${p.message}`);
  if (p.source) lines.push(`\nSource: ${p.source}`);
  if (p.receivedAt) lines.push(`Received: ${p.receivedAt}`);
  return lines.join("\n");
}

function leadMarkdown(p: LeadPayload): string {
  const rows: string[] = [];
  if (p.name) rows.push(`**Name** · ${p.name}`);
  rows.push(`**Email** · ${p.email}`);
  if (p.company) rows.push(`**Company** · ${p.company}`);
  if (p.role) rows.push(`**Role** · ${p.role}`);
  if (p.teamSize) rows.push(`**Team size** · ${p.teamSize}`);
  if (p.useCase) rows.push(`**Use case** · ${p.useCase}`);
  if (p.message) rows.push(`\n---\n\n${p.message}`);
  rows.push(`\n_Source: ${p.source || "unknown"} · received ${p.receivedAt}_`);
  return rows.join("\n");
}
