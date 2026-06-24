# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Build for production
npm run generate   # Static site generation
npm run preview    # Preview production build
```

No linter or test runner is configured yet.

## Architecture

**Nuxt 3** app with `srcDir: 'app/'` — all application code lives under `app/`, not the project root.

**Key config files at root level:**
- `nuxt.config.ts` — modules, runtimeConfig, Tailwind path overrides
- `tailwind.config.ts` — custom color palette and fonts (referenced by Nuxt via `configPath: '~/../../tailwind.config.ts'`)

**Layouts** (`app/layouts/`):
- `landing.vue` — public-facing layout with the main navbar (Headless UI Popover + mobile Dialog)
- `default.vue` — base layout for authenticated/internal pages

Pages declare their layout via `definePageMeta({ layout: 'landing' })`.

**API layer** (`app/composables/useApi.ts`):
- Thin wrapper around Nuxt's `useFetch`
- Base URL comes from `NUXT_PUBLIC_API_BASE` env var (defaults to `http://localhost:1337/api` — a Strapi backend)
- Only exposes `get<T>(path, query?)` for now

**Styling:**
- Tailwind v3 via `@nuxtjs/tailwindcss`
- All custom colors are under the `brand` namespace: use `bg-brand-primary`, `text-brand-text`, etc. — never bare `bg-primary-*`
- Global CSS entry: `app/assets/css/main.css` — defines `@layer base` (font/color defaults) and `@layer components` (`.btn-primary`, `.btn-secondary`, `.card`, `.chip`)
- Fonts: **Fraunces** (headings / `font-display`) and **Inter** (body / `font-body`) loaded from Google Fonts

**UI component libraries:**
- `@headlessui/vue` — accessible primitives (Popover, Dialog, Disclosure, etc.)
- `@heroicons/vue` — icons (24/outline for larger icons, 20/solid for inline/small icons)

**State management:** Pinia (`@pinia/nuxt`) — stores live in `app/stores/` (empty at project start).

**Image handling:** `@nuxt/image` module. Static assets (logos, SVGs) are in `public/` and referenced with root-relative paths like `/logo-cielo-horizontal.svg`.
