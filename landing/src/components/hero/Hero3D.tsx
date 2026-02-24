"use client";

import dynamic from "next/dynamic";
import { HeroFallback } from "./HeroFallback";

const Scene = dynamic(
  () => import("@/components/three/scenes/StatisHero/index"),
  { ssr: false },
);

const CanvasShellLazy = dynamic(
  () =>
    import("@/components/three/CanvasShell").then((mod) => ({
      default: mod.CanvasShell,
    })),
  { ssr: false },
);

export function Hero3D() {
  return (
    <CanvasShellLazy fallback={<HeroFallback />}>
      <Scene />
    </CanvasShellLazy>
  );
}
