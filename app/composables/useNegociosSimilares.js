import { mapCity, mapMedia } from '~/utils/strapi'

// Cuántos candidatos se piden y cuántos se muestran. Se piden más de los que
// caben para poder rotarlos: con casi todo el directorio en 0 reseñas y 0
// visitas, cualquier `sort` de Strapi devolvería los mismos seis vecinos en
// todas las fichas de la categoría.
const CANDIDATOS = 24

/**
 * Negocios de la misma categoría y municipio que `negocio`, para el bloque
 * "Negocios similares" de la ficha.
 *
 * El orden es determinista (sin Math.random) para que SSR e hidratación
 * coincidan: primero los que tienen reseñas, y el resto rotado según el id
 * del negocio actual, de modo que cada ficha enlaza a vecinos distintos.
 */
export function useNegociosSimilares(negocio, { limite = 6 } = {}) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase
  const cityStore = useCityStore()

  const actual = computed(() => toValue(negocio))
  const categoria = computed(() => actual.value?.category?.slug ?? null)
  // Un negocio regional (o sin municipio) no tiene vecindario propio: se usa
  // el municipio que el visitante tiene elegido.
  const ciudad = computed(() => {
    const n = actual.value
    if (!n) return null
    return (!n.visibleInAllCities && n.city?.slug) || cityStore.activeCitySlug || null
  })

  const key = computed(() => `negocios-similares|${actual.value?.id ?? ''}|${categoria.value ?? ''}|${ciudad.value ?? ''}`)

  const query = computed(() => ({
    'filters[id][$ne]': actual.value?.id ?? 0,
    'filters[businessStatus][$eq]': 'published',
    'filters[archivedAt][$null]': true,
    'filters[$and][0][$or][0][category][slug][$eq]': categoria.value ?? '',
    'filters[$and][0][$or][1][secondaryCategories][slug][$eq]': categoria.value ?? '',
    ...(ciudad.value && {
      'filters[$and][1][$or][0][city][slug][$eq]': ciudad.value,
      'filters[$and][1][$or][1][visibleInAllCities][$eq]': true,
    }),
    'fields[0]': 'name',
    'fields[1]': 'slug',
    'fields[2]': 'shortDescription',
    'fields[3]': 'ratingAverage',
    'fields[4]': 'ratingCount',
    'fields[5]': 'isVerified',
    'fields[6]': 'visibleInAllCities',
    'populate[city][fields][0]': 'name',
    'populate[city][fields][1]': 'slug',
    'populate[category][fields][0]': 'name',
    'populate[category][fields][1]': 'slug',
    'populate[category][fields][2]': 'color',
    'populate[neighborhood][fields][0]': 'name',
    'populate[logo]': true,
    sort: 'id:asc',
    'pagination[pageSize]': CANDIDATOS,
  }))

  const { data, pending } = useFetch(`${base}/businesses`, {
    key,
    query,
    headers: { 'Content-Type': 'application/json' },
    // Sin categoría no hay "similares" que buscar.
    immediate: !!categoria.value,
    watch: [key],
  })

  const negocios = computed(() => {
    const semilla = actual.value?.id ?? 0
    return (data.value?.data ?? [])
      .map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        shortDescription: item.shortDescription ?? null,
        ratingAverage: item.ratingAverage ?? 0,
        ratingCount: item.ratingCount ?? 0,
        isVerified: !!item.isVerified,
        visibleInAllCities: !!item.visibleInAllCities,
        city: item.city ? mapCity(item.city) : null,
        category: item.category ? { name: item.category.name, slug: item.category.slug, color: item.category.color } : null,
        neighborhood: item.neighborhood?.name ?? null,
        logo: item.logo ? mapMedia(item.logo) : null,
        orden: mezcla(item.id, semilla),
      }))
      .sort((a, b) => b.ratingCount - a.ratingCount || a.orden - b.orden)
      .slice(0, limite)
  })

  return { negocios, pending, categoria, ciudad }
}

// Entero pseudoaleatorio pero estable para el par (id, semilla).
function mezcla(id, semilla) {
  let h = (id * 2654435761 + semilla * 40503) >>> 0
  h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0
  return (h ^ (h >>> 13)) >>> 0
}
