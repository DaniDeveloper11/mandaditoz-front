import { mapNegocio } from '~/utils/strapi'

const SORT_MAP = {
  rating:    'ratingAverage:desc',
  nombre:    'name:asc',
  recientes: 'createdAt:desc',
}

export function useNegocios(filtros) {
  const config = useRuntimeConfig()
  const base   = config.public.apiBase

  // Key única por combinación de filtros — evita que useFetch duplique
  // resultados entre múltiples instancias con el mismo endpoint
  const key = computed(() => {
    const f = toValue(filtros)
    return `negocios|cat:${f.categoria ?? ''}|q:${f.query ?? ''}|feat:${!!f.isFeatured}|ver:${!!f.soloVerificados}|ord:${f.orden}|p:${f.pagina}`
  })

  const query = computed(() => {
    const f = toValue(filtros)
    return {
      ...(f.categoria       && { 'filters[category][slug][$eq]': f.categoria }),
      ...(f.soloVerificados && { 'filters[isVerified][$eq]': true }),
      ...(f.query           && { 'filters[name][$containsi]': f.query }),
      ...(f.isFeatured      && { 'filters[isFeatured][$eq]': true }),
      'filters[businessStatus][$eq]': 'published',
      sort: SORT_MAP[f.orden] ?? SORT_MAP.rating,
      'populate[0]': 'category',
      'populate[1]': 'logo',
      'populate[2]': 'coverPhoto',
      'populate[3]': 'hours',
      'pagination[page]':     f.pagina    ?? 1,
      'pagination[pageSize]': f.porPagina ?? 12,
    }
  })

  const { data, pending, error, refresh } = useFetch(`${base}/businesses`, {
    key,
    query,
    headers: { 'Content-Type': 'application/json' },
  })

  const negocios  = computed(() => data.value?.data?.map(mapNegocio) ?? [])
  const paginacion = computed(() => data.value?.meta?.pagination ?? null)

  return { negocios, paginacion, pending, error, refresh }
}
