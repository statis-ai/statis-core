import LandingV5 from "@/components/landing/v5/LandingV5";

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Statis",
  "applicationCategory": "DeveloperApplication",
  "description": "The trust layer for agent runtimes. Every context evaluated, every action authorized, every execution receipted.",
  "operatingSystem": "Any",
  "url": "https://statis.dev",
  "softwareVersion": "0.1.0",
  "author": { "@type": "Organization", "name": "Statis Inc.", "url": "https://statis.dev" },
  "featureList": [
    "Context Kit — open-source compressor, cost meter, pattern guard",
    "Developer Cloud — policy editor, execution history, semantic guard, cost dashboard",
    "Enterprise — admission engine, hash-chain receipts, approval flows, SSO, SOC2/HIPAA/SEC exports",
    "Adapters — GitHub, Linear, Slack, MCP, Airflow, HubSpot, Salesforce, Zendesk",
    "SDKs — Python (PyPI: statis-kit) and TypeScript",
    "MCP — route Claude and Cursor tool calls through governance",
    "Self-hosted and VPC deployment for enterprise",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
      />
      <LandingV5 />
    </>
  );
}
