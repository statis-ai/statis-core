---
name: Landing Visual Polish
overview: "Four tasks to upgrade the Statis landing page: aurora background + noise overlay (T13), R3F hero glass-core polish (T14), bento grid primitives (T15), and wiring real brand assets (T16)."
todos:
  - id: t13-aurora-noise
    content: "T13: Add aurora gradient blobs (CSS keyframes + blur), noise overlay (SVG data-URI), update page.tsx stacking"
    status: completed
  - id: t14-glass-core
    content: "T14: Polish R3F hero — glass material tuning, drei Environment lighting, mouse-parallax camera, soft fog"
    status: completed
  - id: t15-bento-grid
    content: "T15: Refactor Primitives to bento grid layout, add animated border glow, icon hover swap (line/solid), staggered motion"
    status: completed
  - id: t16-brand-assets
    content: "T16: Create Navbar, wire all brand assets (favicon, og, hero-fallback, icons), update metadata"
    status: completed
isProject: false
---

# Statis Landing — Visual Polish (T13-T16)

---

## T13 — Aurora Background + Noise Overlay

**Goal:** Premium CSS-only background system layered behind all page content.

### Files to change

- [globals.css](landing/src/app/globals.css) — add aurora keyframes, noise overlay utility, and keep existing `.bg-grid`
- [page.tsx](landing/src/app/page.tsx) — wrap content with a background container div that stacks: aurora, noise, grid
- [Hero.tsx](landing/src/components/hero/Hero.tsx) — ensure the existing overlay gradient stays on top for text legibility

### Implementation

**Aurora blobs** — two or three absolutely-positioned `div`s with large `border-radius`, CSS `blur(80px+)`, and `@keyframes` that slowly drift position/opacity. Use the accent color (`#00ffc8`) at very low opacity (~0.06-0.10) plus a secondary hue (blue-violet ~`#4f46e5`at ~0.04). Define a`.aurora`container class in`globals.css`:

```css
.aurora {
  position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
}
.aurora__blob { position: absolute; border-radius: 50%; filter: blur(100px); will-change: transform, opacity; }
```

Two keyframes: `@keyframes auroraFloat1` and `auroraFloat2` — slow translate + opacity cycling over 15-25s.

**Noise overlay** — a tiny (200x200) repeating SVG `<feTurbulence>` noise baked as a data-URI background. Extremely low opacity (~0.03-0.05), `mix-blend-mode: overlay`, fixed position covering viewport. Define as `.noise-overlay` utility class.

**Grid** — already exists as `.bg-grid`. No changes needed.

**Stacking order in page.tsx:**

```
<div className="aurora">...blobs...</div>    /* fixed, z-0 */
<div className="noise-overlay" />              /* fixed, z-1 */
<main className="relative z-10 bg-grid">       /* page content */
```

**Hero overlay** — the existing gradient div in `Hero.tsx` (`from-brand-statist/40 via-transparent to-brand-statist`) already ensures text legibility; may increase from-opacity slightly if aurora makes it too bright.

---

## T14 — R3F Hero Glass Core Polish

**Goal:** Upgrade StatisHero 3D scene to match modern AI-site aesthetics.

### Files to change

- [StatisHero/materials.ts](landing/src/components/three/scenes/StatisHero/materials.ts) — tune glass/transmission material
- [StatisHero/index.tsx](landing/src/components/three/scenes/StatisHero/index.tsx) — add Environment, fog, mouse-parallax camera
- [StatisHero/constants.ts](landing/src/components/three/scenes/StatisHero/constants.ts) — add parallax sensitivity constant
- [CanvasShell.tsx](landing/src/components/three/CanvasShell.tsx) — minor: pass `fog` prop if needed

### Implementation

**Glass material tuning** in `materials.ts` — increase `transmission` to ~0.85, set `roughness` ~0.05, raise `thickness` ~1.0, set `ior` ~1.8, enable `clearcoat: 0.3`. This makes torus rings look like polished glass rather than translucent plastic.

**Studio lighting** in `index.tsx` — replace the two point lights with a drei `<Environment>` using a "studio" preset (or `"city"` for soft reflections) at low `environmentIntensity` (~0.4), plus one accent-colored `<pointLight>` for the mint glow. drei's Environment is already in `package.json` deps.

```tsx
import { Environment } from "@react-three/drei";
// inside JSX:
<Environment preset="studio" environmentIntensity={0.4} />
```

**Mouse-parallax camera** — a small `useMouseParallax` hook in `hooks.ts` that reads normalized mouse position (via `useThree` pointer) and applies a very subtle offset to a camera-wrapping group (not the camera itself, to avoid conflict with Canvas camera). Sensitivity ~0.3, lerped smoothly:

```tsx
useFrame(({ pointer }) => {
  if (!groupRef.current) return;
  groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.08, 0.05);
  groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.08, 0.05);
});
```

Wrap the entire scene content (core + particles) in this parallax group.

**Soft fog** — add `<fog attach="fog" args={['#0a0a0f', 5, 12]} />` to the scene root. This fades distant particles gently into the background.

**Performance guardrails** — no changes needed; DPR cap, mobile/reduced-motion guards already in CanvasShell.

---

## T15 — Bento Grid + Premium Motion

**Goal:** Refactor the Primitives section from a flat 2x2 grid into a bento layout with polished interactions.

### Files to change

- [Primitives.tsx](landing/src/components/sections/Primitives.tsx) — full refactor of grid layout and card rendering
- [card.tsx](landing/src/components/ui/card.tsx) — add animated border hover effect
- [globals.css](landing/src/app/globals.css) — add `@keyframes borderGlow` for animated border

### Implementation

**Bento layout** — use CSS Grid with `grid-template-columns` and `grid-row` spans:

- Top row: 2 large cards spanning equal width (Event Log + Materialized State)
- Bottom row: 2 narrower cards + or 1 wide + 1 narrow (Subscriptions + Replay)
- On mobile: single column stack

```
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

Card 1 ("Event Log") and Card 2 ("Materialized State") span `lg:col-span-1` each but are taller. Card 3 ("Subscriptions") spans `lg:col-span-2`, Card 4 ("Replay") spans `lg:col-span-1`. This gives the asymmetric bento look.

**Animated border** — a `@keyframes borderGlow` that rotates a conic-gradient behind the card border. Implemented via a pseudo-element (`::before`) with `background: conic-gradient(...)` rotating on hover. Lightweight CSS only.

**Icon swap on hover** — load both `-line` and `-solid` SVG variants as `<img>` tags; show line by default, swap to solid on group-hover via Tailwind `group-hover:opacity-0` / `group-hover:opacity-100` with transition.

**Staggered Framer Motion** — already using `<Reveal delay={i * 0.1}>`, increase stagger to `i * 0.12` and add `whileHover` scale(1.02) on the card wrapper.

---

## T16 — Wire Real Brand Assets

**Goal:** Point all image/icon references to the real files now in `public/`.

### Files to change

- [layout.tsx](landing/src/app/layout.tsx) — update `icons` metadata
- [Hero.tsx](landing/src/components/hero/Hero.tsx) or [HeroFallback.tsx](landing/src/components/hero/HeroFallback.tsx) — use `/hero-fallback.png`
- [Footer.tsx](landing/src/components/sections/Footer.tsx) — already uses `/statis-mark.svg` (correct)
- [Primitives.tsx](landing/src/components/sections/Primitives.tsx) — switch from inline SVG to `<img>` loading from `/icons/icon-*-line.svg` and `/icons/icon-*-solid.svg`
- [page.tsx](landing/src/app/page.tsx) — add a Navbar component above Hero
- **New file:** `src/components/sections/Navbar.tsx`

### Specific changes

**Navbar** — create a fixed-top transparent navbar with:

- Left: `<img src="/statis-mark.svg">` (or `/statis-wordmark-dot.svg` on wider screens)
- Right: minimal nav links (Docs, GitHub) + a primary CTA button
- Glassmorphism background that becomes more opaque on scroll (use a `"use client"` scroll listener or Tailwind `backdrop-blur`)
- Add to `page.tsx` above `<Hero />`

**Metadata in layout.tsx:**

```tsx
icons: {
  icon: "/favicon.ico",
  apple: "/icon-512.png",
},
```

**HeroFallback** — add an `<img src="/hero-fallback.png">` as the background of the fallback div (shown on mobile / reduced-motion). Keep the existing radial gradients as an overlay on top.

**Primitives icons** — replace the `PrimitiveIcon` inline SVG switch statement with `<img>` elements that load from `/icons/icon-{name}-line.svg` (default) and `/icons/icon-{name}-solid.svg` (hover). This pairs with T15's hover swap logic.

**Assets present in `public/`:**


| Asset                   | Path                     | Wired to                             |
| ----------------------- | ------------------------ | ------------------------------------ |
| statis-mark.svg         | /statis-mark.svg         | Navbar logo, Footer logo             |
| statis-wordmark-dot.svg | /statis-wordmark-dot.svg | Navbar wide variant                  |
| favicon.ico             | /favicon.ico             | layout.tsx icons.icon                |
| icon-512.png            | /icon-512.png            | layout.tsx icons.apple               |
| og.png                  | /og.png                  | layout.tsx openGraph (already wired) |
| hero-fallback.png       | /hero-fallback.png       | HeroFallback.tsx                     |
| banner.png              | /banner.png              | Available for future use             |
| icon-*-line.svg         | /icons/icon-*-line.svg   | Primitives default                   |
| icon-*-solid.svg        | /icons/icon-*-solid.svg  | Primitives hover                     |


