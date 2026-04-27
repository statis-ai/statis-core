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
      style={{ borderLeft: "2px solid #00D4FF", color: "var(--text)" }}
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
        <strong style={{ color: "#00D4FF" }}>Statis</strong> &mdash; a
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
              style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}
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

function CompressorLaunchContent() {
  return (
    <>
      <p className="text-base font-medium leading-relaxed" style={{ color: "#ccc" }}>
        We built Statis Context Kit for our own agents. Then we gave it away.
      </p>

      <p>
        If you&rsquo;ve shipped an agent into production, you already know the feeling: a
        seven-figure monthly inference bill that crept up while nobody was looking, a
        hallucination trail that turned out to be a stale tool response buried on turn 14, a
        prompt-injection report from a user who pasted something you never imagined. The model
        isn&rsquo;t the problem. The{" "}
        <strong style={{ color: "#ccc" }}>context you hand the model</strong> is the problem.
      </p>

      <SectionHeading>The 7,800 &rarr; 3,200 token run</SectionHeading>

      <p>
        Our first internal dogfood was embarrassing. An agent that kept failing at turn 20, not
        because the reasoning was wrong, but because context had bloated past the effective
        window. We sketched a compressor in an afternoon &mdash; pin the system prompt,
        summarize anything older than the last two turns, prune tool calls whose results were
        already restated.
      </p>

      <p>
        The next run: <strong style={{ color: "#00D4FF" }}>7,800 tokens collapsed to 3,200</strong>.
        Same answer, same latency, $0.018 less per call. At the volume our staging agent was
        running, that was four figures a month off the bill. So we kept building: a cost meter,
        a pattern guard, a diff viewer so we could see what was pinned versus pruned.
      </p>

      <SectionHeading>The call we kept having with every AI team</SectionHeading>

      <p>
        We started showing this to friends at other agent companies. Every one of them had
        built or was about to build the same three things. Compressor. Cost meter. Guard. None
        of them wanted to maintain it. All of them wanted it free, local, and without a vendor
        signup wall between them and the first run.
      </p>

      <p>
        So <strong style={{ color: "#ccc" }}>Statis Context Kit</strong> is what we wanted:
        five lines of Python, zero account, MIT license, runs entirely in-process. It&rsquo;s
        what we already use on our own agents. Now it&rsquo;s what you use on yours.
      </p>

      <div
        className="rounded-xl p-5 my-6 font-mono text-[12px] leading-relaxed overflow-x-auto"
        style={{ background: "#0E0E10", border: "1px solid rgba(255,255,255,0.06)", color: "#E4E4E7" }}
      >
        <pre className="text-white">
{`pip install statis-kit

from statis_kit import process

result = process(messages, config={"pin_top": ["system"], "recent_turns": 2})
print(result.report.token_delta, result.report.cost_estimate)`}
        </pre>
      </div>

      <SectionHeading>What&rsquo;s in the box</SectionHeading>

      <ol className="my-6 list-none space-y-4 pl-0">
        {[
          { n: "1", label: "Compressor", desc: "Pin, prune, summarize. Configurable. Deterministic. Reports the delta so you can audit what changed." },
          { n: "2", label: "Cost meter", desc: "Per-turn, per-model token accounting. GPT-4o, Claude 4.5, Gemini, Llama \u2014 priced against the live rate cards." },
          { n: "3", label: "Pattern guard", desc: "Prompt-injection, secret exfiltration, and PII patterns. Runs before the model call, not after the incident." },
          { n: "4", label: "Diff viewer CLI", desc: "Paste two transcripts, get a side-by-side of what the compressor would do. Good for CI, good for debugging." },
        ].map(({ n, label, desc }) => (
          <li key={n} className="flex gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
              style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}
            >
              {n}
            </span>
            <span>
              <strong style={{ color: "#ccc" }}>{label}</strong> &mdash; {desc}
            </span>
          </li>
        ))}
      </ol>

      <SectionHeading>Why free, not freemium</SectionHeading>

      <p>
        Because this is the <em>context in</em> pillar of the Statis trust layer &mdash; and
        we want every agent on the planet to ship with it, not just the ones who are ready to
        buy. The <a href="/pricing" style={{ color: "#00D4FF" }}>paid tiers</a> are what you
        graduate into when you need a hosted policy editor, execution history, approvals, or a
        hash-chain audit ledger that passes a SOC2 review.
      </p>

      <p>
        Put differently: the Kit is the firewall. The cloud is the SIEM. The enterprise
        product is the compliance report. You need all three eventually. You need the first
        one <strong style={{ color: "#ccc" }}>today</strong>, for free, without asking
        anyone&rsquo;s permission.
      </p>

      <hr className="my-10" style={{ borderColor: "#1a1a1a" }} />

      <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
        <code>pip install statis-kit</code>. Five minutes from now you&rsquo;ll know what your
        context actually costs. And you&rsquo;ll stop paying for the turns you don&rsquo;t
        need.
      </p>
    </>
  );
}

function StatisOnStatisContent() {
  return (
    <>
      <p className="text-base font-medium leading-relaxed" style={{ color: "#ccc" }}>
        Every CI merge, deploy, release, Linear ticket, and Slack notification
        in this repo goes through our own policy engine. Twenty days in, here&rsquo;s
        the ledger.
      </p>

      <p>
        There&rsquo;s a kind of infrastructure company that builds a trust product,
        ships it, and then quietly merges its own PRs the way it always did.
        We didn&rsquo;t want to be that. So on April 4th we pointed five agents
        at our own GitHub, Linear, and Slack, seeded eleven policy rules, and
        started routing every internal automation through the same API we hand
        to customers.
      </p>

      <SectionHeading>What&rsquo;s actually governed</SectionHeading>

      <p>
        Five agents, each with a narrow allowed-action list and an hourly rate
        limit:
      </p>

      <ol className="my-6 list-none space-y-3 pl-0">
        {[
          { n: "1", label: "ci-gate-agent", desc: "Proposes every PR merge. Escalates to a human if CI hasn’t passed or there are no approvals." },
          { n: "2", label: "deploy-agent", desc: "Staging deploys auto-approve; production deploys escalate; anything else is denied." },
          { n: "3", label: "release-agent", desc: "Tags and publishes GitHub releases, but only with an operator attestation." },
          { n: "4", label: "issue-triage-agent", desc: "Creates and updates Linear issues from CI failures and user reports." },
          { n: "5", label: "notify-agent", desc: "Posts and edits Slack notifications — deploys, incidents, weekly retros." },
        ].map(({ n, label, desc }) => (
          <li key={n} className="flex gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
              style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}
            >
              {n}
            </span>
            <span>
              <strong style={{ color: "#ccc" }}>
                <code>{label}</code>
              </strong>{" "}
              &mdash; {desc}
            </span>
          </li>
        ))}
      </ol>

      <p>
        The rules live in{" "}
        <code>dogfood/policies.yaml</code>. They&rsquo;re not secret, they&rsquo;re not
        bespoke, they&rsquo;re the same primitives anyone gets from{" "}
        <code>pip install statis-ai</code>.
      </p>

      <SectionHeading>The ledger, April 4 &ndash; April 24</SectionHeading>

      <div
        className="rounded-xl p-5 my-6 font-mono text-[12px] leading-relaxed overflow-x-auto"
        style={{ background: "#0E0E10", border: "1px solid rgba(255,255,255,0.06)", color: "#E4E4E7" }}
      >
        <pre className="text-white">
{`GET /analytics/summary?days=30

{
  "actions_total":     111,
  "actions_approved":  110,
  "actions_escalated": 1,
  "actions_denied":    0,
  "approval_rate":     0.991
}`}
        </pre>
      </div>

      <p>
        One hundred and eleven actions. One hundred and ten auto-approved.
        One escalation. Zero denials.
      </p>

      <SectionHeading>What &ldquo;zero incidents&rdquo; means here</SectionHeading>

      <p>
        We&rsquo;re being specific about this on purpose, because the word gets
        abused. Over those twenty days:
      </p>

      <ol className="my-6 list-none space-y-3 pl-0">
        {[
          { n: "0", label: "FAILED executions", desc: "Every APPROVED action that reached the worker also reached its target system and returned a receipt." },
          { n: "0", label: "Policy bypasses", desc: "No action skipped evaluation. No agent went around the contract. The engine is fail-closed." },
          { n: "0", label: "Kill-switch activations", desc: "We never had to pull the emergency brake. It still works — we test it weekly." },
          { n: "0", label: "Threat-log entries", desc: "No anomaly detector tripped. No exfiltration pattern matched. No rate-limit breach." },
        ].map(({ n, label, desc }) => (
          <li key={n} className="flex gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
              style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}
            >
              {n}
            </span>
            <span>
              <strong style={{ color: "#ccc" }}>{label}</strong> &mdash; {desc}
            </span>
          </li>
        ))}
      </ol>

      <p>
        The one escalation isn&rsquo;t an incident &mdash; it&rsquo;s the
        product. Earlier today <code>ci-gate-agent</code> proposed a merge on PR
        #15 before CI had posted a green status. The{" "}
        <code>dogfood_merge_default</code> rule routed it to a human. It&rsquo;s
        still sitting in the escalation queue as of this writing. That&rsquo;s
        exactly what we want.
      </p>

      <SectionHeading>What this proves, and what it doesn&rsquo;t</SectionHeading>

      <p>
        It proves the engine works under the specific load of a small
        infra startup&rsquo;s own CI/CD. It does not prove Statis can take a
        thousand agents writing to Salesforce at once &mdash; that bar is
        higher, and customers are the ones pushing it. What we can say is that
        the internal team stopped asking for exceptions. There is no
        &ldquo;oh but just this one merge can skip&rdquo; side channel. The
        console is the console, the receipts are the receipts, and when
        something needs a human the queue makes that visible.
      </p>

      <p>
        We also gave up nothing. Deploy latency didn&rsquo;t change. No
        engineer has filed a &ldquo;Statis is in the way&rdquo; ticket.
        Approving an escalation is one click. The trade we thought we&rsquo;d
        be making &mdash; safety for speed &mdash; didn&rsquo;t materialize.
      </p>

      <SectionHeading>How to run it on your stack</SectionHeading>

      <div
        className="rounded-xl p-5 my-6 font-mono text-[12px] leading-relaxed overflow-x-auto"
        style={{ background: "#0E0E10", border: "1px solid rgba(255,255,255,0.06)", color: "#E4E4E7" }}
      >
        <pre className="text-white">
{`pip install statis-ai

# register agents, seed policies, verify with simulate
STATIS_API_KEY=st_... ./dogfood/bootstrap.sh`}
        </pre>
      </div>

      <p>
        The agents file, the policy YAML, and the bootstrap script are in the
        repo. Fork them, swap our agent IDs for yours, and you have the same
        setup running against your GitHub inside of ten minutes.
      </p>

      <hr className="my-10" style={{ borderColor: "#1a1a1a" }} />

      <p className="text-base leading-relaxed" style={{ color: "#aaa" }}>
        We&rsquo;ll publish this ledger monthly. When the number gets bigger
        and the incidents are still zero, we&rsquo;ll tell you. When something
        breaks, we&rsquo;ll tell you that too &mdash; with the receipt hash.
      </p>
    </>
  );
}

const CONTENT_MAP: Record<string, () => React.ReactNode> = {
  "stale-state-problem": StaleStateContent,
  "why-we-open-sourced-the-compressor": CompressorLaunchContent,
  "statis-on-statis": StatisOnStatisContent,
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
            style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}
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
