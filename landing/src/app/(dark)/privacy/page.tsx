import { PageV6Shell, HeroV6, SectionV6, PageProseV6, PageH2V6 } from "@/components/v6/PageV6Shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Statis",
  description: "How Statis collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <PageV6Shell currentRoute="/privacy">
      <HeroV6
        eyebrowNum="§ 01"
        eyebrowText="Legal"
        title="Privacy Policy."
        subtitle="Last updated April 10, 2026. Short version: we collect what we need, we don't sell it, and we delete it when you ask."
      />

      <SectionV6>
        <PageProseV6>
          <PageH2V6>1. What we collect</PageH2V6>
          <p>We collect three categories of data:</p>
          <ul>
            <li><strong>Account data</strong> — email, name, organization, hashed password, API keys</li>
            <li><strong>Product data</strong> — action proposals, policy evaluations, execution receipts, audit trail entries</li>
            <li><strong>Usage data</strong> — logs, metrics, and request traces for operating the Service</li>
          </ul>

          <PageH2V6>2. How we use it</PageH2V6>
          <p>We process your data only to:</p>
          <ul>
            <li>Provide, operate, and improve the Service</li>
            <li>Enforce the policies and receipts you configure</li>
            <li>Send service-related announcements (outages, security, billing)</li>
            <li>Respond to support requests</li>
            <li>Comply with legal obligations</li>
          </ul>

          <PageH2V6>3. What we don&apos;t do</PageH2V6>
          <ul>
            <li>We do not sell your data to third parties</li>
            <li>We do not use your action payloads to train AI models</li>
            <li>We do not read your private data outside of support requests you initiate</li>
            <li>We do not share data with advertisers</li>
          </ul>

          <PageH2V6>4. Data retention</PageH2V6>
          <p>
            Account data is retained while your account is active. Product data (receipts, audit entries)
            is retained according to your plan&apos;s retention window, minimum 90 days. Deleted data is
            purged from all backups within 30 days.
          </p>

          <PageH2V6>5. Data location</PageH2V6>
          <p>
            By default, data is stored in US data centers. Enterprise customers may choose EU residency.
            Self-hosted deployments keep all data on your own infrastructure.
          </p>

          <PageH2V6>6. Your rights</PageH2V6>
          <p>Depending on your jurisdiction, you may have rights to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Object to certain processing activities</li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a href="mailto:privacy@statis.dev">privacy@statis.dev</a>.
          </p>

          <PageH2V6>7. Cookies</PageH2V6>
          <p>
            We use essential cookies for authentication and session management. We do not use advertising
            cookies or third-party trackers. Analytics via Plausible — no cookies, no personal data.
          </p>

          <PageH2V6>8. Subprocessors</PageH2V6>
          <ul>
            <li><strong>Neon</strong> — primary database (PostgreSQL)</li>
            <li><strong>Render</strong> — API hosting</li>
            <li><strong>Vercel</strong> — console and landing hosting</li>
            <li><strong>Resend</strong> — transactional email</li>
          </ul>

          <PageH2V6>9. Security</PageH2V6>
          <p>
            See our <a href="/security">Security page</a> for details on how we protect your data in
            transit, at rest, and in incident response.
          </p>

          <PageH2V6>10. Changes</PageH2V6>
          <p>
            We may update this policy. Material changes will be announced at least 30 days before
            taking effect.
          </p>

          <PageH2V6>11. Contact</PageH2V6>
          <p>
            Privacy questions? Email <a href="mailto:privacy@statis.dev">privacy@statis.dev</a>.
          </p>
        </PageProseV6>
      </SectionV6>
    </PageV6Shell>
  );
}
