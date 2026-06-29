import { mapNegocio } from '~/utils/strapi'

export function useNegocio(slug) {
  const { get } = useApi()

  const { data, pending, error } = get('/businesses', computed(() => ({
    'filters[slug][$eq]': toValue(slug),
    'filters[businessStatus][$eq]': 'published',
    'populate[category]': true,
    'populate[secondaryCategories]': true,
    'populate[logo]': true,
    'populate[coverPhoto]': true,
    'populate[photos][populate]': '*',
    'populate[hours]': true,
    'populate[reviews]': true,
    'populate[phones]': true,
    'populate[socialLinks]': true,
  })))

  const negocio = computed(() => data.value?.data?.[0]
    ? mapNegocio(data.value.data[0])
    : null
  )

  return { negocio, pending, error }
}
