import type { Metadata } from "next";
import { PageV6Shell, HeroV6, SectionV6, PageProseV6, PageH2V6 } from "@/components/v6/PageV6Shell";

export const metadata: Metadata = {
  title: "Security — Statis",
  description: "How Statis protects your data: encryption, access controls, audit trails, incident response.",
};

export default function SecurityPage() {
  return (
    <PageV6Shell currentRoute="/security">
      <HeroV6
        eyebrowNum="§ 01"
        eyebrowText="Security"
        title="Trust is the"
        titleStrong="product."
        subtitle="Statis is infrastructure for teams who can't afford to get security wrong. Here's how we protect your data, your policies, and your audit trail."
      />

      <SectionV6 number="§ 02" eyebrow="Encryption">
        <PageProseV6>
          <ul>
            <li>
              <strong>In transit</strong> — all connections use TLS 1.3 with modern cipher suites.
              HTTP redirects to HTTPS. HSTS enforced.
            </li>
            <li>
              <strong>At rest</strong> — databases use AES-256 encryption. Backups encrypted with
              separate keys.
            </li>
            <li>
              <strong>Secrets</strong> — API keys, connector credentials, and webhook signatures
              stored encrypted with envelope encryption.
            </li>
          </ul>
        </PageProseV6>
      </SectionV6>

      <SectionV6 number="§ 03" eyebrow="Authentication & access">
        <PageProseV6>
          <ul>
            <li>Password hashing with bcrypt and per-user salts</li>
            <li>OIDC SSO support (Okta, Entra ID) on Enterprise plans</li>
            <li>API keys scoped per-environment, rotatable</li>
            <li>Every console and API action logged with actor, timestamp, and outcome</li>
          </ul>
        </PageProseV6>
      </SectionV6>

      <SectionV6 number="§ 04" eyebrow="Audit trail">
        <PageProseV6>
          <p>
            Every action flowing through Statis produces a tamper-evident receipt: SHA-256 of the
            action payload, outcome, policy evaluation, and timestamp. Receipts are written atomically
            with execution and cannot be modified after the fact. This is not a security feature —
            it&apos;s the product.
          </p>
        </PageProseV6>
      </SectionV6>

      <SectionV6 number="§ 05" eyebrow="Isolation">
        <PageProseV6>
          <ul>
            <li>Tenant-scoped data at every layer (DB, API, worker)</li>
            <li>Row-level security on all multi-tenant tables</li>
            <li>Separate connector credentials per tenant — no cross-tenant access</li>
            <li>Dedicated infrastructure available on Enterprise plans</li>
          </ul>
        </PageProseV6>
      </SectionV6>

      <SectionV6 number="§ 06" eyebrow="Vulnerability management">
        <PageProseV6>
          <ul>
            <li>Automated dependency scanning on every commit (Dependabot)</li>
            <li>Static analysis and secret scanning in CI</li>
            <li>Quarterly third-party penetration tests (Enterprise)</li>
            <li>
              Public disclosure via <a href="mailto:security@statis.dev">security@statis.dev</a>
            </li>
          </ul>
        </PageProseV6>
      </SectionV6>

      <SectionV6 number="§ 07" eyebrow="Incident response">
        <PageProseV6>
          <p>
            In the event of a security incident affecting customer data, we notify affected customers
            within 72 hours via email and in-product banner. Post-incident reports published at{" "}
            <a href="https://status.statis.dev" target="_blank" rel="noopener noreferrer">
              status.statis.dev
            </a>
            .
          </p>
        </PageProseV6>
      </SectionV6>

      <SectionV6 number="§ 08" eyebrow="Compliance roadmap">
        <PageProseV6>
          <ul>
            <li><strong>SOC 2 Type II</strong> — audit in progress, report expected Q3 2026</li>
            <li><strong>HIPAA</strong> — BAA available on Enterprise plans</li>
            <li><strong>GDPR</strong> — DPA available on request, EU residency on Enterprise</li>
            <li><strong>ISO 27001</strong> — planned Q4 2026</li>
          </ul>

          <PageH2V6>Self-hosted</PageH2V6>
          <p>
            For customers who need full control, Statis is available as a self-hosted distribution
            via Docker Compose or Kubernetes. All data stays on your infrastructure. See the{" "}
            <a href="https://docs.statis.dev/self-host" target="_blank" rel="noopener noreferrer">
              self-hosting guide
            </a>
            .
          </p>

          <PageH2V6>Report a vulnerability</PageH2V6>
          <p>
            If you believe you&apos;ve found a security vulnerability, report it responsibly to{" "}
            <a href="mailto:security@statis.dev">security@statis.dev</a>. We acknowledge within one
            business day and triage within 72 hours. We appreciate your help keeping Statis secure.
          </p>
        </PageProseV6>
      </SectionV6>
    </PageV6Shell>
  );
}
