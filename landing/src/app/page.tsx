import LandingV6 from "@/components/landing/v6/LandingV6";

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Statis",
  "applicationCategory": "DeveloperApplication",
  "description":
    "One decorator. Your agent asks permission before it touches production. @statis.gate wraps any Python function an agent calls — first run blocks for a human, receipts are hash-chained from action one, repeat approvals graduate into policy.",
  "operatingSystem": "Any",
  "url": "https://statis.dev",
  "softwareVersion": "0.2.0",
  "author": { "@type": "Organization", "name": "Statis Inc.", "url": "https://statis.dev" },
  "featureList": [
    "@statis.gate — Python decorator for human-in-the-loop agent actions",
    "Signed single-use approval URLs — no Slack required",
    "Policy graduation — auto-generated YAML from approved action patterns",
    "Hash-chained receipts from action one — verifiable offline",
    "Exactly-once gate semantics — idempotency, retries, cross-agent coordination",
    "Works with LangGraph, CrewAI, Anthropic SDK, OpenAI SDK",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
      />
      <LandingV6 />
    </>
  );
}
