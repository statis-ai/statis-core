# Statis Landing — Agent Operating Base

## Purpose
Build and maintain the **Statis** marketing landing page with the same architecture and R3F requirements defined for the landing app.

If this file conflicts with other landing docs, this file is the source of truth for landing work.

## Product / Brand
- **Name:** Statis
- **Domain:** `statis.dev`
- **Hero concept (locked):** **Statis Strata**
- **Headline:** “Statis is the base layer for reliable AI state.”
- **Subhead:** “Append-only semantic events → deterministic materialized state → push updates + replay for audit.”
- **Primary CTA:** View Demo
- **Secondary CTA:** Read the Spec

## Hard Rules
1. Do not invent APIs, endpoints, pricing, customers, integrations, or benchmarks.
2. Do not add new packages unless explicitly requested.
3. Do not add heavy WebGL effects or postprocessing pipelines.
4. Respect performance; hero must not block interactivity.
5. Respect accessibility (`prefers-reduced-motion`, static fallback).
6. Avoid SSR issues; R3F must be client-only and dynamically imported.

## Folder Structure Contract
- `src/components/hero/*` for hero UI
- `src/components/three/CanvasShell.tsx`
- `src/components/three/scenes/StatisHero/{index.tsx,constants.ts,materials.ts,hooks.ts}`
- `src/components/three/utils/*`

## 3D Contract (StatisHero)
- Layered circular translucent core (“Statis Strata”)
- Event particles spiral inward
- Subtle impact shift on near-core contact
- Crystallize pulse every ~3–6s
- Replay ripple every ~10–14s

## Performance + Safety
- Cap DPR <= 1.5
- Pause animation when tab hidden
- Disable WebGL on small screens and reduced-motion
- Use static fallback at `public/hero-fallback.png`
- No heavy textures, no postprocessing

## Assets Checklist
- `public/statis-mark.svg`
- `public/statis-wordmark.svg`
- `public/icon-512.png`
- `public/favicon.ico`
- `public/og.png`
- `public/hero-fallback.png`
