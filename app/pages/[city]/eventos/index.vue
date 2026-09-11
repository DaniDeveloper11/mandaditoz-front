<script setup>
import { CalendarDays, History, ArrowLeft, ChevronLeft, ChevronRight } from '@lucide/vue'
import { FALLBACK_CITY_SLUG, eventUrl } from '~/utils/urls'
import { buildBreadcrumbJsonLd, serializeJsonLd } from '~/utils/seo'
import { queryEventos, EVENTOS_PAGE_SIZE } from '~/composables/useEventos'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const siteUrl = String(config.public?.siteUrl ?? '').replace(/\/$/, '')
const apiBase = config.public.apiBase

const citySlug = computed(() => String(route.params.city ?? '').toLowerCase())
const pasados = computed(() => route.query.pasados === '1')
const currentPage = computed(() => Math.max(1, parseInt(String(route.query.p ?? '1')) || 1))

// Ciudad + los dos conteos en una sola llamada, con key que NO depende de
// `pasados`: así cambiar de pestaña no vuelve a pedir nada y los dos enlaces
// siempre tienen su número.
const { data: meta } = await useAsyncData(
  computed(() => `eventos-meta|${citySlug.value}`),
  async () => {
    const [cityRes, vigentesRes, pasadosRes] = await Promise.all([
      citySlug.value !== FALLBACK_CITY_SLUG
        ? $fetch(`${apiBase}/cities`, {
            query: {
              'filters[slug][$eq]': citySlug.value,
              'pagination[pageSize]': 1,
            },
          }).catch(() => null)
        : Promise.resolve(null),
      $fetch(`${apiBase}/city-posts`, {
        query: queryEventos({ citySlug: citySlug.value, pasados: false, soloConteo: true }),
      }).catch(() => null),
      $fetch(`${apiBase}/city-posts`, {
        query: queryEventos({ citySlug: citySlug.value, pasados: true, soloConteo: true }),
      }).catch(() => null),
    ])
    return {
      city: cityRes?.data?.[0] ?? null,
      totalVigentes: vigentesRes?.meta?.pagination?.total ?? 0,
      totalPasados: pasadosRes?.meta?.pagination?.total ?? 0,
    }
  },
)

// Un municipio inexistente tiene que dar 404, no una cartelera vacía con 200:
// para Google un soft-404 es una página válida y sin contenido, y este patrón se
// traga cualquier /loquesea/eventos. Mismo criterio que [city]/index.vue.
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
const totalVigentes = computed(() => meta.value?.totalVigentes ?? 0)
const totalPasados = computed(() => meta.value?.totalPasados ?? 0)

const { eventos, paginacion, pending } = useEventos(computed(() => ({
  citySlug: citySlug.value,
  pasados: pasados.value,
  pagina: currentPage.value,
})))

const totalCount = computed(() => paginacion.value?.total ?? 0)
const totalPages = computed(() => paginacion.value?.pageCount ?? 1)

/**
 * La publicación que el municipio fijó arriba se lleva el bloque protagonista.
 *
 * Es el primer resultado cuando trae `isFeatured`, sin una segunda consulta: el
 * sort del composable ya pone `isFeatured:desc,featuredOrder:asc` al frente, así
 * que el destacado con el featuredOrder más bajo siempre encabeza la lista. Si
 * el municipio no fijó nada, no hay hero y la cartelera arranca con el grid.
 *
 * Solo en la página 1 de la cartelera vigente: en el archivo y en las páginas
 * siguientes no hay nada que "fijar arriba", y el mismo evento saldría repetido.
 */
const destacado = computed(() => {
  if (pasados.value || currentPage.value > 1) return null
  const primero = eventos.value[0]
  return primero?.isFeatured ? primero : null
})

// El destacado se saca del grid: si no, aparecería dos veces en la misma página.
const resto = computed(() => (destacado.value ? eventos.value.slice(1) : eventos.value))

function goToPage(p) {
  router.push({ path: route.path, query: { ...route.query, p: p > 1 ? String(p) : undefined } })
}

// SEO --------------------------------------------------------------
const listUrl = computed(() => `${siteUrl}/${citySlug.value}/eventos`)

const seoTitle = computed(() =>
  pasados.value
    ? `Eventos pasados en ${cityName.value}, Jalisco | Mandaditoz`
    : `Eventos y avisos en ${cityName.value}, Jalisco | Mandaditoz`,
)

const seoDescription = computed(() => {
  if (pasados.value) return `Archivo de eventos, fiestas y avisos de ${cityName.value}, Jalisco.`
  return totalVigentes.value > 0
    ? `${totalVigentes.value} ${totalVigentes.value === 1 ? 'evento' : 'eventos'} y avisos en ${cityName.value}, Jalisco: fiestas patronales, ferias, actividades culturales y comunicados del municipio.`
    : `Cartelera de eventos, fiestas patronales y avisos de ${cityName.value}, Jalisco.`
})

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
      { name: 'Eventos', url: listUrl.value },
    ])),
  }]

  if (eventos.value.length) {
    scripts.push({
      type: 'application/ld+json',
      innerHTML: serializeJsonLd({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        // URL CANÓNICA (eventUrl sin override), no la del municipio que se está
        // viendo: los enlaces visibles se quedan dentro de la cartelera, pero
        // los datos estructurados deben apuntar a donde apunta el canonical de
        // la ficha, o un evento regional entraría con tres URLs distintas.
        itemListElement: eventos.value.map((ev, i) => ({
          '@type': 'ListItem',
          position: (currentPage.value - 1) * EVENTOS_PAGE_SIZE + i + 1,
          url: `${siteUrl}${eventUrl(ev)}`,
          name: ev.title,
        })),
      }),
    })
  }

  return scripts
})

// El archivo (?pasados=1) canoniza a la cartelera limpia: es una vista
// alternativa del mismo recurso y las fichas de los eventos pasados ya entran
// al sitemap por su cuenta.
useHead(() => ({
  link: [{
    rel: 'canonical',
    href: listUrl.value + (!pasados.value && currentPage.value > 1 ? `?p=${currentPage.value}` : ''),
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
          <span class="text-brand-text font-medium">Eventos</span>
        </nav>
      </div>
    </div>

    <!-- Hero -->
    <div class="bg-white px-6 md:px-12 py-8 border-b border-gray-100">
      <div class="max-w-6xl mx-auto">
        <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text leading-tight">
          {{ pasados ? `Eventos pasados en ${cityName}` : `Eventos y avisos en ${cityName}` }}
        </h1>
        <p class="text-brand-azulgris text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
          {{ pasados
            ? `Lo que ya ocurrió en ${cityName}. La cartelera vigente está en la página principal de eventos.`
            : `Fiestas patronales, ferias, actividades culturales y avisos del municipio de ${cityName}, Jalisco.` }}
        </p>
      </div>
    </div>

    <!-- Contenido -->
    <div class="bg-slate-50 px-6 md:px-12 py-8">
      <div class="max-w-6xl mx-auto">

        <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <p class="text-brand-azulgris text-sm">
            <span class="font-semibold text-brand-text">{{ totalCount }}</span>
            {{ totalCount === 1 ? 'publicación' : 'publicaciones' }}
          </p>

          <a
            v-if="pasados"
            :href="`/${citySlug}/eventos`"
            class="inline-flex items-center gap-1.5 text-brand-primary text-sm font-semibold hover:underline"
          >
            <ArrowLeft class="w-4 h-4" />
            Volver a la cartelera ({{ totalVigentes }})
          </a>
          <a
            v-else-if="totalPasados"
            :href="`/${citySlug}/eventos?pasados=1`"
            class="inline-flex items-center gap-1.5 text-brand-primary text-sm font-semibold hover:underline"
          >
            <History class="w-4 h-4" />
            Ver eventos pasados ({{ totalPasados }})
          </a>
        </div>

        <!-- Cargando -->
        <div v-if="pending" class="text-center py-24 text-brand-azulgris text-sm">
          Cargando eventos…
        </div>

        <!-- Vacío -->
        <div v-else-if="!eventos.length" class="bg-white rounded-2xl p-12 text-center">
          <CalendarDays class="w-10 h-10 text-brand-azulgris mx-auto mb-4" />
          <p class="font-display font-black text-2xl text-brand-text">
            {{ pasados ? `Todavía no hay eventos pasados en ${cityName}` : `Aún no hay eventos publicados en ${cityName}` }}
          </p>
          <p class="text-brand-azulgris text-sm mt-2">
            {{ pasados ? 'Cuando termine algún evento, aparecerá aquí.' : 'Vuelve pronto: la cartelera del municipio se actualiza cada semana.' }}
          </p>
          <a :href="`/${citySlug}`" class="btn-primary mt-5 inline-block">Ver negocios de {{ cityName }}</a>
        </div>

        <!-- Destacado + grid -->
        <template v-else>
          <EventHero
            v-if="destacado"
            :evento="destacado"
            :city-slug="citySlug"
            class="mb-8"
          />

          <div v-if="resto.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <EventCard
              v-for="ev in resto"
              :key="ev.id"
              :evento="ev"
              :city-slug="citySlug"
              :pasado="pasados"
            />
          </div>
        </template>

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
