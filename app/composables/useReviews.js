import { mapReview } from '~/utils/strapi'

export function useReviews(businessDocumentId) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const reviews = ref([])
  const pending = ref(false)
  const error = ref(null)
  const page = ref(1)
  const pageSize = 10
  const total = ref(0)

  async function fetchPage(p) {
    const docId = toValue(businessDocumentId)
    if (!docId) return
    pending.value = true
    error.value = null
    try {
      const res = await $fetch(`${base}/reviews`, {
        query: {
          'filters[business][documentId][$eq]': docId,
          'populate[author][populate][avatar]': true,
          'populate[photos]': true,
          'populate[response][populate][respondedBy]': true,
          sort: 'createdAt:desc',
          'pagination[page]': p,
          'pagination[pageSize]': pageSize,
        },
      })
      const items = (res?.data ?? []).map(mapReview).filter(Boolean)
      if (p === 1) reviews.value = items
      else reviews.value = [...reviews.value, ...items]
      total.value = res?.meta?.pagination?.total ?? items.length
      page.value = p
    } catch (err) {
      error.value = err
    } finally {
      pending.value = false
    }
  }

  const hasMore = computed(() => reviews.value.length < total.value)

  async function refresh() {
    await fetchPage(1)
  }

  async function loadMore() {
    if (hasMore.value && !pending.value) await fetchPage(page.value + 1)
  }

  watch(() => toValue(businessDocumentId), (v) => {
    if (v) refresh()
  }, { immediate: true })

  return { reviews, pending, error, total, hasMore, refresh, loadMore }
}
