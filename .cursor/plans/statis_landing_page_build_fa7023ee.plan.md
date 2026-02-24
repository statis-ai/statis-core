---
name: Statis Landing Page Build
overview: Build the complete Statis marketing landing page (statis.dev) from scratch inside the `landing/` folder — a standalone Next.js App Router app with TailwindCSS, shadcn/ui, Framer Motion scroll reveals, and an R3F 3D hero scene ("Statis Strata"), following the 13-ticket plan in tasks.md.
todos:
  - id: t0-repo-setup
    content: "T0: Initialize Next.js App Router app in landing/, install all deps (three, R3F, framer-motion, shadcn/ui), add AGENTS.md, confirm dev boots"
    status: completed
  - id: t1-design-tokens
    content: "T1: Create brand.ts, globals.css vars, tailwind.config.ts theme extension, grid bg + glass-card utilities"
    status: completed
  - id: t2-page-skeleton
    content: "T2: Build all 7 landing sections (Hero placeholder, Problem strip, 4 Primitives, How it works, Demo placeholder, SDK Quickstart, Footer) with shadcn/ui + Framer Motion scroll reveals"
    status: completed
  - id: t3-hero-component
    content: "T3: Create Hero.tsx, HeroCopy.tsx, HeroFallback.tsx, hero-fallback.png placeholder, gradient overlay for text legibility"
    status: completed
  - id: t4-canvas-shell
    content: "T4: Create CanvasShell.tsx with DPR cap, tab-visibility pause, reduced-motion guard, small-screen guard, and perf utility hooks"
    status: completed
  - id: t5-strata-core
    content: "T5: Implement StatisHero scene v0 — layered torus/ring strata with glassy material, slow drift rotation, breathing scale"
    status: completed
  - id: t6-events-impact
    content: "T6: Add event particles flowing inward on spiral + impact wobble on strata layers on contact"
    status: completed
  - id: t7-crystallize-replay
    content: "T7: Add crystallize pulse (3-6s interval) and replay ripple (10-14s interval) with slight randomness"
    status: completed
  - id: t8-hero3d-integration
    content: "T8: Create Hero3D.tsx with dynamic import (ssr:false), wire into Hero.tsx, verify no SSR errors"
    status: completed
  - id: t9-icons-polish
    content: "T9: Create 4 primitive SVG icons, wire into cards, add hover glow micro-interactions"
    status: completed
  - id: t10-demo-sdk
    content: "T10: Build demo browser-frame placeholder + SDK Quickstart with TS/Python tabbed code snippets"
    status: completed
  - id: t11-perf-a11y
    content: "T11: Accessibility/performance pass — reduced-motion, contrast, metadata, og.png, favicon, Lighthouse check"
    status: completed
  - id: t12-deploy
    content: "T12: Verify build succeeds, no runtime dev deps, add README.md, Vercel-ready"
    status: completed
isProject: false
---

# Statis Landing Page — Full Build Plan

Reference: [statis_landing.md](landing/statis_landing.md) (source of truth), [tasks.md](landing/tasks.md) (ticket breakdown).

---

## T0 — Repo Sanity + Wiring (DONE)

## T1 — Design Tokens + Global Styling (DONE)

## T2 — Landing Page Skeleton (No 3D)

**Goal:** All 7 sections rendered with real structure, responsive, premium-feeling even without 3D.

## T3 — Hero Component + Overlay + Fallback

**Goal:** Dedicated Hero component structure with mobile fallback.

## T4 — CanvasShell (Performance + Safety)

**Goal:** Reusable R3F canvas wrapper with all safety guards.

- Create `src/components/three/CanvasShell.tsx` ("use client")
- Cap DPR to 1.5, pause on tab hidden, respect `prefers-reduced-motion`, disable WebGL < 768px
- Create `src/components/three/utils/perf.ts` helper hooks

## T5 — StatisHero Scene v0 (Strata Core)

**Goal:** The layered circular "Strata" core with slow drift.

- Create folder: `src/components/three/scenes/StatisHero/`
- `constants.ts`, `materials.ts`, `hooks.ts`, `index.tsx`

## T6 — StatisHero Scene v1 (Events + Impact)

**Goal:** Particle flow toward core with impact response.

## T7 — StatisHero Scene v2 (Crystallize + Replay)

**Goal:** Two signature visual beats on timers.

## T8 — Integrate Hero3D with Dynamic Import

**Goal:** Wire 3D into the Hero without SSR issues.

- Create `src/components/hero/Hero3D.tsx` with `dynamic(..., { ssr: false })`
- Uses CanvasShell + StatisHero scene, falls back to HeroFallback

## T9 — Primitive Icons + Section Polish

**Goal:** Iconography and visual polish for the 4 Primitives section.

## T10 — Demo + SDK Quickstart Blocks

**Goal:** Actionable placeholder content for demo and code sections (Statis branding, `@statis/sdk`).

## T11 — Performance + Accessibility Pass

**Goal:** Final quality pass.

## T12 — Deploy Readiness

**Goal:** Clean Vercel-deployable build.
