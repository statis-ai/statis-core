export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  external?: string;
  tag: string;
}

export const posts: BlogPost[] = [
  {
    slug: "statis-on-statis",
    title: "We run Statis on Statis: 100+ governed actions, 0 incidents",
    description:
      "Every CI merge, deploy, release, Linear ticket, and Slack message in this repo goes through our own policy engine. Here's what 20 days of production dogfooding actually looks like.",
    date: "2026-04-24",
    readTime: "4 min read",
    tag: "Dogfooding",
  },
  {
    slug: "why-we-open-sourced-the-compressor",
    title: "Why we open-sourced the agent compressor",
    description:
      "We built Statis Context Kit for our own agents — compressor, cost meter, pattern guard. Then we realized every agent builder needs it. So we made it free.",
    date: "2026-04-14",
    readTime: "5 min read",
    tag: "Context Kit",
  },
  {
    slug: "ai-chat-forgets-you",
    title: "Your AI Chat Forgets You. That's the Real Bug.",
    description:
      "Why stateless conversations are the silent failure mode of every AI product — and what it takes to fix it.",
    date: "2025-06-15",
    readTime: "6 min read",
    external:
      "https://medium.com/@engram.cortex/your-ai-chat-forgets-you-thats-the-real-bug-7f86e93f30a5",
    tag: "AI Memory",
  },
  {
    slug: "stale-state-problem",
    title: "The Stale State Problem",
    description:
      "Why your multi-agent systems are hallucinating — and it's not the LLM's fault. How stale state silently breaks coordination between autonomous agents.",
    date: "2025-07-02",
    readTime: "8 min read",
    tag: "Multi-Agent Systems",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
