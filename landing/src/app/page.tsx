import { NavbarV2 } from "@/components/sections/NavbarV2";
import { HeroV2 } from "@/components/hero/HeroV2";
import { ArchitectureDiagram } from "@/components/sections/ArchitectureDiagram";
import { PrimitivesSection } from "@/components/sections/PrimitivesSection";
import { UseCaseGallery } from "@/components/sections/UseCaseGallery";
import { DeveloperExperienceSection } from "@/components/sections/DeveloperExperienceSection";
import { ScaleSection } from "@/components/sections/ScaleSection";
import { FooterV2 } from "@/components/sections/FooterV2";

export default function Home() {
  return (
    <>
      <NavbarV2 />
      <main className="relative z-10 min-h-screen bg-brand-statist">
        <HeroV2 />
        <ArchitectureDiagram />
        <PrimitivesSection />
        <UseCaseGallery />
        <DeveloperExperienceSection />
        <ScaleSection />
        <FooterV2 />
      </main>
    </>
  );
}
