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

## Language

No TypeScript. All new files use plain JavaScript: composables and stores as `.js`, `<script setup>` without `lang="ts"`. The existing `useApi.ts` is the only `.ts` file and stays as-is.

## Project structure

```
frontend/
├── nuxt.config.ts          # Modules, runtimeConfig, srcDir
├── tailwind.config.ts      # Brand palette and custom fonts
└── app/
    ├── app.vue
    ├── assets/css/main.css # @layer base + @layer components (.btn-primary, .card, .chip…)
    ├── layouts/
    │   ├── landing.vue     # Public layout: navbar + footer (Headless UI)
    │   └── default.vue     # Minimal base layout
    ├── pages/
    │   ├── index.vue       # Landing: hero search, featured businesses, categories, carousels
    │   ├── list.vue        # Search results with filters and pagination
    │   └── negocios/
    │       └── [slug].vue  # Business profile (dynamic, connected to useNegocio)
    ├── components/
    │   ├── business/       # BusinessCardFeatured, BusinessCardCompact, BusinessCardList,
    │   │                   # BusinessAvatar, BusinessOpenBadge, BusinessContactSidebar
    │   ├── category/       # CategoryCard, CategoryRow, CategoryPill
    │   ├── ui/             # StarRating, AppPagination, AppToggle, AppBreadcrumb, NetworkPattern
    │   └── layout/         # AppNavbar, AppFooter
    ├── composables/
    │   ├── useApi.js       # Base: thin useFetch wrapper (do not modify)
    │   ├── useNegocios.js  # Paginated business list with filters → Strapi /negocios
    │   ├── useNegocio.js   # Single business by slug → Strapi /negocios?filters[slug]
    │   └── useCategorias.js# All categories → Strapi /categorias
    ├── stores/
    │   └── search.js       # Pinia: search query, category, filters, pagination (persists across nav)
    └── utils/
        ├── strapi.js       # mapNegocio(), mapCategoria(), mapHorario(), mapMedia()
        └── categorias.js   # CATEGORIA_CONFIG map + getCategoriaConfig(slug)
```

## Architecture

**Nuxt 3** app with `srcDir: 'app/'` — all application code lives under `app/`, not the project root.

**Backend:** Strapi at `http://localhost:1337/api` (set via `NUXT_PUBLIC_API_BASE` env var).

**Key config files at root level:**
- `nuxt.config.ts` — modules, runtimeConfig, Tailwind path overrides
- `tailwind.config.ts` — custom color palette and fonts (referenced by Nuxt via `configPath: '~/../../tailwind.config.ts'`)

**Routing:**
- `/` → `index.vue`
- `/list` → `list.vue`
- `/negocios/[slug]` → `negocios/[slug].vue` (e.g. `/negocios/tacos-el-guero`)

Pages declare their layout via `definePageMeta({ layout: 'landing' })`.

**API layer:**
- `useApi.js` — base composable, wraps `useFetch`. Do not call it directly from pages.
- `useNegocios.js`, `useNegocio.js`, `useCategorias.js` — domain composables built on top of `useApi`.
- `utils/strapi.js` — mapper functions that flatten Strapi's `{ data: [{ id, attributes }] }` envelope into plain objects.

**State management:** `stores/search.js` (Pinia) holds search filters. Pages read from the store; the `SearchBar` writes to it. Filters persist when navigating from list → detail → back.

**Styling:**
- Tailwind v3 via `@nuxtjs/tailwindcss`
- All custom colors are under the `brand` namespace: use `bg-brand-primary`, `text-brand-text`, etc. — never bare `bg-primary-*`
- Global CSS entry: `app/assets/css/main.css` — defines `@layer base` (font/color defaults) and `@layer components` (`.btn-primary`, `.btn-secondary`, `.card`, `.chip`)
- Fonts: **Fraunces** (headings / `font-display`) and **Inter** (body / `font-body`) loaded from Google Fonts

**Icons:** `@lucide/vue` only. Do not use `@heroicons/vue`.

**UI component libraries:**
- `@headlessui/vue` — accessible primitives (Popover, Dialog, Disclosure, etc.)
- `@lucide/vue` — all icons across the entire app

**Image handling:** `@nuxt/image` module. Static assets (logos, SVGs) are in `public/` and referenced with root-relative paths like `/logo-cielo-horizontal.svg`.


## Reglas de Código Específicas del Proyecto

### Reactividad en Nuxt 3 / Vue 3 (JavaScript)
Siempre que generes, edites o revises código de Vue/Nuxt, aplica estrictamente estas reglas de desempaquetado:

1. **Uso de `.value` (Solo en `<script setup>`)**:
   - Obligatorio para leer/escribir variables creadas con `ref()` o `computed()`.
   - Ejemplo: `const count = ref(0); count.value++;`

2. **Prohibido usar `.value`**:
   - En el `<template>` (Vue lo desempaqueta automáticamente). Ejemplo: `<p>{{ count }}</p>`.
   - Con objetos creados mediante `reactive()`. Ejemplo: `state.user = 'Ana';`.
   - Con propiedades de `defineProps()`. Ejemplo: `console.log(props.title);`.

3. **Composables de Nuxt**:
   - Al desestructurar `useFetch`, la propiedad `data` es un ref. Usa `data.value`.