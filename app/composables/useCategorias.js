import { mapCategoria } from '~/utils/strapi'

export function useCategorias(limit = 100) {
  const { get } = useApi()

  const { data, pending, error } = get('/categories', {
    'filters[isActive][$eq]': true,
    sort: 'order:asc',
    'pagination[pageSize]': limit,
  })

  const categorias = computed(() => data.value?.data?.map(mapCategoria) ?? [])

  return { categorias, pending, error }
}
