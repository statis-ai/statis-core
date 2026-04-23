import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { PricingTable } from "@/components/landing/PricingTable";
import { IsoPricingTiers } from "@/components/ui/IsoIllustrations";

export const metadata: Metadata = {
  title: "Pricing — Statis",
  description:
    "Three tiers: open-source Context Kit, Developer Cloud for teams, and Enterprise Governance for regulated industries.",
};

export default function PricingPage() {
  return (
    <PageShell
      eyebrow="Pricing"
      title="Start free."
      titleAccent="Scale when you need to."
      subtitle="Open-source Context Kit for individuals. Developer Cloud for teams. Enterprise Governance for regulated industries — on-prem or VPC."
      illustration={<IsoPricingTiers />}
    >
      <PricingTable />
    </PageShell>
  );
}
