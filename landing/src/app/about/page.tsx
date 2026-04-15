import { PageShell, PageH2, PageProse } from "@/components/PageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Statis",
  description: "The story behind Statis and the team building the execution layer for production AI agents.",
};

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="Building the trust"
      titleAccent="layer for agents."
      subtitle="Statis is infrastructure for the teams running AI agents in production. We started it because watching agents do the wrong thing, twice, with no audit trail, was slowly losing its charm."
    >
      <PageProse>
        <PageH2>Why we exist</PageH2>
        <p>
          Every company running AI agents in production eventually hits the same wall: something
          goes wrong, and there&apos;s no way to prove what happened. A payment fires twice. An
          email goes to the wrong list. A deploy runs at 3am on a Sunday. And when someone asks
          &quot;why did the agent do that?&quot; the answer is a shrug, a stack trace, and a
          post-incident review.
        </p>
        <p>
          We built Statis because this shouldn&apos;t be the state of the art. The mechanics of
          trustworthy execution — idempotency, policy evaluation, audit trails — are solved
          problems in finance, ops, and distributed systems. Agents just need a place where those
          mechanics live.
        </p>

        <PageH2>What we believe</PageH2>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <strong className="text-white">Determinism beats intelligence</strong> in the critical
            path. Your governance layer should be as boring as a database.
          </li>
          <li>
            <strong className="text-white">Audit is the product</strong>, not a feature. The
            receipt ledger is the reason you buy this.
          </li>
          <li>
            <strong className="text-white">Self-hostable by default.</strong> Trust infrastructure
            should never require a vendor&apos;s permission.
          </li>
          <li>
            <strong className="text-white">Reversible decisions.</strong> Every policy versioned,
            every action undoable, every mistake recoverable.
          </li>
        </ul>

        <PageH2>The team</PageH2>
        <p>
          Statis is a small team based in San Francisco. We&apos;ve built infrastructure at
          scale, shipped products people use every day, and made all the distributed systems
          mistakes you can make. We&apos;re now making them at Statis, but with better audit
          trails.
        </p>

        <PageH2>Backed by</PageH2>
        <p>
          Statis is an independent company building in public. We share our roadmap, our
          releases, and — occasionally — our incidents.
        </p>

        <PageH2>Get in touch</PageH2>
        <p>
          Questions, feedback, or feature requests? Email{" "}
          <a href="mailto:hello@statis.dev" className="text-[#00D4FF] hover:underline">
            hello@statis.dev
          </a>
          . Press inquiries:{" "}
          <a href="mailto:press@statis.dev" className="text-[#00D4FF] hover:underline">
            press@statis.dev
          </a>
          .
        </p>
      </PageProse>
    </PageShell>
  );
}
