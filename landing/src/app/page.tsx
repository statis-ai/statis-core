import { NavbarV2 } from "@/components/sections/NavbarV2";
import { HeroV2 } from "@/components/hero/HeroV2";
import { BentoFeaturesSection } from "@/components/sections/BentoFeaturesSection";
import { IntroducingStatisSection } from "@/components/sections/IntroducingStatisSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { UseCasesSection } from "@/components/sections/UseCasesSection";
import { MemoryVsRealitySection } from "@/components/sections/MemoryVsRealitySection";
import { MetricsRibbonSection } from "@/components/sections/MetricsRibbonSection";
import { AIStackSection } from "@/components/sections/AIStackSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FooterV2 } from "@/components/sections/FooterV2";

export default function Home() {
  return (
    <>
      <NavbarV2 />
      <main className="relative z-10 min-h-screen bg-gray-50">
        <HeroV2 />
        <BentoFeaturesSection />
        <IntroducingStatisSection />
        <BeforeAfterSection />
        <UseCasesSection />
        <MemoryVsRealitySection />
        <MetricsRibbonSection />
        <AIStackSection />
        <FAQSection />
        <FooterV2 />
      </main>
    </>
  );
}
