import { mapNegocio } from '~/utils/strapi'

export function useNegocio(slug) {
  const { get } = useApi()

  const { data, pending, error } = get('/negocios', computed(() => ({
    'filters[slug][$eq]': toValue(slug),
    'populate': 'categoria,logo,fotos,horarios,resenas',
  })))

  const negocio = computed(() => data.value?.data?.[0]
    ? mapNegocio(data.value.data[0])
    : null
  )

  return { negocio, pending, error }
}
