<script setup>
/**
 * Dispatcher /[city]/[slug]:
 *  - Si [slug] coincide con una categoría → renderiza CategoryIndexPage.
 *  - Si no → renderiza BusinessDetailPage (el legacy detalle de negocio).
 *
 * Las categorías se consultan primero porque son un set pequeño (~64) con
 * slugs cortos y predecibles. Los slugs de negocio son largos/específicos,
 * así que colisiones son improbables.
 */
import { FALLBACK_CITY_SLUG } from '~/utils/urls'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const citySlug = computed(() => String(route.params.city ?? '').toLowerCase())
const slug = computed(() => String(route.params.slug ?? '').toLowerCase())

// Fetch en paralelo: categoría por slug + ciudad por slug.
// Ambas quedan cacheadas por Nuxt gracias a useAsyncData con key estable.
const { data: dispatchData } = await useAsyncData(
  computed(() => `dispatch|${citySlug.value}|${slug.value}`),
  async () => {
    const [catRes, cityRes] = await Promise.all([
      $fetch(`${apiBase}/categories`, {
        query: {
          'filters[slug][$eq]': slug.value,
          'filters[isActive][$eq]': true,
          'pagination[pageSize]': 1,
        },
      }).catch(() => null),
      citySlug.value !== FALLBACK_CITY_SLUG
        ? $fetch(`${apiBase}/cities`, {
            query: {
              'filters[slug][$eq]': citySlug.value,
              'pagination[pageSize]': 1,
            },
          }).catch(() => null)
        : Promise.resolve(null),
    ])
    return {
      category: catRes?.data?.[0] ?? null,
      city: cityRes?.data?.[0] ?? null,
    }
  },
)

const category = computed(() => dispatchData.value?.category ?? null)
const city = computed(() => dispatchData.value?.city ?? null)
const isCategoryPage = computed(() => !!category.value)
</script>

<template>
  <CategoryIndexPage
    v-if="isCategoryPage"
    :city-slug="citySlug"
    :category-slug="slug"
    :city-data="city"
    :category-data="category"
  />
  <BusinessDetailPage v-else />
</template>
