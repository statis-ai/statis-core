# Statis Landing — Agent Operating Base (Monorepo)

## Purpose
Build and maintain the **Statis** marketing landing page (modern AI infra aesthetic) with a **code-controlled R3F 3D hero** that visually communicates:
**append-only semantic events → deterministic materialized state → push subscriptions → replay/time travel**.

This folder is the source of truth for landing page implementation details.  
If anything here conflicts with other docs, **this file wins for landing work**.

---

## Product / Brand
**Name:** Statis  
**Visual metaphor:** bedrock / base layer / strata  
**Hero concept (locked):** **Statis Strata**
- A circular, layered translucent core (“strata”)
- Particles flow in (events)
- Subtle layer shift on impact (ingest/commit)
- Pulse “crystallizes” (materialized state)
- Occasional rewind ripple (replay)

**Copy (default)**
- Headline: **“Statis is the base layer for reliable AI state.”**
- Subhead: **“Append-only semantic events → deterministic materialized state → push updates + replay for audit.”**
- Primary CTA: **View Demo**
- Secondary CTA: **Read the Spec**

---

## Tech Stack (DO NOT SUBSTITUTE)
- Next.js (App Router) + TypeScript
- TailwindCSS
- shadcn/ui components
- Framer Motion (scroll reveals)
- R3F: `@react-three/fiber`, `three`, `@react-three/drei`
- No heavy postprocessing. No shader toy dependencies unless explicitly added later.

---

## Hard Rules (Anti-hallucination)
1. **Do not invent** APIs, endpoints, pricing, customers, integrations, or benchmarks.
2. **Do not create** new packages unless explicitly instructed.
3. **Do not add** heavy WebGL effects (postprocessing, bloom chains, HDRI packs) unless requested.
4. **Respect performance:** hero must not block page interactivity.
5. **Respect accessibility:** supports `prefers-reduced-motion`, and provides a static fallback on mobile/small screens.
6. **Avoid SSR issues:** all R3F canvas code must be client-only and dynamically imported.

If something is missing, implement the simplest placeholder that matches the contract in this file.

---

## Monorepo Placement
This doc lives inside the landing app folder, e.g.
- `apps/landing/AGENTS.md`

Assume the landing app is built and deployed independently (Vercel-friendly).

---

## Folder Structure (Create/Use This)
Place all 3D code under `src/components/three` and keep normal UI separate.

src/
  app/
    page.tsx
    layout.tsx
  components/
    hero/
      Hero.tsx
      HeroCopy.tsx
      HeroFallback.tsx
    three/
      CanvasShell.tsx
      scenes/
        StatisHero/
          index.tsx
          constants.ts
          materials.ts
          hooks.ts
      utils/
        perf.ts
        math.ts
public/
  hero-fallback.png
  og.png
  icons/
    icon-log.svg
    icon-state.svg
    icon-subscribe.svg
    icon-replay.svg

---

## 3D Implementation Contract (StatisHero)
### Scene behavior
- “Statis Strata” circular layered core:
  - Build from stacked rings/torus meshes or instanced thin discs
  - Translucent/glassy material look (subtle)
- Event particles:
  - Flow toward core along a gentle spiral
  - On near-core contact: trigger a small “impact shift” (layer wobble)
- Crystallize pulse:
  - Every ~3–6 seconds: a short pulse that tightens the core (scale/opacity/roughness change)
- Replay ripple:
  - Every ~10–14 seconds: a brief reverse ripple (slight time reversal illusion)

### Performance & safety requirements
- Cap DPR <= **1.5**
- Pause animation when tab is hidden
- Disable WebGL for:
  - small screens (choose a breakpoint like `< 768px`)
  - `prefers-reduced-motion: reduce`
  - low-power / save-data signals if available
- Use a static fallback: `/public/hero-fallback.png`
- Avoid large textures. Prefer procedural/simple materials.
- No postprocessing pipeline.

### Next.js requirements
- R3F scene must be `"use client"`
- Import scene via `dynamic(() => import(...), { ssr: false })`

---

## Landing Page Sections (Structure)
1. Hero (3D + headline + CTAs)
2. Problem strip (short)
3. 4 Primitives (cards)
   - Append-only semantic event log
   - Materialized state view
   - Subscriptions + guardrails
   - Replay + time machine
4. How it works (4 steps)
5. Demo / Screens (placeholder ok)
6. SDK Quickstart (TS + Python snippets; placeholder ok)
7. Footer

---

## Design System (Theme Tokens)
### Visual style
- Dark statist background
- Glass cards (subtle blur + border)
- One accent color (electric mint/cyan)
- Thin grid background
- Soft glow highlights
- Slow, calm motion

### Token ownership
Define tokens in:
- `src/brand.ts` (export constants)
- `globals.css` (CSS variables)
- `tailwind.config.*` (theme extension)

---

## Assets Checklist (Don’t invent names; use these)
Brand:
- `public/statis-mark.svg`
- `public/statis-wordmark.svg`
- `public/icon-512.png`
- `public/favicon.ico`
- `public/og.png` (1200×630)

Landing visuals:
- `public/hero-fallback.png`
- `public/render-log.png`
- `public/render-state.png`
- `public/render-replay.png`

---

## Acceptance Criteria (Definition of Done)
### Functional
- Landing renders with no console errors
- Hero loads on desktop, uses fallback on mobile/reduced-motion
- All sections present and responsive
- Icons render correctly

### Performance
- Hero does not block initial interaction
- No heavy GPU effects
- Reasonable Lighthouse (don’t chase perfect; avoid obvious regressions)

### Accessibility
- `prefers-reduced-motion` disables animation + shows fallback
- Text contrast readable over hero (add overlay gradient)

---

## Default Commands (Update if repo differs)
- Dev: `pnpm dev` (or `npm run dev`)
- Build: `pnpm build`
- Lint: `pnpm lint`

If the repo uses different commands, update this file rather than guessing.

---

## Work Plan (Execute in Order)
[ ] Create theme tokens (`brand.ts`, `globals.css`, tailwind config)  
[ ] Build landing layout + sections without 3D  
[ ] Add Hero with fallback + overlay  
[ ] Add CanvasShell (DPR cap, pause on hidden, reduced-motion)  
[ ] Implement StatisHero “Strata” scene  
[ ] Add 4 primitive icons  
[ ] Add placeholders for demo + quickstart  
[ ] Verify responsiveness + perf safeguards

---

## Notes for Agents
- Keep changes small and reviewable.
- Prefer simple geometry and clear motion over complex effects.
- When uncertain, implement a minimal version that satisfies the contracts above.
- Do not alter product positioning/copy beyond what’s specified unless asked.