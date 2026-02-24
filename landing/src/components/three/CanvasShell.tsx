"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { type ReactNode, useEffect } from "react";
import {
  useReducedMotion,
  useIsSmallScreen,
  usePageVisible,
} from "./utils/perf";

function PauseControl() {
  const visible = usePageVisible();
  const invalidate = useThree((s) => s.invalidate);
  const set = useThree((s) => s.set);

  useEffect(() => {
    set({ frameloop: visible ? "always" : "never" });
    if (visible) invalidate();
  }, [visible, invalidate, set]);

  return null;
}

interface CanvasShellProps {
  children: ReactNode;
  fallback: ReactNode;
}

export function CanvasShell({ children, fallback }: CanvasShellProps) {
  const reducedMotion = useReducedMotion();
  const smallScreen = useIsSmallScreen();

  if (reducedMotion || smallScreen) {
    return <>{fallback}</>;
  }

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <PauseControl />
      {children}
    </Canvas>
  );
}
