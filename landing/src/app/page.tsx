import { NavbarV2 } from "@/components/sections/NavbarV2";
import { HeroV2 } from "@/components/hero/HeroV2";
import { TrustBarSection } from "@/components/sections/TrustBarSection";
import { BentoFeaturesSection } from "@/components/sections/BentoFeaturesSection";
import { ProblemBridgeSection } from "@/components/sections/ProblemBridgeSection";
import { PrimitivesFlowSection } from "@/components/sections/PrimitivesFlowSection";
import { SDKQuickstartSection } from "@/components/sections/SDKQuickstartSection";
import { AIStackSection } from "@/components/sections/AIStackSection";
import { ComplianceStripSection } from "@/components/sections/ComplianceStripSection";
import { UseCasesSection } from "@/components/sections/UseCasesSection";
import { MemoryVsRealitySection } from "@/components/sections/MemoryVsRealitySection";
import { BlogSection } from "@/components/sections/BlogSection";
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
        <TrustBarSection />
        <div className="surface-raised"><BentoFeaturesSection /></div>
        <ProblemBridgeSection />
        <PrimitivesFlowSection />
        <SDKQuickstartSection />
        <AIStackSection />
        <ComplianceStripSection />
        <UseCasesSection />
        <div className="surface-raised"><MemoryVsRealitySection /></div>
        <div className="surface-raised"><BlogSection /></div>
        <FAQSection />
        <FooterV2 />
      </main>
    </>
  );
}
