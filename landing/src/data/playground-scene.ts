export type Scene = {
  agent: {
    name: string;
    role: string;
    portraitSrc: string;
    fallbackInitials: string;
    scheduledAt: string;
    task: string;
    statusIdle: string;
    statusDeciding: string;
  };
  intent: {
    action: string;
    order: string;
    amount: string;
    reason: string;
  };
  policy: {
    rule: string;
    checks: { label: string; pass: boolean }[];
    decisionLabel: string;
    resolvedLabel: string;
    deniedLabel: string;
  };
  human: {
    name: string;
    role: string;
    portraitSrc: string;
    fallbackInitials: string;
    oncall: string;
  };
  slack: {
    workspace: string;
    channel: string;
    sender: string;
    body: string;
  };
  adapter: {
    name: string;
    brandColor: string;
    ackLabel: string;
    txId: string;
  };
  receipt: {
    id: string;
    sha256: string;
    executedAt: string;
    outcome: string;
  };
  headline: {
    prefix: string;
    accent: string;
    suffix: string;
    deniedAccent: string;
  };
};

export const SCENE: Scene = {
  agent: {
    name: "Maya Chen",
    role: "finance-ops-v1",
    portraitSrc: "/playground/agent-maya.jpg",
    fallbackInitials: "MC",
    scheduledAt: "02:14:00 UTC",
    task: "refund review queue",
    statusIdle: "working",
    statusDeciding: "proposing action",
  },
  intent: {
    action: "refund_customer",
    order: "ord_91bc",
    amount: "$18,450.00",
    reason: "account_error",
  },
  policy: {
    rule: "high_value_refunds_v1",
    checks: [
      { label: "action in allowed_actions", pass: true },
      { label: "agent in allowlist", pass: true },
      { label: "amount ≤ auto_approve_limit ($1,000)", pass: false },
    ],
    decisionLabel: "ESCALATE",
    resolvedLabel: "APPROVED BY OPERATOR",
    deniedLabel: "DENIED BY OPERATOR",
  },
  human: {
    name: "Sarah Martinez",
    role: "Operations Lead",
    portraitSrc: "/playground/human-sarah.jpg",
    fallbackInitials: "SM",
    oncall: "on-call · finance-ops",
  },
  slack: {
    workspace: "statis-demo",
    channel: "#finance-escalations",
    sender: "Statis",
    body:
      "finance-ops-v1 wants to refund $18,450.00 to cus_9f2a — above your auto-approval limit.",
  },
  adapter: {
    name: "stripe",
    brandColor: "#635bff",
    ackLabel: "refund.succeeded",
    txId: "re_3PqR7x2eZv…",
  },
  receipt: {
    id: "rct-9f2a4e",
    sha256: "7d4b2c8e1a55f10cb9ff22a91e9f1c8d",
    executedAt: "2026-04-11T02:14:47Z",
    outcome: "refund_customer · ok",
  },
  headline: {
    prefix: "every action. checked. ",
    accent: "escalated",
    suffix: ". receipted.",
    deniedAccent: "escalated. denied",
  },
};
