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


## Autenticación y tipos de cuenta

El registro se bifurca por **intención**, no por un selector de tipo de usuario:

| Ruta | Formulario | Endpoint | Resultado |
|---|---|---|---|
| `/login?type=r` | `auth/RegisterCustomerForm.vue` | `POST /auth/register-customer` | Comensal. 4 campos, **queda con sesión iniciada** |
| `/login?type=r&intent=negocio` | `auth/RegisterForm.vue` | `POST /auth/register-owner` | Dueño. Confirma correo antes de entrar |

`app/pages/login.vue` maneja cuatro modos: `login`, `register` (comensal),
`register-owner`, `forgot`. La pestaña "Registrarse" cubre los dos modos de alta y no
te saca del que ya elegiste; cada formulario tiene un enlace al otro.

**Los roles son niveles acumulativos**, no tipos excluyentes: `Authenticated` (comensal)
⊂ `BusinessOwner`. Un comensal que publica un negocio es ascendido por el backend en ese
momento; por eso `negocios/nuevo.vue` llama a `refreshUser()` después de crear — la copia
del usuario en cookie trae el rol viejo.

`useApi()` **no manda el JWT**: las lecturas públicas van como rol `Public`. Todo lo
autenticado usa `$fetch` con `Authorization` explícito (ver `useMenuEdit`, `useNegocioCreate`).

## Cartelera del municipio (eventos y avisos)

Cara pública del content-type `city-post` del backend. La captura es **solo del panel
admin**: aquí no hay formularios ni endpoints de escritura.

| Ruta | Archivo |
|---|---|
| `/[city]/eventos` (+ `?pasados=1`) | `pages/[city]/eventos/index.vue` |
| `/[city]/eventos/[slug]` | `pages/[city]/eventos/[slug].vue` |

Piezas: `composables/useEventos.js` (listado + `queryEventos()` reutilizable),
`utils/fechas.js` (formateo), `utils/eventos.js` (etiquetas), `mapCityPost()` en
`utils/strapi.js`, `buildEventJsonLd()` en `utils/seo.js`, y los componentes
`event/EventCard.vue` (tarjeta del grid) y `event/EventHero.vue` (bloque protagonista).

**El hero es el primer resultado cuando trae `isFeatured`**, sin una segunda consulta: el
sort del composable (`isFeatured:desc,featuredOrder:asc,startAt:asc`) ya pone al frente al
destacado con el `featuredOrder` más bajo. Solo aparece en la página 1 de la vista vigente,
y se saca del grid para que no salga dos veces. Si el municipio no fijó nada, no hay hero.
`EventHero` esconde cada bloque cuyo campo venga vacío — no rellenar el diseño con texto
inventado: todo lo que muestra sale de un campo real de `city-post`.

**`eventos` es un slug reservado.** Nuxt prioriza el segmento estático, así que
`/[city]/eventos` le gana al dispatcher `pages/[city]/[slug].vue` y un negocio o categoría
con ese slug exacto sería inalcanzable. `RESERVED_CITY_SUB_PATHS` (`utils/urls.js`) existe
para que el sitemap no emita esa URL; agregar ahí cualquier subruta estática nueva de
`/[city]/`.

**Las fechas se formatean con `timeZone` explícito**, nunca con el reloj del proceso: esto
corre en SSR, donde el servidor va en UTC. `noche-de-mariachi` se guarda como
`2026-09-22T02:00:00.000Z` y en Jalisco es el **21** a las 20:00. Misma razón que
`utils/horario.js`. Por eso tampoco hay "Hoy"/"Mañana": dependerían del instante del render
y podrían no coincidir al hidratar.

**`postStatus` no se manda en las queries.** El controller del backend lo fuerza a
`published` pisando lo que venga del cliente.

**`businesses` se mapea ligero** (`mapNegocioLigero`), no con `mapNegocio()`: el populate
viene acotado con `fields`, así que `mapNegocio` devolvería un objeto con casi todo en
`null`. Y siempre acotar `populate[businesses][fields]` — sin eso Strapi devuelve el negocio
completo por cada evento de la lista.

**Un `kind: 'aviso'` no lleva JSON-LD de `Event`** (`buildEventJsonLd` devuelve `null`):
marcar un corte de agua como evento es spam de datos estructurados para Google.

**La canónica de un evento no depende del municipio desde el que se abre.** `eventUrl(post)`
sin override da la canónica (los regionales caen a `/jalisco/...`); con override los enlaces
visibles se quedan dentro de la cartelera que el visitante está viendo. Los datos
estructurados usan siempre la canónica.

**Las páginas validan el municipio de la URL y lanzan 404** si no existe — incluida la ficha,
donde un evento regional haría que `/municipioinventado/eventos/[slug]` respondiera 200. Un
soft-404 (200 con página vacía) es, para Google, una página válida y sin contenido.

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