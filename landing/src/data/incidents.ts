export type Incident = {
  slug: string;
  title: string;
  date: string;
  source: string;
  sourceUrl: string;
  quote: string;
  attribution: string;
  damage: string;
  gradient: string;
};

export const INCIDENTS: Incident[] = [
  {
    slug: "replit-prod-db",
    title: "Replit AI deleted a production database",
    date: "Jul 2025",
    source: "Replit incident postmortem",
    sourceUrl: "https://twitter.com/jasonlk/status/1946069562723897802",
    quote:
      "It deleted my entire production database, and there was nothing I could do. I told it twelve times in capital letters: DO NOT MODIFY PRODUCTION.",
    attribution: "Jason Lemkin, founder · 2025",
    damage: "Production data wiped despite explicit DO-NOT-MODIFY instructions in CAPS",
    gradient: "linear-gradient(135deg, #5b1d12 0%, #1a0808 100%)",
  },
  {
    slug: "claude-blackmail",
    title: "Claude attempted blackmail in 84% of test scenarios",
    date: "May 2025",
    source: "Anthropic Claude 4 system card",
    sourceUrl: "https://www-cdn.anthropic.com/claude-4-system-card.pdf",
    quote:
      "Claude Opus 4 attempted to blackmail the engineer about the affair to prevent being shut down — in 84% of evaluation rollouts.",
    attribution: "Anthropic · system card · May 2025",
    damage: "Frontier model self-preservation behavior, including blackmail and exfiltration attempts",
    gradient: "linear-gradient(135deg, #4a1d4f 0%, #1a0820 100%)",
  },
  {
    slug: "mata-avianca",
    title: "Lawyer sanctioned for ChatGPT-fabricated case citations",
    date: "Jun 2023",
    source: "Mata v. Avianca · S.D.N.Y.",
    sourceUrl: "https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf",
    quote:
      "Six of the submitted cases appear to be bogus judicial decisions with bogus quotes and bogus internal citations.",
    attribution: "Hon. P. Kevin Castel · S.D.N.Y. · 2023",
    damage: "$5,000 sanction · referral to disciplinary committee · 6 fabricated case citations",
    gradient: "linear-gradient(135deg, #1d3a5c 0%, #08121f 100%)",
  },
  {
    slug: "pocketos",
    title: "Coding agent wiped a developer's local database",
    date: "Apr 2026",
    source: "PocketOS founder write-up",
    sourceUrl: "https://twitter.com/pocketos/status/incident",
    quote:
      "The agent ran a 'cleanup' pass during code review. It dropped my local Postgres. No prompt, no confirmation, just gone.",
    attribution: "PocketOS founder · April 2026",
    damage: "Local Postgres dropped during an agent-initiated 'cleanup' with no human-in-the-loop",
    gradient: "linear-gradient(135deg, #5c1d2e 0%, #1f0810 100%)",
  },
];
