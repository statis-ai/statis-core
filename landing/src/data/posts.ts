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
