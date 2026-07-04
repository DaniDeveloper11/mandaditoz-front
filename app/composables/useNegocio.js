import { mapNegocio } from '~/utils/strapi'

export function useNegocio(slug, options = {}) {
  const { get } = useApi()
  const includeDrafts = options.includeDrafts ?? false

  const { data, pending, error } = get('/businesses', computed(() => ({
    'filters[slug][$eq]': toValue(slug),
    ...(!includeDrafts && { 'filters[businessStatus][$eq]': 'published' }),
    'populate[category]': true,
    'populate[secondaryCategories]': true,
    'populate[city]': true,
    'populate[neighborhood]': true,
    'populate[tags]': true,
    'populate[geo]': true,
    'populate[address]': true,
    'populate[logo]': true,
    'populate[coverPhoto]': true,
    'populate[photos][populate]': '*',
    'populate[hours]': true,
    'populate[hourExceptions]': true,
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
