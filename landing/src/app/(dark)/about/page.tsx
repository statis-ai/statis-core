import type { Metadata } from "next";
import { PageV6Shell, HeroV6, SectionV6, PageProseV6, PageH2V6 } from "@/components/v6/PageV6Shell";

export const metadata: Metadata = {
  title: "About — Statis",
  description: "The story behind Statis and the team building @statis.gate — one decorator between your agent and production.",
};

export default function AboutPage() {
  return (
    <PageV6Shell currentRoute="/about">
      <HeroV6
        eyebrowNum="§ 01"
        eyebrowText="About"
        title="We got burned, so you don't have to."
        subtitle="Statis started with a production agent that hallucinated its way through a Stripe charge — twice, with no audit trail. We built the decorator we wish we'd had."
      />

      <SectionV6 number="§ 02" eyebrow="Why we exist">
        <PageProseV6>
          <p>
            Every team shipping AI agents in production eventually hits the same wall: something
            goes wrong, and there&apos;s no way to prove what happened. A payment fires twice. An
            email goes to the wrong list. A deploy runs at 3am on a Sunday. And when someone asks
            &quot;why did the agent do that?&quot; the answer is a shrug, a stack trace, and a
            post-incident review.
          </p>
          <p>
            The mechanics of trustworthy execution — idempotency, policy evaluation, audit trails —
            are solved problems in finance, ops, and distributed systems. Agents just need a place
            where those mechanics live. That&apos;s <code>@statis.gate</code>.
          </p>
        </PageProseV6>
      </SectionV6>

      <SectionV6 number="§ 03" eyebrow="What we believe">
        <PageProseV6>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <li>
              <strong>Determinism beats intelligence</strong> in the critical path. Your governance
              layer should be as boring as a database.
            </li>
            <li>
              <strong>Audit is the product</strong>, not a feature. The receipt ledger is the reason
              you buy this.
            </li>
            <li>
              <strong>Self-hostable by default.</strong> Trust infrastructure should never require a
              vendor&apos;s permission to inspect.
            </li>
            <li>
              <strong>Reversible decisions.</strong> Every policy versioned, every action undoable,
              every mistake recoverable.
            </li>
          </ul>
        </PageProseV6>
      </SectionV6>

      <SectionV6 number="§ 04" eyebrow="The team">
        <PageProseV6>
          <p>
            Statis is a small team building in public. We&apos;ve built infrastructure at scale,
            shipped products people use every day, and made all the distributed systems mistakes
            you can make. We&apos;re now making them at Statis, but with better audit trails.
          </p>
          <p>
            Questions, feedback, or feature requests? Email{" "}
            <a href="mailto:hello@statis.dev">hello@statis.dev</a>. We reply to everyone.
          </p>
        </PageProseV6>
      </SectionV6>

      <div className="pv6-section" style={{ border: "none" }}>
        <div className="pv6-cta-block">
          <p className="pv6-cta-block-text">
            One decorator. Five minutes to your first approval.
          </p>
          <div className="pv6-cta-block-links">
            <a href="https://docs.statis.dev/docs/quickstart" className="pv6-btn-primary" rel="noopener">Try in 5 minutes →</a>
            <a href="https://calendly.com/aniket-statis/30min" className="pv6-btn-ghost" target="_blank" rel="noopener">
              Book 30 min with a founder
            </a>
          </div>
        </div>
      </div>
    </PageV6Shell>
  );
}
