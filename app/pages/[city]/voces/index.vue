<script setup>
import { Mic, ChevronLeft, ChevronRight } from '@lucide/vue'
import { FALLBACK_CITY_SLUG, creatorUrl } from '~/utils/urls'
import { buildBreadcrumbJsonLd, serializeJsonLd } from '~/utils/seo'
import { queryCreadores, VOCES_PAGE_SIZE } from '~/composables/useCreadores'
import { CREATOR_TYPE_ORDER, getCreatorTypeConfig } from '~/utils/creadores'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const siteUrl = String(config.public?.siteUrl ?? '').replace(/\/$/, '')
const apiBase = config.public.apiBase

const citySlug = computed(() => String(route.params.city ?? '').toLowerCase())
const currentPage = computed(() => Math.max(1, parseInt(String(route.query.p ?? '1')) || 1))

// Un ?tipo= inventado no se manda al backend: se ignora y la sección se
// comporta como si no hubiera filtro, en vez de devolver una lista vacía que
// parece un error.
const tipo = computed(() => {
  const t = String(route.query.tipo ?? '')
  return CREATOR_TYPE_ORDER.includes(t) ? t : null
})

// Ciudad + los totales por tipo, con key que NO depende del filtro: cambiar de
// pestaña no vuelve a pedir nada y los chips siempre tienen su número.
//
// Los conteos salen de UNA sola consulta que trae solo la columna creatorType,
// no de una petición `soloConteo` por cada uno de los diez tipos: once requests
// en SSR para pintar unos chips no se pagan solos. La sección es de decenas de
// fichas por municipio, así que caben de sobra en una página de 100 — y si algún
// día no cupieran, el peor caso es que un chip muestre un número corto, no que
// la página falle.
const CONTEO_MAX = 100

const { data: meta } = await useAsyncData(
  computed(() => `voces-meta|${citySlug.value}`),
  async () => {
    const [cityRes, tiposRes] = await Promise.all([
      citySlug.value !== FALLBACK_CITY_SLUG
        ? $fetch(`${apiBase}/cities`, {
            query: {
              'filters[slug][$eq]': citySlug.value,
              'pagination[pageSize]': 1,
            },
          }).catch(() => null)
        : Promise.resolve(null),
      $fetch(`${apiBase}/creators`, {
        query: {
          // `soloConteo` es justo lo que hace falta aquí: arma el filtro de
          // ciudad SIN el populate de la lista. Solo se le sube el pageSize,
          // porque estas filas sí se leen.
          ...queryCreadores({ citySlug: citySlug.value, soloConteo: true }),
          'fields[0]': 'creatorType',
          'pagination[pageSize]': CONTEO_MAX,
        },
      }).catch(() => null),
    ])

    const filas = tiposRes?.data ?? []
    const porTipo = {}
    for (const fila of filas) {
      const t = fila?.creatorType ?? 'otro'
      porTipo[t] = (porTipo[t] ?? 0) + 1
    }

    return {
      city: cityRes?.data?.[0] ?? null,
      total: tiposRes?.meta?.pagination?.total ?? 0,
      porTipo,
    }
  },
)

// Un municipio inexistente tiene que dar 404, no un directorio vacío con 200:
// para Google un soft-404 es una página válida y sin contenido, y este patrón se
// traga cualquier /loquesea/voces. Mismo criterio que [city]/eventos.
if (citySlug.value !== FALLBACK_CITY_SLUG && !meta.value?.city) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Municipio no encontrado',
    fatal: true,
  })
}

const cityData = computed(() => meta.value?.city ?? null)
const cityName = computed(() =>
  cityData.value?.name ?? (citySlug.value === FALLBACK_CITY_SLUG ? 'Jalisco' : citySlug.value),
)
const total = computed(() => meta.value?.total ?? 0)

// Solo se ofrecen los tipos que de verdad tienen a alguien: un filtro que
// siempre devuelve cero no es un filtro, es una decepción.
const tiposDisponibles = computed(() =>
  CREATOR_TYPE_ORDER
    .filter(t => (meta.value?.porTipo?.[t] ?? 0) > 0)
    .map(t => ({ valor: t, total: meta.value.porTipo[t], ...getCreatorTypeConfig(t) })),
)

const { creadores, paginacion, pending } = useCreadores(computed(() => ({
  citySlug: citySlug.value,
  tipo: tipo.value,
  pagina: currentPage.value,
})))

const totalCount = computed(() => paginacion.value?.total ?? 0)
const totalPages = computed(() => paginacion.value?.pageCount ?? 1)

function goToPage(p) {
  router.push({ path: route.path, query: { ...route.query, p: p > 1 ? String(p) : undefined } })
}

// Cambiar de filtro siempre vuelve a la página 1: la 3 del filtro anterior casi
// nunca existe en el nuevo y el visitante caería en un listado vacío.
function setTipo(valor) {
  router.push({ path: route.path, query: { ...route.query, tipo: valor ?? undefined, p: undefined } })
}

// SEO --------------------------------------------------------------
const listUrl = computed(() => `${siteUrl}/${citySlug.value}/voces`)

const seoTitle = computed(() =>
  `Creadores e influencers de ${cityName.value}, Jalisco | Mandaditoz`,
)

const seoDescription = computed(() =>
  total.value > 0
    ? `${total.value} ${total.value === 1 ? 'voz' : 'voces'} de ${cityName.value} y la región: influencers, fotógrafos, cronistas, podcasts y medios locales que cuentan lo que pasa aquí.`
    : `Influencers, fotógrafos, cronistas y medios locales de ${cityName.value}, Jalisco.`,
)

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogType: 'website',
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => listUrl.value,
  ogImage: `${siteUrl}/og-default.jpg`,
  twitterCard: 'summary_large_image',
})

const jsonLdScripts = computed(() => {
  const scripts = [{
    type: 'application/ld+json',
    innerHTML: serializeJsonLd(buildBreadcrumbJsonLd([
      { name: 'Inicio', url: `${siteUrl}/` },
      { name: cityName.value, url: `${siteUrl}/${citySlug.value}` },
      { name: 'Voces', url: listUrl.value },
    ])),
  }]

  if (creadores.value.length) {
    scripts.push({
      type: 'application/ld+json',
      innerHTML: serializeJsonLd({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        // URL CANÓNICA (creatorUrl sin override), no la del municipio que se
        // está viendo: los enlaces visibles se quedan dentro de la sección,
        // pero los datos estructurados deben apuntar a donde apunta el canonical
        // de la ficha, o una voz regional entraría con tres URLs distintas.
        itemListElement: creadores.value.map((c, i) => ({
          '@type': 'ListItem',
          position: (currentPage.value - 1) * VOCES_PAGE_SIZE + i + 1,
          url: `${siteUrl}${creatorUrl(c)}`,
          name: c.name,
        })),
      }),
    })
  }

  return scripts
})

// Las vistas filtradas (?tipo=) canonizan al directorio limpio: son un subconjunto
// del mismo recurso, y las fichas ya entran al sitemap por su cuenta.
useHead(() => ({
  link: [{
    rel: 'canonical',
    href: listUrl.value + (!tipo.value && currentPage.value > 1 ? `?p=${currentPage.value}` : ''),
  }],
  script: jsonLdScripts.value,
}))
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-100 px-6 md:px-12 py-3">
      <div class="max-w-6xl mx-auto">
        <nav class="flex items-center gap-2 text-sm">
          <a href="/" class="text-brand-primary hover:underline">Inicio</a>
          <span class="text-gray-400">›</span>
          <a :href="`/${citySlug}`" class="text-brand-primary hover:underline">{{ cityName }}</a>
          <span class="text-gray-400">›</span>
          <span class="text-brand-text font-medium">Voces</span>
        </nav>
      </div>
    </div>

    <!-- Hero -->
    <div class="bg-white px-6 md:px-12 py-8 border-b border-gray-100">
      <div class="max-w-6xl mx-auto">
        <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text leading-tight">
          Voces de {{ cityName }} y la región
        </h1>
        <p class="text-brand-azulgris text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
          Quienes cuentan lo que pasa aquí: influencers, fotógrafos, cronistas, podcasts
          y medios locales de {{ cityName }} y los municipios de alrededor.
        </p>
      </div>
    </div>

    <!-- Contenido -->
    <div class="bg-slate-50 px-6 md:px-12 py-8">
      <div class="max-w-6xl mx-auto">

        <!-- Filtros por tipo -->
        <div v-if="tiposDisponibles.length > 1" class="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            @click="setTipo(null)"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors',
              tipo === null ? 'bg-brand-primary text-white' : 'bg-white text-brand-text border border-gray-200 hover:bg-gray-50',
            ]"
          >
            Todas ({{ total }})
          </button>
          <button
            v-for="t in tiposDisponibles"
            :key="t.valor"
            type="button"
            @click="setTipo(t.valor)"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors',
              tipo === t.valor ? 'bg-brand-primary text-white' : 'bg-white text-brand-text border border-gray-200 hover:bg-gray-50',
            ]"
          >
            <component :is="t.icon" class="w-3.5 h-3.5" />
            {{ t.plural }} ({{ t.total }})
          </button>
        </div>

        <p class="text-brand-azulgris text-sm mb-6">
          <span class="font-semibold text-brand-text">{{ totalCount }}</span>
          {{ totalCount === 1 ? 'voz' : 'voces' }}
        </p>

        <!-- Cargando -->
        <div v-if="pending" class="text-center py-24 text-brand-azulgris text-sm">
          Cargando voces…
        </div>

        <!-- Vacío -->
        <div v-else-if="!creadores.length" class="bg-white rounded-2xl p-12 text-center">
          <Mic class="w-10 h-10 text-brand-azulgris mx-auto mb-4" />
          <p class="font-display font-black text-2xl text-brand-text">
            Aún no hay voces publicadas en {{ cityName }}
          </p>
          <p class="text-brand-azulgris text-sm mt-2">
            Estamos invitando a los creadores de la región. Si creas contenido por aquí, escríbenos.
          </p>
          <a href="/contacto" class="btn-primary mt-5 inline-block">Quiero aparecer</a>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <CreatorCard
            v-for="c in creadores"
            :key="c.id"
            :creador="c"
            :city-slug="citySlug"
          />
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
          <button
            type="button"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
            class="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-brand-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="px-4 text-sm text-brand-text font-semibold">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          <button
            type="button"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
            class="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-brand-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
