# Statis Landing — TASKS (PR-sized Tickets)

> Goal: build a premium Statis landing page with an R3F hero that tells the product story.
> Follow statis_landing.md as source of truth. Do not invent product claims.
> If you need a missing file path or command, search the repo first. Do not guess.

---

## T0 — Repo sanity + wiring (smallest PR)
**Objective**
- Confirm landing app runs locally and has baseline layout.

**Tasks**
- Ensure Next.js App Router boots
- Add `AGENTS.md` (source of truth) to landing folder
- Add this `TASKS.md`

**Acceptance**
- `dev` runs without errors
- Home route renders a placeholder hero section

---

## T1 — Design tokens + global styling
**Objective**
- Establish Statis theme system (dark statist + accent) used everywhere.

**Tasks**
- Create `src/brand.ts` exporting tokens:
  - colors: background/surface/border/accent/success/warn
  - typography scale + radii + shadows + motion durations
- Wire CSS variables in `globals.css`
- Extend Tailwind theme to use CSS variables
- Add subtle grid background utility (CSS or Tailwind class)

**Acceptance**
- Background is “dark statist”
- Cards can use a consistent “glass” style
- No hardcoded random colors in components (use tokens)

---

## T2 — Landing page skeleton (no 3D yet)
**Objective**
- Build full landing structure with real sections (content can be minimal placeholders).

**Tasks**
- Implement sections:
  1) Hero (copy + CTAs; placeholder image block)
  2) Problem strip
  3) 4 Primitives (cards)
  4) How it works (4 steps)
  5) Demo/Screens (placeholder)
  6) SDK Quickstart (TS + Python snippet blocks; placeholder ok)
  7) Footer
- Use shadcn/ui for cards/buttons
- Use Framer Motion for subtle scroll reveals (no excessive motion)

**Acceptance**
- All sections render responsively
- CTAs visible above the fold
- Layout looks premium even without 3D

---

## T3 — Hero component + overlay + fallback wiring
**Objective**
- Build the Hero components structure and mobile fallback behavior.

**Tasks**
- Create:
  - `src/components/hero/Hero.tsx`
  - `src/components/hero/HeroCopy.tsx`
  - `src/components/hero/HeroFallback.tsx`
- Add `public/hero-fallback.png` placeholder (simple gradient image is fine for now)
- Hero should:
  - render copy + CTAs on top
  - include a gradient overlay to ensure text legibility

**Acceptance**
- Hero has strong readability over background
- Mobile shows fallback image container (even before WebGL is added)

---

## T4 — CanvasShell (performance + safety)
**Objective**
- Create a safe, reusable R3F canvas wrapper.

**Tasks**
- Create `src/components/three/CanvasShell.tsx` (client-only)
- Requirements:
  - cap DPR to <= 1.5
  - pause animation when tab hidden (Page Visibility API)
  - respect `prefers-reduced-motion` (disable animation / don’t mount Canvas)
  - disable WebGL on small screens (e.g., < 768px) and show fallback
  - no heavy postprocessing
- Add small util helpers under `src/components/three/utils/` if needed

**Acceptance**
- On small screens: no Canvas mounted
- With reduced-motion: no Canvas mounted
- No SSR errors

---

## T5 — StatisHero scene v0 (Strata core only)
**Objective**
- Implement the “Statis Strata” core with slow drift.

**Tasks**
- Create scene folder:
  - `src/components/three/scenes/StatisHero/index.tsx`
  - `constants.ts`, `materials.ts`, `hooks.ts`
- Implement:
  - layered circular core (stack of thin rings/torus/discs)
  - translucent/glassy look (simple MeshPhysicalMaterial; no textures)
  - slow drift rotation and subtle breathing scale

**Acceptance**
- Scene renders consistently across refresh
- Motion is subtle and premium (no chaotic movement)
- GPU load stays reasonable (avoid excessive poly count)

---

## T6 — StatisHero scene v1 (events + impact)
**Objective**
- Add “event particles” flowing into the core and causing subtle layer shift.

**Tasks**
- Add particles:
  - flow toward the core along a gentle spiral
  - use Points or instanced small spheres (keep it light)
- On near-core contact:
  - trigger small wobble/shift on strata layers (impact response)

**Acceptance**
- You can clearly see particles moving in
- Impacts cause subtle, satisfying response
- Still performant (no thousands of heavy meshes)

---

## T7 — StatisHero scene v2 (crystallize pulse + replay ripple)
**Objective**
- Add two signature beats to tell the Statis story visually.

**Tasks**
- “Crystallize” pulse:
  - every ~3–6 seconds: short pulse (tighten/brighten core)
- “Replay” ripple:
  - every ~10–14 seconds: brief reverse ripple illusion
- Ensure timing is not too mechanical (use slight randomness)

**Acceptance**
- Pulse and ripple are noticeable but tasteful
- No flashing / harsh brightness
- Reduced-motion still disables animation

---

## T8 — Integrate Hero3D with dynamic import
**Objective**
- Wire 3D scene into Hero without SSR issues.

**Tasks**
- Create `src/components/hero/Hero3D.tsx` that:
  - dynamically imports the R3F scene with `ssr:false`
  - uses CanvasShell
  - falls back to HeroFallback when disabled
- Plug into `Hero.tsx`

**Acceptance**
- No SSR errors
- Hero renders immediately; 3D loads progressively on desktop
- Mobile uses fallback image

---

## T9 — 4 primitive icons + primitives section polish
**Objective**
- Add iconography and tighten the “4 primitives” section.

**Tasks**
- Add icons as React components or SVGs under `public/icons/`
- Ensure the 4 primitives section matches product language from AGENTS.md
- Add micro-interactions (hover glow/border) using tokens

**Acceptance**
- Icons consistent stroke/size
- Primitives read clearly and match Statis message

---

## T10 — Demo + SDK Quickstart blocks
**Objective**
- Make the landing actionable even with placeholders.

**Tasks**
- Demo/Screens section:
  - add a styled screenshot frame placeholder (no fake UI details)
- SDK Quickstart:
  - TS snippet block (pseudo, minimal)
  - Python snippet block (pseudo, minimal)
- Add copy that does not invent capabilities

**Acceptance**
- Snippets are clearly labeled as examples
- No invented endpoints/features

---

## T11 — Performance + accessibility pass
**Objective**
- Final polish pass: ensure premium feel without regressions.

**Tasks**
- Confirm:
  - reduced-motion path
  - mobile fallback
  - text contrast
  - no console warnings
- Add basic metadata:
  - `og.png` placeholder
  - title/description in Next.js metadata
- Optional: add lightweight analytics hook (only if already in repo)

**Acceptance**
- Lighthouse is reasonable (avoid big regressions)
- No obvious layout shifts
- Page feels fast and calm

---

## T12 — Deploy readiness
**Objective**
- Ensure Vercel build works reliably.

**Tasks**
- Confirm build command + output
- Ensure no dev-only dependencies required at runtime
- Document env vars if any (ideally none)

**Acceptance**
- `build` succeeds in CI
- Preview deploy works

---

## Optional Enhancements (only after T0–T12)
- Scroll-reactive hero (very subtle)
- “Time scrubber” micro UI under hero (non-functional visual)
- Export hero loop video for socials
