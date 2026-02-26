import { NavbarV2 } from "@/components/sections/NavbarV2";
import { HeroV2 } from "@/components/hero/HeroV2";
import { BentoFeaturesSection } from "@/components/sections/BentoFeaturesSection";
import { PrimitivesSection } from "@/components/sections/PrimitivesSection";
import { UseCasesSection } from "@/components/sections/UseCasesSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { MetricsRibbonSection } from "@/components/sections/MetricsRibbonSection";
import { FooterV2 } from "@/components/sections/FooterV2";

export default function Home() {
  return (
    <>
      <NavbarV2 />
      <main className="relative z-10 min-h-screen bg-gray-50">
        <HeroV2 />
        <BentoFeaturesSection />
        <PrimitivesSection />
        <MetricsRibbonSection />
        <UseCasesSection />
        <FAQSection />
        <FooterV2 />
      </main>
    </>
  );
}
