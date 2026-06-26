import { mapNegocio } from '~/utils/strapi'

const SORT_MAP = {
  rating: 'ratingAverage:desc',
  nombre: 'name:asc',
  recientes: 'createdAt:desc',
}

export function useNegocios(filtros) {
  const { get } = useApi()

  const { data, pending, error, refresh } = get('/businesses', computed(() => {
    const f = toValue(filtros)
    return {
      ...(f.categoria && { 'filters[category][slug][$eq]': f.categoria }),
      ...(f.soloVerificados && { 'filters[isVerified][$eq]': true }),
      ...(f.query && { 'filters[name][$containsi]': f.query }),
      ...(f.isFeatured && { 'filters[isFeatured][$eq]': true }),
      'filters[status][$eq]': 'published',
      sort: SORT_MAP[f.orden] ?? SORT_MAP.rating,
      'populate[0]': 'category',
      'populate[1]': 'logo',
      'pagination[page]': f.pagina ?? 1,
      'pagination[pageSize]': f.porPagina ?? 12,
    }
  }))

  const negocios = computed(() => data.value?.data?.map(mapNegocio) ?? [])
  const paginacion = computed(() => data.value?.meta?.pagination ?? null)
  console.log("negocios",negocios)
  return { negocios, paginacion, pending, error, refresh }
}
