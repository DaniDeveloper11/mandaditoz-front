import { mapTag } from '~/utils/strapi'

/**
 * Trae tags activos, opcionalmente filtrados por texto (autocomplete).
 * Ordenados por popularidad (businessCount desc) y luego alfabético.
 */
export function useTags(query = '') {
  const { get } = useApi()

  const { data, pending, error } = get('/tags', computed(() => {
    const q = toValue(query)
    return {
      'filters[isActive][$eq]': true,
      ...(q && { 'filters[name][$containsi]': q }),
      sort: 'businessCount:desc,name:asc',
      'pagination[pageSize]': 100,
    }
  }))

  const tags = computed(() => data.value?.data?.map(mapTag) ?? [])

  return { tags, pending, error }
}
