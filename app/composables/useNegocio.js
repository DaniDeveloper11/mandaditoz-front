import { mapNegocio } from '~/utils/strapi'

export function useNegocio(slug) {
  const { get } = useApi()

  const { data, pending, error } = get('/businesses', computed(() => ({
    'filters[slug][$eq]': toValue(slug),
    'filters[status][$eq]': 'published',
    'populate[0]': 'category',
    'populate[1]': 'logo',
    'populate[2]': 'coverPhoto',
    'populate[3]': 'photos',
    'populate[4]': 'hours',
    'populate[5]': 'reviews',
  })))

  const negocio = computed(() => data.value?.data?.[0]
    ? mapNegocio(data.value.data[0])
    : null
  )

  return { negocio, pending, error }
}
