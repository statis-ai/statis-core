import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { posts, getPostBySlug } from "@/data/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts
    .filter((p) => !p.external)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Statis Blog`,
    description: post.description,
  };
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-12 mb-4 pl-4 text-xl font-bold"
      style={{ borderLeft: "2px solid var(--orange)", color: "var(--text)" }}
    >
      {children}
    </h2>
  );
}

function StaleStateContent() {
  return (
    <>
      <p className="text-base font-medium leading-relaxed" style={{ color: "#ccc" }}>
        Why Your Multi-Agent Systems are Hallucinating (and It&rsquo;s Not the
        LLM&rsquo;s Fault)
      </p>

      <p>
        You&rsquo;ve spent weeks perfecting your system prompts. You&rsquo;ve
        fine-tuned your RAG pipeline until the vector search is surgical. Yet,
        in production, your AI agents are still failing. They are making
        confident, logically sound decisions based on completely wrong
        information.
      </p>

      <p>
        In the industry, we often shrug this off as an &ldquo;LLM
        hallucination.&rdquo; But if you look under the hood of most
        multi-agent architectures, you&rsquo;ll find the culprit isn&rsquo;t
        the model &mdash; it&rsquo;s the data. Specifically, it&rsquo;s{" "}
        <strong style={{ color: "#ccc" }}>stale state</strong>.
      </p>

      <SectionHeading>The Coordination Crisis</SectionHeading>

      <p>
        Most AI agent failures are actually coordination failures. When
        multiple autonomous agents operate on the same entity (like a customer
        account), they need a shared, synchronized understanding of reality.
      </p>

      <p>
        Imagine this scenario: A high-value customer experiences a massive
        database outage and opens an urgent, furious support ticket. Your
        Support Agent (Agent&nbsp;A) instantly springs into action, processing
        the incident and updating the customer&rsquo;s sentiment score to
        &ldquo;critical risk.&rdquo;
      </p>

      <p>
        Meanwhile, your Sales Agent (Agent&nbsp;B) wakes up for its daily
        routine. It looks at a cached state from five minutes ago, sees the
        customer is &ldquo;healthy,&rdquo; and fires off an automated, cheerful
        email:{" "}
        <em style={{ color: "#666" }}>
          &ldquo;Happy Friday! Are you ready to upgrade your plan?&rdquo;
        </em>
      </p>

      <p>
        To the customer, your AI looks broken, tone-deaf, and entirely
        incoherent. But the LLM didn&rsquo;t hallucinate; it just acted on
        stale data. Agent&nbsp;B simply didn&rsquo;t know what Agent&nbsp;A
        knew.
      </p>

      <SectionHeading>The &ldquo;Polling&rdquo; Trap</SectionHeading>

      <p>
        How do most engineering teams try to fix this? They make the agents
        poll the database. Before Agent&nbsp;B sends an email, it runs a quick
        query: &ldquo;Hey, did anything change in the last five
        minutes?&rdquo;
      </p>

      <p>
        In distributed systems, polling is a code smell. When agents poll a
        database, you introduce an inherent lag between a &ldquo;semantic
        fact&rdquo; occurring in the real world and an agent actually acting on
        it. It creates a massive volume of empty queries (&ldquo;Did anything
        change? No.&rdquo;) and leaves windows of time where race conditions
        thrive. When a critical event happens, by the time your polling agent
        discovers it, the damage is already done.
      </p>

      <p>
        You don&rsquo;t want your agents &ldquo;retrieving&rdquo; dynamic
        state. You want them{" "}
        <strong style={{ color: "#ccc" }}>reacting</strong> to it.
      </p>

      <SectionHeading>
        The Statis Solution: Enter the Semantic Bus
      </SectionHeading>

      <p>
        To fix the stale state problem, we need to fundamentally change how
        agents communicate. Instead of agents asking, &ldquo;What is the
        state?&rdquo;, the infrastructure needs to tell them, &ldquo;The state
        just changed. Act now.&rdquo;
      </p>

      <p>
        This is why we built{" "}
        <strong style={{ color: "var(--orange)" }}>Statis</strong> &mdash; a
        semantic event bus designed specifically for AI agents. Think of it as{" "}
        <em>Kafka for AI state</em>.
      </p>

      <p>
        Instead of writing to isolated databases, agents publish semantic facts
        (e.g., <code>support.incident_reported</code>) to an append-only log.
        Statis acts as the central nervous system, maintaining a single,
        &ldquo;Golden Record&rdquo; of the truth. When a fact is ingested,
        Statis instantly pushes the updated state out to any subscribed agent
        via webhooks.
      </p>

      <p>
        No polling. No stale reads. If the Support Agent logs an outage, the
        Sales Agent&rsquo;s outreach is automatically paused milliseconds
        later.
      </p>

      <SectionHeading>
        The Key Concept: Materialize-on-Write
      </SectionHeading>

      <p>
        The magic behind this real-time coordination is our{" "}
        <strong style={{ color: "#ccc" }}>Materialize-on-Write</strong>{" "}
        architecture.
      </p>

      <p>
        In a traditional architecture, processing an event and updating the
        state are often disjointed, asynchronous tasks. In Statis, state
        materialization happens synchronously on write. Here is what happens
        under the hood the moment an agent sends a{" "}
        <code>POST /events</code> request:
      </p>

      <ol className="my-6 list-none space-y-4 pl-0">
        {[
          { n: "1", label: "The Append", desc: "The semantic event is ingested into an immutable log." },
          { n: "2", label: "The Lock", desc: "Statis safely locks the entity\u2019s state to prevent concurrent race conditions." },
          { n: "3", label: "The Reduction", desc: "A pure-function reducer computes the exact new state (e.g., flipping churn_risk to true)." },
          { n: "4", label: "The Push", desc: "A delivery notification is enqueued to push the new state to subscribed agents in the exact same database transaction." },
        ].map(({ n, label, desc }) => (
          <li key={n} className="flex gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
              style={{ background: "rgba(200,92,26,0.1)", color: "var(--orange)", border: "1px solid rgba(200,92,26,0.2)" }}
            >
              {n}
            </span>
            <span>
              <strong style={{ color: "#ccc" }}>{label}</strong>{" "}
              &mdash; {desc}
            </span>
          </li>
        ))}
      </ol>

      <p>
        By the time the API returns a{" "}
        <code>201 Created</code> to the Support Agent, the new state is
        already locked in, cryptographically hashed, and the notification is on
        its way to the Sales Agent. Zero lag, zero polling, and perfect
        determinism.
      </p>

      <hr className="my-10" style={{ borderColor: "#1a1a1a" }} />

      <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
        If we want to build autonomous AI systems that enterprises can actually
        trust, we have to stop asking our agents to constantly look over their
        shoulders to see what the other agents are doing. Give them a shared,
        real-time brain. Stop polling, and get on the bus.
      </p>
    </>
  );
}

const CONTENT_MAP: Record<string, () => React.ReactNode> = {
  "stale-state-problem": StaleStateContent,
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || post.external) notFound();

  const ContentComponent = CONTENT_MAP[slug];
  if (!ContentComponent) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6">
      <Link
        href="/blog"
        className="group mb-12 inline-flex items-center gap-2 text-xs transition-colors mt-8 blog-back-link"
      >
        <svg className="h-3 w-3 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        Back to Blog
      </Link>

      <header className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className="inline-block rounded px-2 py-0.5 text-[9px] uppercase tracking-wider"
            style={{ background: "rgba(200,92,26,0.1)", color: "var(--orange)", border: "1px solid rgba(200,92,26,0.2)" }}
          >
            {post.tag}
          </span>
          <span className="text-[10px]" style={{ color: "#444" }}>
            {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <span style={{ color: "#333" }}>&middot;</span>
          <span className="text-[10px]" style={{ color: "#444" }}>{post.readTime}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15]" style={{ color: "var(--text)" }}>
          {post.title}
        </h1>
      </header>

      <div
        className="space-y-6 text-sm leading-[1.9]"
        style={{ color: "var(--text-2)" }}
      >
        <style>{`
          article code {
            background: #111;
            border: 1px solid #222;
            padding: 0.1em 0.4em;
            border-radius: 3px;
            font-size: 0.85em;
            color: #aaa;
          }
        `}</style>
        <ContentComponent />
      </div>

      <div className="mt-20 pt-8 mb-24" style={{ borderTop: "1px solid #1a1a1a" }}>
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 text-xs transition-colors blog-back-link"
        >
          <svg className="h-3 w-3 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          All posts
        </Link>
      </div>
    </article>
  );
}
