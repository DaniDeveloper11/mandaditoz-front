import { mapNegocio } from '~/utils/strapi'

export function useMisNegocios() {
  const config = useRuntimeConfig()
  const base   = config.public.apiBase
  const { token, user } = useAuthStore()

  const { data, pending, error, refresh } = useFetch(`${base}/businesses/mine`, {
    key: computed(() => `mis-negocios|${user?.id ?? 'anon'}`),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const negocios       = computed(() => data.value?.data?.map(mapNegocio) ?? [])
  const publishedCount = computed(() => data.value?.meta?.publishedCount ?? 0)
  const publishedLimit = computed(() => data.value?.meta?.publishedLimit ?? 3)
  const canPublishMore = computed(() => publishedCount.value < publishedLimit.value)

  return { negocios, publishedCount, publishedLimit, canPublishMore, pending, error, refresh }
}
