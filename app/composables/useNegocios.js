import { mapNegocio } from '~/utils/strapi'

const SORT_MAP = {
  rating:    'ratingAverage:desc',
  nombre:    'name:asc',
  recientes: 'createdAt:desc',
  populares: 'viewCount:desc',
}

export function useNegocios(filtros) {
  const config = useRuntimeConfig()
  const base   = config.public.apiBase

  const key = computed(() => {
    const f = toValue(filtros)
    return `negocios|cat:${f.categoria ?? ''}|q:${f.query ?? ''}|city:${f.ciudad ?? ''}|nb:${f.colonia ?? ''}|price:${f.priceLevel ?? ''}|feat:${!!f.isFeatured}|ver:${!!f.soloVerificados}|ord:${f.orden}|p:${f.pagina}`
  })

  const query = computed(() => {
    const f = toValue(filtros)
    return {
      ...(f.categoria       && { 'filters[category][slug][$eq]': f.categoria }),
      ...(f.ciudad          && { 'filters[city][slug][$eq]': f.ciudad }),
      ...(f.colonia         && { 'filters[neighborhood][slug][$eq]': f.colonia }),
      ...(f.priceLevel      && { 'filters[priceLevel][$eq]': f.priceLevel }),
      ...(f.soloVerificados && { 'filters[isVerified][$eq]': true }),
      ...(f.query           && { 'filters[name][$containsi]': f.query }),
      ...(f.isFeatured      && { 'filters[isFeatured][$eq]': true }),
      'filters[businessStatus][$eq]': 'published',
      'filters[archivedAt][$null]': true,
      sort: SORT_MAP[f.orden] ?? SORT_MAP.rating,
      'populate[category]': true,
      'populate[secondaryCategories]': true,
      'populate[city]': true,
      'populate[neighborhood]': true,
      'populate[tags]': true,
      'populate[geo]': true,
      'populate[logo]': true,
      'populate[coverPhoto]': true,
      'populate[hours]': true,
      'populate[phones]': true,
      'pagination[page]':     f.pagina    ?? 1,
      'pagination[pageSize]': f.porPagina ?? 12,
    }
  })

  const { data, pending, error, refresh } = useFetch(`${base}/businesses`, {
    key,
    query,
    headers: { 'Content-Type': 'application/json' },
  })

  const negocios   = computed(() => data.value?.data?.map(mapNegocio) ?? [])
  const paginacion = computed(() => data.value?.meta?.pagination ?? null)

  return { negocios, paginacion, pending, error, refresh }
}
