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
    const [catRes, cityRes, bizRes] = await Promise.all([
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
      // Solo para saber si el negocio existe y poder devolver 404 desde el
      // servidor. BusinessDetailPage vuelve a pedirlo con todo el populate;
      // esta consulta pide un único campo y va en paralelo, así que no agrega
      // latencia. `undefined` = la API falló: en ese caso no se asume 404.
      $fetch(`${apiBase}/businesses`, {
        query: {
          'filters[slug][$eq]': slug.value,
          'filters[businessStatus][$eq]': 'published',
          'filters[archivedAt][$null]': true,
          'fields[0]': 'slug',
          'pagination[pageSize]': 1,
        },
      }).catch(() => undefined),
    ])
    return {
      category: catRes?.data?.[0] ?? null,
      city: cityRes?.data?.[0] ?? null,
      businessExists: bizRes === undefined ? undefined : !!bizRes?.data?.[0],
    }
  },
)

const category = computed(() => dispatchData.value?.category ?? null)
const city = computed(() => dispatchData.value?.city ?? null)
const isCategoryPage = computed(() => !!category.value)

// Soft-404: hasta ahora una URL inventada renderizaba "no encontrado" con
// status 200, y Google lo lee como página válida y vacía. Se corrige aquí, en
// el dispatcher, porque es el único punto donde el fetch ya está resuelto
// durante el render del servidor.
//
// Si la consulta de negocio falló (`undefined`), NO se hace 404: una caída de
// Strapi convertiría el catálogo entero en páginas inexistentes para Google.
if (
  !isCategoryPage.value &&
  (dispatchData.value?.businessExists === false ||
    (citySlug.value !== FALLBACK_CITY_SLUG && !city.value))
) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Página no encontrada',
    fatal: true,
  })
}
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
