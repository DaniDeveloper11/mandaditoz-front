import { mapCategoria } from '~/utils/strapi'

export function useCategorias() {
  const { get } = useApi()

  const { data, pending, error } = get('/categorias', {
    'populate': 'icono',
    'pagination[pageSize]': 100,
    sort: 'nombre:asc',
  })

  const categorias = computed(() => data.value?.data?.map(mapCategoria) ?? [])

  return { categorias, pending, error }
}
