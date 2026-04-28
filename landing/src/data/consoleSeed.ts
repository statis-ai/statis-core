export type ConsoleRow = {
  action: string;
  detail: string;
  agent: string;
  decision: "COMPLETED" | "ESCALATED" | "DENIED" | "PENDING";
  decisionDetail?: string;
  latency: string;
  receipt: string;
};

export const CONSOLE_NAV = [
  { section: "Observe", items: ["Home", "Actions", "Receipts", "Escalations"] },
  { section: "Govern", items: ["Policies", "Threat logs", "Events"] },
  { section: "Build", items: ["Agents", "Adapters", "Developers", "Entities", "Webhooks"] },
  { section: "Admin", items: ["Kill-switch", "Settings"] },
];

export const CONSOLE_KPIS = [
  { label: "Actions · 24h", value: "12,847", hint: "+8.4% vs yesterday" },
  { label: "Success rate", value: "99.97%", hint: "11 escalated · 0 denied" },
  { label: "Median latency", value: "284ms", hint: "p95 1.4s" },
  { label: "Receipts written", value: "1.28M", hint: "chain unbroken since Q1" },
];

export const CONSOLE_HISTOGRAM = [
  3, 4, 2, 5, 8, 12, 18, 24, 31, 38, 42, 47,
  51, 49, 44, 40, 38, 33, 27, 21, 16, 12, 9, 6,
];

export const CONSOLE_ROWS: ConsoleRow[] = [
  {
    action: "stripe.refund.create",
    detail: "$1,240.00 · cus_NfA9r2X8",
    agent: "billing-bot",
    decision: "COMPLETED",
    latency: "412ms",
    receipt: "0x9a4f…c2e1",
  },
  {
    action: "linear.issue.create",
    detail: "ENG-2703 · Faster app launch",
    agent: "triage-agent",
    decision: "COMPLETED",
    latency: "188ms",
    receipt: "0xb71d…44a8",
  },
  {
    action: "gh.pr.merge",
    detail: "statis-core#412 · main",
    agent: "release-bot",
    decision: "ESCALATED",
    decisionDetail: "approved · aniket",
    latency: "14m 02s",
    receipt: "0xe003…91fc",
  },
  {
    action: "resend.email.send",
    detail: "Welcome to Statis · 1,204 recips",
    agent: "onboarding-bot",
    decision: "COMPLETED",
    latency: "304ms",
    receipt: "0x2ab1…0d77",
  },
  {
    action: "db.user.delete",
    detail: "user_id 88123 · cascade",
    agent: "support-agent",
    decision: "DENIED",
    decisionDetail: "policy: pii.user_delete",
    latency: "19ms",
    receipt: "—",
  },
  {
    action: "slack.post",
    detail: "#incidents · INC-4421",
    agent: "oncall-bot",
    decision: "COMPLETED",
    latency: "256ms",
    receipt: "0xc4d0…ee7b",
  },
  {
    action: "stripe.subscription.cancel",
    detail: "sub_PqL2sN8v · pro · annual",
    agent: "retention-bot",
    decision: "PENDING",
    decisionDetail: "awaiting reviewer",
    latency: "—",
    receipt: "—",
  },
  {
    action: "vercel.deployment.promote",
    detail: "production · build_8f21",
    agent: "deploy-bot",
    decision: "COMPLETED",
    latency: "1.4s",
    receipt: "0x5e8a…b219",
  },
  {
    action: "notion.page.archive",
    detail: "Q1 OKRs · shared",
    agent: "cleanup-bot",
    decision: "DENIED",
    decisionDetail: "policy: write.shared",
    latency: "22ms",
    receipt: "—",
  },
  {
    action: "aws.s3.delete",
    detail: "s3://statis-receipts/2024-12",
    agent: "janitor",
    decision: "DENIED",
    decisionDetail: "policy: receipt.immutable",
    latency: "11ms",
    receipt: "—",
  },
  {
    action: "twilio.sms.send",
    detail: "+1•••5183 · OTP",
    agent: "auth-agent",
    decision: "COMPLETED",
    latency: "198ms",
    receipt: "0x77fb…aa30",
  },
  {
    action: "pagerduty.incident.resolve",
    detail: "INC-4421 · sev-2",
    agent: "oncall-bot",
    decision: "COMPLETED",
    latency: "612ms",
    receipt: "0x3091…cc4d",
  },
];
