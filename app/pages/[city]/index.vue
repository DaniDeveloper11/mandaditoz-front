<script setup>
import { MapPin, Star, BadgeCheck, ArrowRight } from '@lucide/vue'
import { getLucideIcon } from '~/utils/categorias'
import { businessUrl, FALLBACK_CITY_SLUG } from '~/utils/urls'
import { buildBreadcrumbJsonLd, serializeJsonLd } from '~/utils/seo'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = String(config.public?.siteUrl ?? '').replace(/\/$/, '')
const apiBase = config.public.apiBase

const citySlug = computed(() => String(route.params.city ?? '').toLowerCase())

const { data: pageData } = await useAsyncData(
  computed(() => `city-home|${citySlug.value}`),
  async () => {
    const [cityRes, catsRes, featRes] = await Promise.all([
      citySlug.value !== FALLBACK_CITY_SLUG
        ? $fetch(`${apiBase}/cities`, {
            query: {
              'filters[slug][$eq]': citySlug.value,
              'pagination[pageSize]': 1,
            },
          }).catch(() => null)
        : Promise.resolve(null),
      $fetch(`${apiBase}/categories`, {
        query: {
          'filters[isActive][$eq]': true,
          'filters[depth][$eq]': 0,
          ...(citySlug.value !== FALLBACK_CITY_SLUG && {
            'filters[businesses][city][slug][$eq]': citySlug.value,
          }),
          sort: 'order:asc,name:asc',
          'pagination[pageSize]': 100,
        },
      }).catch(() => ({ data: [] })),
      $fetch(`${apiBase}/businesses`, {
        query: {
          'filters[businessStatus][$eq]': 'published',
          'filters[archivedAt][$null]': true,
          'filters[$and][0][$or][0][city][slug][$eq]': citySlug.value,
          'filters[$and][0][$or][1][visibleInAllCities][$eq]': true,
          'filters[isFeatured][$eq]': true,
          sort: 'featuredOrder:asc,ratingAverage:desc',
          'populate[category]': true,
          'populate[city]': true,
          'populate[phones]': true,
          'pagination[pageSize]': 8,
        },
      }).catch(() => ({ data: [] })),
    ])
    return {
      city: cityRes?.data?.[0] ?? null,
      categorias: catsRes?.data ?? [],
      destacados: featRes?.data ?? [],
    }
  },
)

const cityData = computed(() => pageData.value?.city ?? null)
const cityName = computed(() => cityData.value?.name ?? (citySlug.value === FALLBACK_CITY_SLUG ? 'Jalisco' : citySlug.value))
const categorias = computed(() => pageData.value?.categorias ?? [])
const destacados = computed(() => (pageData.value?.destacados ?? []).map(item => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  shortDescription: item.shortDescription,
  address: item.address?.rawText || (item.address?.street ?? ''),
  ratingAverage: Number(item.ratingAverage ?? 0),
  ratingCount: item.ratingCount ?? 0,
  isVerified: !!item.isVerified,
  category: item.category,
  city: item.city,
  visibleInAllCities: !!item.visibleInAllCities,
})))

// SEO --------------------------------------------------------------
const pageUrl = computed(() => `${siteUrl}/${citySlug.value}`)
const seoTitle = computed(() => `Negocios en ${cityName.value}, Jalisco | Mandaditoz`)
const seoDescription = computed(() =>
  `Directorio completo de negocios en ${cityName.value}, Jalisco. Restaurantes, tiendas, farmacias, servicios y más. Encuentra teléfonos, horarios y ubicaciones.`,
)

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogType: 'website',
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => pageUrl.value,
  ogImage: `${siteUrl}/og-default.jpg`,
  twitterCard: 'summary_large_image',
})

const jsonLdScripts = computed(() => {
  const crumbs = [
    { name: 'Inicio', url: `${siteUrl}/` },
    { name: cityName.value, url: pageUrl.value },
  ]
  return [{
    type: 'application/ld+json',
    innerHTML: serializeJsonLd(buildBreadcrumbJsonLd(crumbs)),
  }]
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value }],
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
          <span class="text-brand-text font-medium">{{ cityName }}</span>
        </nav>
      </div>
    </div>

    <!-- Hero -->
    <div class="bg-white px-6 md:px-12 py-10 border-b border-gray-100">
      <div class="max-w-6xl mx-auto">
        <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text leading-tight">
          Negocios en {{ cityName }}
        </h1>
        <p class="text-brand-azulgris text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
          Directorio local de {{ cityName }}, Jalisco. Explora restaurantes, tiendas, servicios, salud y más — con teléfonos, direcciones, horarios y reseñas verificadas.
        </p>
      </div>
    </div>

    <!-- Categorías grid -->
    <div class="bg-slate-50 px-6 md:px-12 py-10">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 class="font-display font-black text-2xl text-brand-text">Explora por categoría</h2>
          <a href="/categorias" class="text-brand-primary text-sm font-semibold hover:underline inline-flex items-center gap-1">
            Ver todas <ArrowRight class="w-4 h-4" />
          </a>
        </div>

        <div v-if="!categorias.length" class="text-center py-12 text-brand-azulgris text-sm">
          Aún no hay categorías con negocios en {{ cityName }}.
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <a
            v-for="cat in categorias"
            :key="cat.id"
            :href="`/${citySlug}/${cat.slug}`"
            class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 group"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :style="cat.color ? { backgroundColor: cat.color + '26' } : { backgroundColor: '#E8EEF4' }"
            >
              <component :is="getLucideIcon(cat.icon || cat.slug)" class="w-5 h-5" :style="cat.color ? { color: cat.color } : { color: '#1D5A8A' }" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-brand-text text-sm leading-tight truncate">{{ cat.name }}</p>
              <p v-if="cat.businessCount" class="text-brand-azulgris text-xs mt-0.5">
                {{ cat.businessCount }} {{ cat.businessCount === 1 ? 'negocio' : 'negocios' }}
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- Destacados -->
    <div v-if="destacados.length" class="bg-white px-6 md:px-12 py-10 border-t border-gray-100">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 class="font-display font-black text-2xl text-brand-text">Destacados en {{ cityName }}</h2>
          <a :href="`/list?ciudad=${citySlug}`" class="text-brand-primary text-sm font-semibold hover:underline inline-flex items-center gap-1">
            Ver todos <ArrowRight class="w-4 h-4" />
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            v-for="biz in destacados"
            :key="biz.id"
            :href="businessUrl(biz)"
            class="bg-slate-50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
          >
            <div class="flex items-start gap-4">
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                :class="biz.category?.color ? '' : 'bg-brand-bg-dark'"
                :style="biz.category?.color ? { backgroundColor: biz.category.color + '33' } : {}"
              >
                {{ biz.name.charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h3 class="font-display font-bold text-brand-text text-base leading-tight">{{ biz.name }}</h3>
                  <BadgeCheck v-if="biz.isVerified" class="w-4 h-4 text-blue-500 shrink-0" />
                </div>
                <div v-if="biz.address" class="flex items-center gap-1 text-brand-azulgris text-xs mt-1">
                  <MapPin class="w-3 h-3 shrink-0" />
                  <span class="truncate">{{ biz.address }}</span>
                </div>
              </div>
            </div>
            <p v-if="biz.shortDescription" class="text-brand-text text-sm leading-relaxed line-clamp-2">
              {{ biz.shortDescription }}
            </p>
            <div class="flex items-center gap-1 mt-auto">
              <div class="flex gap-0.5">
                <Star
                  v-for="i in 5"
                  :key="i"
                  :class="['w-3.5 h-3.5', i <= Math.round(biz.ratingAverage) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
                />
              </div>
              <span class="text-sm font-semibold text-brand-text ml-1">{{ biz.ratingAverage.toFixed(1) }}</span>
              <span class="text-xs text-brand-azulgris">({{ biz.ratingCount }})</span>
            </div>
          </a>
        </div>
      </div>
    </div>

  </div>
</template>
