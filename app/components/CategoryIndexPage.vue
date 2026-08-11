<script setup>
import { MapPin, Phone, Star, BadgeCheck, ChevronLeft, ChevronRight, ChevronDown } from '@lucide/vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { getCategoriaConfig } from '~/utils/categorias'
import { businessUrl } from '~/utils/urls'
import { buildBreadcrumbJsonLd, serializeJsonLd } from '~/utils/seo'

const props = defineProps({
  citySlug: { type: String, required: true },
  categorySlug: { type: String, required: true },
  cityData: { type: Object, default: null },
  categoryData: { type: Object, required: true },
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const siteUrl = String(config.public?.siteUrl ?? '').replace(/\/$/, '')
const apiBase = config.public.apiBase

const cityName = computed(() => props.cityData?.name ?? props.citySlug)
const categoryName = computed(() => props.categoryData?.name ?? props.categorySlug)

const SORT_MAP = {
  rating:    { label: 'Mejor valorados', strapi: 'ratingAverage:desc' },
  populares: { label: 'Más populares',   strapi: 'viewCount:desc' },
  recientes: { label: 'Más recientes',   strapi: 'createdAt:desc' },
  nombre:    { label: 'A-Z',              strapi: 'name:asc' },
}
const PAGE_SIZE = 24

const currentSort = computed(() => String(route.query.orden ?? 'rating'))
const currentPage = computed(() => Math.max(1, parseInt(String(route.query.p ?? '1')) || 1))

const listQuery = computed(() => ({
  'filters[businessStatus][$eq]': 'published',
  'filters[archivedAt][$null]': true,
  'filters[$and][0][$or][0][city][slug][$eq]': props.citySlug,
  'filters[$and][0][$or][1][visibleInAllCities][$eq]': true,
  'filters[$and][1][$or][0][category][slug][$eq]': props.categorySlug,
  'filters[$and][1][$or][1][secondaryCategories][slug][$eq]': props.categorySlug,
  sort: SORT_MAP[currentSort.value]?.strapi ?? SORT_MAP.rating.strapi,
  'populate[category]': true,
  'populate[city]': true,
  'populate[phones]': true,
  'populate[logo]': true,
  'pagination[page]': currentPage.value,
  'pagination[pageSize]': PAGE_SIZE,
}))

const { data: bizData, pending } = await useAsyncData(
  computed(() => `cat-index|${props.citySlug}|${props.categorySlug}|${currentSort.value}|p${currentPage.value}`),
  () => $fetch(`${apiBase}/businesses`, { query: listQuery.value }),
  { watch: [listQuery] },
)

const negocios = computed(() => (bizData.value?.data ?? []).map(item => ({
  id: item.id,
  documentId: item.documentId,
  name: item.name,
  slug: item.slug,
  shortDescription: item.shortDescription,
  description: item.description,
  address: item.address?.rawText || (item.address?.street ? (item.address.exteriorNumber ? `${item.address.street} ${item.address.exteriorNumber}` : item.address.street) : ''),
  phones: item.phones ?? [],
  ratingAverage: Number(item.ratingAverage ?? 0),
  ratingCount: item.ratingCount ?? 0,
  isVerified: !!item.isVerified,
  category: item.category,
  city: item.city,
  visibleInAllCities: !!item.visibleInAllCities,
})))

const totalCount = computed(() => bizData.value?.meta?.pagination?.total ?? 0)
const totalPages = computed(() => bizData.value?.meta?.pagination?.pageCount ?? 1)

function goToPage(p) {
  router.push({ path: route.path, query: { ...route.query, p: p > 1 ? String(p) : undefined } })
}

function setSort(key) {
  router.push({ path: route.path, query: { ...route.query, orden: key === 'rating' ? undefined : key, p: undefined } })
}

// SEO --------------------------------------------------------------
const pageUrl = computed(() => `${siteUrl}/${props.citySlug}/${props.categorySlug}`)

const seoTitle = computed(() =>
  `${categoryName.value} en ${cityName.value}, Jalisco | Mandaditoz`,
)

const seoDescription = computed(() => {
  const n = totalCount.value
  if (n > 0) {
    return `Encuentra ${n} ${categoryName.value.toLowerCase()} en ${cityName.value}, Jalisco. Direcciones, teléfonos, horarios y reseñas.`
  }
  return `Directorio de ${categoryName.value.toLowerCase()} en ${cityName.value}, Jalisco. Encuentra el negocio que necesitas.`
})

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
  const scripts = []

  // BreadcrumbList
  const crumbs = [
    { name: 'Inicio', url: `${siteUrl}/` },
    { name: cityName.value, url: `${siteUrl}/${props.citySlug}` },
    { name: categoryName.value, url: pageUrl.value },
  ]
  scripts.push({
    type: 'application/ld+json',
    innerHTML: serializeJsonLd(buildBreadcrumbJsonLd(crumbs)),
  })

  // ItemList de los negocios de la página actual
  if (negocios.value.length) {
    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: negocios.value.map((biz, i) => ({
        '@type': 'ListItem',
        position: (currentPage.value - 1) * PAGE_SIZE + i + 1,
        url: `${siteUrl}${businessUrl(biz)}`,
        name: biz.name,
      })),
    }
    scripts.push({
      type: 'application/ld+json',
      innerHTML: serializeJsonLd(itemList),
    })
  }

  return scripts
})

useHead(() => ({
  link: [{ rel: 'canonical', href: pageUrl.value + (currentPage.value > 1 ? `?p=${currentPage.value}` : '') }],
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
          <span class="text-brand-text font-medium">{{ categoryName }}</span>
        </nav>
      </div>
    </div>

    <!-- Hero -->
    <div class="bg-white px-6 md:px-12 py-8 border-b border-gray-100">
      <div class="max-w-6xl mx-auto">
        <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text leading-tight">
          {{ categoryName }} en {{ cityName }}
        </h1>
        <p class="text-brand-azulgris text-sm mt-2">
          {{ totalCount }} {{ totalCount === 1 ? 'negocio' : 'negocios' }} en {{ cityName }}, Jalisco
        </p>
        <p v-if="categoryData?.description" class="text-brand-text text-sm mt-4 max-w-3xl leading-relaxed">
          {{ categoryData.description }}
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="bg-slate-50 px-6 md:px-12 py-8">
      <div class="max-w-6xl mx-auto">

        <!-- Sort -->
        <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <p class="text-brand-azulgris text-sm">
            Mostrando <span class="font-semibold text-brand-text">{{ negocios.length }}</span>
            de <span class="font-semibold text-brand-text">{{ totalCount }}</span>
          </p>
          <Menu as="div" class="relative">
            <MenuButton class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-brand-text hover:bg-gray-50 transition-colors">
              {{ SORT_MAP[currentSort]?.label ?? 'Ordenar' }}
              <ChevronDown class="w-4 h-4" />
            </MenuButton>
            <MenuItems class="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-20 overflow-hidden">
              <MenuItem v-for="(meta, key) in SORT_MAP" :key="key" v-slot="{ active }">
                <button
                  type="button"
                  @click="setSort(key)"
                  :class="[
                    'w-full text-left px-4 py-2.5 text-sm',
                    active ? 'bg-gray-50 text-brand-text' : 'text-brand-text',
                    currentSort === key ? 'font-bold' : 'font-medium',
                  ]"
                >
                  {{ meta.label }}
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="text-center py-24 text-brand-azulgris text-sm">
          Cargando negocios…
        </div>

        <!-- Empty -->
        <div v-else-if="!negocios.length" class="bg-white rounded-2xl p-12 text-center">
          <p class="font-display font-black text-2xl text-brand-text">Aún no hay {{ categoryName.toLowerCase() }} en {{ cityName }}</p>
          <p class="text-brand-azulgris text-sm mt-2">Prueba con otra categoría o municipio.</p>
          <a href="/list" class="btn-primary mt-4 inline-block">Ver directorio completo</a>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <a
            v-for="biz in negocios"
            :key="biz.id"
            :href="businessUrl(biz)"
            class="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 cursor-pointer"
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
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <div v-if="biz.address" class="flex items-center gap-1 text-brand-azulgris text-xs">
                    <MapPin class="w-3 h-3 shrink-0" />
                    <span>{{ biz.address }}</span>
                  </div>
                </div>
                <div v-if="biz.phones.length" class="flex items-center gap-1 text-brand-azulgris text-xs mt-0.5">
                  <Phone class="w-3 h-3 shrink-0" />
                  <span>{{ biz.phones[0].number }}</span>
                </div>
              </div>
            </div>

            <p v-if="biz.shortDescription || biz.description" class="text-brand-text text-sm leading-relaxed line-clamp-2">
              {{ biz.shortDescription ?? biz.description }}
            </p>

            <div class="flex items-center justify-between mt-auto">
              <div class="flex items-center gap-1">
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
            </div>
          </a>
        </div>

        <!-- Pagination -->
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
