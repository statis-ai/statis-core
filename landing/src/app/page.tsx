import { NavbarV2 } from "@/components/sections/NavbarV2";
import { HeroV2 } from "@/components/hero/HeroV2";
import { ProblemBridgeSection } from "@/components/sections/ProblemBridgeSection";
import { BentoFeaturesSection } from "@/components/sections/BentoFeaturesSection";
import { IntroducingStatisSection } from "@/components/sections/IntroducingStatisSection";
import { UseCasesSection } from "@/components/sections/UseCasesSection";
import { MemoryVsRealitySection } from "@/components/sections/MemoryVsRealitySection";
import { AIStackSection } from "@/components/sections/AIStackSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FooterV2 } from "@/components/sections/FooterV2";
import { GlobalBackground } from "@/components/ui/GlobalBackground";

export default function Home() {
  return (
    <>
      <GlobalBackground />
      <NavbarV2 />
      <div className="noise-overlay" />
      <main className="relative z-10 min-h-screen bg-transparent">
        <HeroV2 />
        <BentoFeaturesSection />
        <ProblemBridgeSection />
        <IntroducingStatisSection />
        <UseCasesSection />
        <AIStackSection />
        <MemoryVsRealitySection />
        <FAQSection />
        <FooterV2 />
      </main>
    </>
  );

}
