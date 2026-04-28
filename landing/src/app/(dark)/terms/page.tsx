import { PageV6Shell, HeroV6, SectionV6, PageProseV6, PageH2V6 } from "@/components/v6/PageV6Shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Statis",
  description: "Terms of service for the Statis platform.",
};

export default function TermsPage() {
  return (
    <PageV6Shell currentRoute="/terms">
      <HeroV6
        eyebrowNum="§ 01"
        eyebrowText="Legal"
        title="Terms of Service."
        subtitle="Last updated April 10, 2026. These terms govern your use of the Statis platform, SDKs, and hosted services."
      />

      <SectionV6>
        <PageProseV6>
          <PageH2V6>1. Acceptance</PageH2V6>
          <p>
            By accessing or using Statis (the &quot;Service&quot;), you agree to be bound by these
            Terms of Service. If you&apos;re using Statis on behalf of an organization, you represent
            that you have authority to bind that organization.
          </p>

          <PageH2V6>2. The Service</PageH2V6>
          <p>
            Statis provides a decorator-based agent governance layer: the <code>@statis.gate</code> decorator,
            a policy engine, signed approval pages, an audit receipt ledger, and SDKs for Python and
            TypeScript. Available as a hosted platform and as a self-hostable open-core distribution.
          </p>

          <PageH2V6>3. Your account</PageH2V6>
          <p>
            You&apos;re responsible for maintaining the security of your account credentials and API keys.
            Notify us immediately of any unauthorized access. You&apos;re liable for all activity under
            your account.
          </p>

          <PageH2V6>4. Acceptable use</PageH2V6>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Violate any applicable law or regulation</li>
            <li>Infringe on the intellectual property rights of others</li>
            <li>Transmit malware, viruses, or other harmful code</li>
            <li>Interfere with or disrupt the Service or its infrastructure</li>
            <li>Attempt to gain unauthorized access to other accounts or systems</li>
            <li>Use the Service to generate or facilitate spam, phishing, or fraud</li>
          </ul>

          <PageH2V6>5. Data & privacy</PageH2V6>
          <p>
            Your use of the Service is subject to our <a href="/privacy">Privacy Policy</a>. You retain
            ownership of all data you submit through the Service. We process your data only as needed to
            provide the Service.
          </p>

          <PageH2V6>6. Service availability</PageH2V6>
          <p>
            We strive for high availability but do not guarantee uninterrupted service. Check{" "}
            <a href="https://status.statis.dev" target="_blank" rel="noopener noreferrer">
              status.statis.dev
            </a>{" "}
            for real-time status.
          </p>

          <PageH2V6>7. Pricing & billing</PageH2V6>
          <p>
            Pricing is published at <a href="/pricing">statis.dev/pricing</a> and in your account
            dashboard. Paid plans are billed monthly or annually in advance. Taxes are your
            responsibility except where required by law.
          </p>

          <PageH2V6>8. Termination</PageH2V6>
          <p>
            You may cancel your account at any time. We may suspend or terminate accounts that violate
            these terms. Upon termination, your right to use the Service ends immediately. We&apos;ll
            retain your data for 30 days post-termination to allow export.
          </p>

          <PageH2V6>9. Disclaimers</PageH2V6>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. We disclaim all
            implied warranties including merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>

          <PageH2V6>10. Limitation of liability</PageH2V6>
          <p>
            To the maximum extent permitted by law, Statis Inc. shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages. Our total liability shall not
            exceed the amount paid by you to Statis in the twelve months preceding the claim.
          </p>

          <PageH2V6>11. Changes</PageH2V6>
          <p>
            We may update these terms from time to time. Material changes will be announced via email
            or in-product notification at least 30 days before taking effect.
          </p>

          <PageH2V6>12. Governing law</PageH2V6>
          <p>
            These terms are governed by the laws of the State of California. Disputes shall be resolved
            in the state or federal courts located in San Francisco County, California.
          </p>

          <PageH2V6>13. Contact</PageH2V6>
          <p>
            Questions about these terms? Email <a href="mailto:legal@statis.dev">legal@statis.dev</a>.
          </p>
        </PageProseV6>
      </SectionV6>
    </PageV6Shell>
  );
}
