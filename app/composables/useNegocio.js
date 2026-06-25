import { mapNegocio } from '~/utils/strapi'

export function useNegocio(slug) {
  const { get } = useApi()

  const { data, pending, error } = get('/businesses', computed(() => ({
    'filters[slug][$eq]': toValue(slug),
    'filters[status][$eq]': 'published',
    populate: 'category,logo,coverPhoto,photos,hours,reviews',
  })))

  const negocio = computed(() => data.value?.data?.[0]
    ? mapNegocio(data.value.data[0])
    : null
  )

  return { negocio, pending, error }
}
