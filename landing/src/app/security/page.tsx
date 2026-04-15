import { PageShell, PageH2, PageProse } from "@/components/PageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — Statis",
  description: "How Statis protects your data: encryption, access controls, audit trails, incident response.",
};

export default function SecurityPage() {
  return (
    <PageShell
      eyebrow="Security"
      title="Trust is the"
      titleAccent="product."
      subtitle="Statis is infrastructure for people who can't afford to get security wrong. Here's how we approach protecting your data, your policies, and your audit trail."
    >
      <PageProse>
        <PageH2>Encryption</PageH2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">In transit</strong> — all connections use TLS 1.3 with
            modern cipher suites. HTTP is redirected to HTTPS. HSTS is enforced.
          </li>
          <li>
            <strong className="text-white">At rest</strong> — all databases use AES-256
            encryption. Backups are encrypted with separate keys.
          </li>
          <li>
            <strong className="text-white">Secrets</strong> — API keys, connector credentials,
            and webhook signatures are stored encrypted with envelope encryption.
          </li>
        </ul>

        <PageH2>Authentication & access</PageH2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Password hashing with bcrypt and per-user salts</li>
          <li>OIDC SSO support (Okta, Entra ID) on Enterprise plans</li>
          <li>API keys are scoped per-environment and rotatable</li>
          <li>Every console and API action is logged with actor, timestamp, and outcome</li>
        </ul>

        <PageH2>Audit trail</PageH2>
        <p>
          Every action that flows through Statis produces a tamper-evident receipt: SHA-256 of
          the action payload, outcome, policy evaluation, and timestamp. Receipts are written
          atomically with execution and cannot be modified after the fact. This is not a
          security feature — it&apos;s the product.
        </p>

        <PageH2>Isolation</PageH2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Tenant-scoped data at every layer (DB, API, worker)</li>
          <li>Row-level security on all multi-tenant tables</li>
          <li>Separate connector credentials per tenant — no cross-tenant access</li>
          <li>Dedicated infrastructure available on Enterprise plans</li>
        </ul>

        <PageH2>Vulnerability management</PageH2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Automated dependency scanning on every commit (Dependabot)</li>
          <li>Static analysis and secret scanning in CI</li>
          <li>Quarterly third-party penetration tests (Enterprise)</li>
          <li>Public disclosure via{" "}
            <a href="mailto:security@statis.dev" className="text-[#00D4FF] hover:underline">
              security@statis.dev
            </a>
          </li>
        </ul>

        <PageH2>Incident response</PageH2>
        <p>
          In the event of a security incident that affects customer data, we will notify
          affected customers within 72 hours via email and in-product banner. Post-incident
          reports are published at{" "}
          <a href="https://status.statis.dev" target="_blank" rel="noopener noreferrer" className="text-[#00D4FF] hover:underline">
            status.statis.dev
          </a>
          .
        </p>

        <PageH2>Compliance roadmap</PageH2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">SOC 2 Type II</strong> — audit in progress, report
            expected Q3 2026
          </li>
          <li>
            <strong className="text-white">HIPAA</strong> — BAA available on Enterprise plans
          </li>
          <li>
            <strong className="text-white">GDPR</strong> — DPA available on request, EU
            residency on Enterprise plans
          </li>
          <li>
            <strong className="text-white">ISO 27001</strong> — planned for Q4 2026
          </li>
        </ul>

        <PageH2>Self-hosted</PageH2>
        <p>
          For customers who need full control, Statis is available as a self-hosted distribution
          via Docker Compose or Kubernetes. All data stays on your infrastructure. See the{" "}
          <a href="https://docs.statis.dev/self-host" target="_blank" rel="noopener noreferrer" className="text-[#00D4FF] hover:underline">
            self-hosting guide
          </a>
          .
        </p>

        <PageH2>Report a vulnerability</PageH2>
        <p>
          If you believe you&apos;ve found a security vulnerability, please report it
          responsibly to{" "}
          <a href="mailto:security@statis.dev" className="text-[#00D4FF] hover:underline">
            security@statis.dev
          </a>
          . We acknowledge reports within one business day and aim to triage within 72 hours.
          We appreciate your help keeping Statis secure.
        </p>
      </PageProse>
    </PageShell>
  );
}
