/**
 * Lee estadísticas agregadas de un negocio. Requiere ser owner.
 * range: '7d' | '30d' | '90d'
 */
export function useBusinessStats(documentId, options = {}) {
  const config = useRuntimeConfig()
  const { token } = useAuthStore()
  const range = options.range ?? '30d'

  const counts = ref({ profile_view: 0, phone_click: 0, whatsapp_click: 0 })
  const pending = ref(false)
  const error = ref(null)

  async function refresh() {
    const id = toValue(documentId)
    if (!id || !token) return
    pending.value = true
    error.value = null
    try {
      const res = await $fetch(`${config.public.apiBase}/business-events/stats/${id}`, {
        query: { range },
        headers: { Authorization: `Bearer ${token}` },
      })
      counts.value = { ...counts.value, ...(res?.data?.counts ?? {}) }
    } catch (err) {
      error.value = err
    } finally {
      pending.value = false
    }
  }

  watch(() => toValue(documentId), (id) => { if (id) refresh() }, { immediate: true })

  return { counts, pending, error, refresh }
}
