import { PageShell, PageH2, PageProse } from "@/components/PageShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Statis",
  description: "Terms of service for the Statis platform.",
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of"
      titleAccent="Service."
      subtitle="Last updated April 10, 2026. These terms govern your use of the Statis platform, SDKs, and hosted services."
    >
      <PageProse>
        <PageH2>1. Acceptance</PageH2>
        <p>
          By accessing or using Statis (the &quot;Service&quot;), you agree to be bound by these
          Terms of Service. If you&apos;re using Statis on behalf of an organization, you
          represent that you have authority to bind that organization.
        </p>

        <PageH2>2. The Service</PageH2>
        <p>
          Statis provides an agent execution infrastructure layer: a policy engine, distributed
          execution lock, audit receipt ledger, and SDKs for Python and TypeScript. The Service
          is available as a hosted platform and as a self-hostable open-core distribution.
        </p>

        <PageH2>3. Your account</PageH2>
        <p>
          You&apos;re responsible for maintaining the security of your account credentials and
          API keys. Notify us immediately of any unauthorized access. You&apos;re liable for all
          activity under your account.
        </p>

        <PageH2>4. Acceptable use</PageH2>
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Violate any applicable law or regulation</li>
          <li>Infringe on the intellectual property rights of others</li>
          <li>Transmit malware, viruses, or other harmful code</li>
          <li>Interfere with or disrupt the Service or its infrastructure</li>
          <li>Attempt to gain unauthorized access to other accounts or systems</li>
          <li>Use the Service to generate or facilitate spam, phishing, or fraud</li>
        </ul>

        <PageH2>5. Data & privacy</PageH2>
        <p>
          Your use of the Service is subject to our{" "}
          <a href="/privacy" className="text-[#FB923C] hover:underline">
            Privacy Policy
          </a>
          . You retain ownership of all data you submit through the Service. We process your
          data only as needed to provide the Service and as described in our Privacy Policy.
        </p>

        <PageH2>6. Service availability</PageH2>
        <p>
          We strive for high availability but do not guarantee uninterrupted service. Scheduled
          maintenance and unforeseen outages may occur. Check{" "}
          <a href="https://status.statis.dev" target="_blank" rel="noopener noreferrer" className="text-[#FB923C] hover:underline">
            status.statis.dev
          </a>{" "}
          for real-time status.
        </p>

        <PageH2>7. Pricing & billing</PageH2>
        <p>
          Pricing is published at statis.dev/pricing (when live) and in your account dashboard.
          Paid plans are billed monthly or annually in advance. Taxes are your responsibility
          except where required by law.
        </p>

        <PageH2>8. Termination</PageH2>
        <p>
          You may cancel your account at any time. We may suspend or terminate accounts that
          violate these terms. Upon termination, your right to use the Service ends immediately.
          We&apos;ll retain your data for 30 days post-termination to allow export.
        </p>

        <PageH2>9. Disclaimers</PageH2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. We disclaim
          all implied warranties including merchantability, fitness for a particular purpose,
          and non-infringement.
        </p>

        <PageH2>10. Limitation of liability</PageH2>
        <p>
          To the maximum extent permitted by law, Statis Inc. shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages. Our total liability
          shall not exceed the amount paid by you to Statis in the twelve months preceding the
          claim.
        </p>

        <PageH2>11. Changes</PageH2>
        <p>
          We may update these terms from time to time. Material changes will be announced via
          email or in-product notification at least 30 days before taking effect.
        </p>

        <PageH2>12. Governing law</PageH2>
        <p>
          These terms are governed by the laws of the State of California, without regard to
          conflict of law principles. Disputes shall be resolved in the state or federal courts
          located in San Francisco County, California.
        </p>

        <PageH2>13. Contact</PageH2>
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:legal@statis.dev" className="text-[#FB923C] hover:underline">
            legal@statis.dev
          </a>
          .
        </p>
      </PageProse>
    </PageShell>
  );
}
