# Statis Landing Page

Marketing landing page for [statis.dev](https://statis.dev) — the base layer for reliable AI state.

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **TailwindCSS** v3 + dark theme tokens
- **shadcn/ui** components (Button, Card)
- **Framer Motion** scroll reveal animations
- **React Three Fiber** (`@react-three/fiber`, `three`, `@react-three/drei`) for the 3D hero scene

## Getting Started

```bash
cd landing
npm install
npm run dev
```

The dev server starts at `http://localhost:3000` (or next available port).

## Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
  app/              # Next.js App Router (page.tsx, layout.tsx, globals.css)
  brand.ts          # Design tokens
  lib/utils.ts      # Utility functions (cn)
  components/
    hero/           # Hero section (Hero3D, HeroCopy, HeroFallback)
    sections/       # Page sections (Primitives, HowItWorks, SDKQuickstart, etc.)
    three/          # R3F 3D code
      CanvasShell.tsx
      scenes/StatisHero/   # 3D hero scene (strata core, particles, effects)
      utils/perf.ts        # Performance hooks (reduced-motion, visibility)
    ui/             # Shared UI components (Button, Card, Reveal)
public/
  icons/            # Section icons (SVG)
  statis-mark.svg   # Brand mark
  statis-wordmark.svg
```

## Environment Variables

None required.

## Deployment

Vercel-ready. `npm run build` produces a standalone output. No runtime-only env vars needed.
