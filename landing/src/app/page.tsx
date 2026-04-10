import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { IntegrationsSection } from "@/components/sections/IntegrationsSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ConsolePreview } from "@/components/ConsolePreview";
import { CodeSnippetSection } from "@/components/sections/CodeSnippetSection";
import { MethodSection } from "@/components/sections/MethodSection";
import { ManifestoSection } from "@/components/sections/ManifestoSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { Dogfood } from "@/components/Dogfood";
import { ComplianceStrip } from "@/components/sections/ComplianceStrip";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/Footer";
import { SectionDivider } from "@/components/ui/SectionDivider";

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Statis",
  "applicationCategory": "DeveloperApplication",
  "description": "Agent execution infrastructure. The execution layer for production AI agents. Policy before every action, exactly-once execution guarantee, SHA-256 tamper-evident receipt on every outcome.",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "url": "https://statis.dev",
  "softwareVersion": "0.1.0",
  "author": { "@type": "Organization", "name": "Statis Inc.", "url": "https://statis.dev" },
  "featureList": [
    "Action Contract — agents propose typed intents before execution",
    "Policy Engine — deterministic rule evaluation, versioned, no ML",
    "Execution Lock — distributed exactly-once guarantee via action ID lock",
    "Ledger Receipt — SHA-256 tamper-evident receipt written atomically",
    "Adapters — Stripe, Salesforce, HubSpot, Zendesk, Airflow",
    "SDKs — Python (PyPI: statis-ai) and TypeScript (npm: statis-ai)",
    "Shadow Mode — zero-risk onramp, observe without executing",
    "MCP Integration — route Claude/Cursor tool calls through governance",
    "Self-hosted — Docker Compose deployment available",
    "OIDC SSO — Okta and Entra ID support",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
      />
      <Navbar />
      <main>
        <Hero />
        <IntegrationsSection />
        <ProblemSection />
        <ConsolePreview />
        <CodeSnippetSection />
        <SectionDivider />
        <MethodSection />
        <ManifestoSection />
        <FAQSection />
        <Dogfood />
        <ComplianceStrip />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
