import { mapNegocio } from '~/utils/strapi'

const SORT_MAP = {
  rating: 'rating:desc',
  nombre: 'nombre:asc',
  recientes: 'createdAt:desc',
}

export function useNegocios(filtros) {
  const { get } = useApi()

  const { data, pending, error, refresh } = get('/negocios', computed(() => {
    const f = toValue(filtros)
    return {
      ...(f.categoria && { 'filters[categoria][slug][$eq]': f.categoria }),
      ...(f.soloVerificados && { 'filters[verificado][$eq]': true }),
      ...(f.query && { 'filters[$or][0][nombre][$containsi]': f.query }),
      sort: SORT_MAP[f.orden] ?? SORT_MAP.rating,
      'populate': 'categoria,logo',
      'pagination[page]': f.pagina,
      'pagination[pageSize]': f.porPagina,
    }
  }))

  const negocios = computed(() => data.value?.data?.map(mapNegocio) ?? [])
  const paginacion = computed(() => data.value?.meta?.pagination ?? null)

  return { negocios, paginacion, pending, error, refresh }
}
