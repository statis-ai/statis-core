import { PageShell, PageH2, PageProse } from "@/components/PageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Statis",
  description: "How Statis collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy"
      titleAccent="Policy."
      subtitle="Last updated April 10, 2026. Short version: we collect what we need, we don't sell it, and we delete it when you ask."
    >
      <PageProse>
        <PageH2>1. What we collect</PageH2>
        <p>We collect three categories of data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">Account data</strong> — email, name, organization,
            hashed password, API keys
          </li>
          <li>
            <strong className="text-white">Product data</strong> — action proposals, policy
            evaluations, execution receipts, audit trail entries
          </li>
          <li>
            <strong className="text-white">Usage data</strong> — logs, metrics, and request
            traces for operating the Service
          </li>
        </ul>

        <PageH2>2. How we use it</PageH2>
        <p>We process your data only to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, operate, and improve the Service</li>
          <li>Enforce the policies and receipts you configure</li>
          <li>Send service-related announcements (outages, security, billing)</li>
          <li>Respond to support requests</li>
          <li>Comply with legal obligations</li>
        </ul>

        <PageH2>3. What we don&apos;t do</PageH2>
        <ul className="list-disc pl-6 space-y-2">
          <li>We do not sell your data to third parties</li>
          <li>We do not use your action payloads to train AI models</li>
          <li>We do not read your private data outside of support requests you initiate</li>
          <li>We do not share data with advertisers</li>
        </ul>

        <PageH2>4. Data retention</PageH2>
        <p>
          Account data is retained while your account is active. Product data (receipts, audit
          entries) is retained according to your plan&apos;s retention window, minimum 90 days.
          Deleted data is purged from all backups within 30 days.
        </p>

        <PageH2>5. Data location</PageH2>
        <p>
          By default, data is stored in US data centers. Enterprise customers may choose EU
          residency. Self-hosted deployments keep all data on your own infrastructure.
        </p>

        <PageH2>6. Your rights</PageH2>
        <p>Depending on your jurisdiction, you may have rights to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data in a portable format</li>
          <li>Object to certain processing activities</li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a href="mailto:privacy@statis.dev" className="text-[#00D4FF] hover:underline">
            privacy@statis.dev
          </a>
          .
        </p>

        <PageH2>7. Cookies</PageH2>
        <p>
          We use essential cookies for authentication and session management. We do not use
          advertising cookies or third-party trackers. We use privacy-respecting analytics
          (Plausible) that do not use cookies or collect personal data.
        </p>

        <PageH2>8. Subprocessors</PageH2>
        <p>We use a small set of vetted infrastructure providers:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-white">Neon</strong> — primary database (PostgreSQL)</li>
          <li><strong className="text-white">Render</strong> — API hosting</li>
          <li><strong className="text-white">Vercel</strong> — console and landing hosting</li>
          <li><strong className="text-white">Resend</strong> — transactional email</li>
        </ul>
        <p>
          We update this list as it changes. Current list always at{" "}
          <a href="/privacy#subprocessors" className="text-[#00D4FF] hover:underline">
            statis.dev/privacy
          </a>
          .
        </p>

        <PageH2>9. Security</PageH2>
        <p>
          See our{" "}
          <a href="/security" className="text-[#00D4FF] hover:underline">
            Security
          </a>{" "}
          page for details on how we protect your data in transit, at rest, and in incident
          response.
        </p>

        <PageH2>10. Changes</PageH2>
        <p>
          We may update this policy. Material changes will be announced at least 30 days
          before taking effect.
        </p>

        <PageH2>11. Contact</PageH2>
        <p>
          Privacy questions? Email{" "}
          <a href="mailto:privacy@statis.dev" className="text-[#00D4FF] hover:underline">
            privacy@statis.dev
          </a>
          .
        </p>
      </PageProse>
    </PageShell>
  );
}
