import { mapCity } from '~/utils/strapi'

/** Trae ciudades activas para pickers/filtros. */
export function useCiudades(limit = 50) {
  const { get } = useApi()

  const { data, pending, error } = get('/cities', {
    'filters[isActive][$eq]': true,
    'populate[state]': true,
    sort: 'name:asc',
    'pagination[pageSize]': limit,
  })

  const ciudades = computed(() => data.value?.data?.map(mapCity) ?? [])

  return { ciudades, pending, error }
}
