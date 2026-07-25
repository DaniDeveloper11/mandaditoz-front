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
  const cityStore = useCityStore()

  const key = computed(() => {
    const f = toValue(filtros)
    const ciudad = f.ciudad ?? cityStore.activeCitySlug
    return `negocios|cat:${f.categoria ?? ''}|q:${f.query ?? ''}|city:${ciudad ?? ''}|nb:${f.colonia ?? ''}|price:${f.priceLevel ?? ''}|feat:${!!f.isFeatured}|ver:${!!f.soloVerificados}|ord:${f.orden}|p:${f.pagina}`
  })

  const query = computed(() => {
    const f = toValue(filtros)
    const ciudad = f.ciudad ?? cityStore.activeCitySlug

    const andGroups = []
    if (ciudad) {
      andGroups.push({
        '$or': [
          { city: { slug: { '$eq': ciudad } } },
          { visibleInAllCities: { '$eq': true } },
        ],
      })
    }
    if (f.query) {
      andGroups.push({
        '$or': [
          { name:                { '$containsi': f.query } },
          { category:            { name: { '$containsi': f.query } } },
          { category:            { parent: { name: { '$containsi': f.query } } } },
          { secondaryCategories: { name: { '$containsi': f.query } } },
          { secondaryCategories: { parent: { name: { '$containsi': f.query } } } },
          { tags:                { name: { '$containsi': f.query } } },
        ],
      })
    }

    const andParams = {}
    andGroups.forEach((group, i) => {
      group['$or'].forEach((cond, j) => {
        const flatten = (obj, path) => {
          for (const [k, v] of Object.entries(obj)) {
            const next = `${path}[${k}]`
            if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, next)
            else andParams[next] = v
          }
        }
        flatten(cond, `filters[$and][${i}][$or][${j}]`)
      })
    })

    return {
      ...(f.categoria       && { 'filters[category][slug][$eq]': f.categoria }),
      ...andParams,
      ...(f.colonia         && { 'filters[neighborhood][slug][$eq]': f.colonia }),
      ...(f.priceLevel      && { 'filters[priceLevel][$eq]': f.priceLevel }),
      ...(f.soloVerificados && { 'filters[isVerified][$eq]': true }),
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
      'populate[address]': true,
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
