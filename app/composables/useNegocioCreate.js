export function useNegocioCreate() {
  const config = useRuntimeConfig()
  const { token } = useAuthStore()

  const loading = ref(false)
  const error = ref(null)

  function authHeaders() {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  function toStrapiTime(t) {
    if (!t) return null
    return t.split(':').length === 2 ? `${t}:00.000` : t
  }

  function slugify(str) {
    return String(str ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
  }

  async function createHours(businessDocumentId, hours) {
    const headers = authHeaders()
    await Promise.all(
      (hours ?? []).map(({ dayOfWeek, openTime, closeTime, isClosed, is24Hours }) =>
        $fetch(`${config.public.apiBase}/business-hours`, {
          method: 'POST',
          headers,
          body: {
            data: {
              business: businessDocumentId,
              dayOfWeek,
              openTime:  toStrapiTime(openTime),
              closeTime: toStrapiTime(closeTime),
              isClosed,
              is24Hours,
            },
          },
        })
      )
    )
  }

  async function createBusiness(data) {
    loading.value = true
    error.value = null
    try {
      const { hours, ...businessData } = data
      if (!businessData.slug && businessData.name) {
        const base = slugify(businessData.name)
        businessData.slug = `${base}-${Date.now().toString(36)}`
      }
      const res = await $fetch(`${config.public.apiBase}/businesses`, {
        method: 'POST',
        headers: authHeaders(),
        body: { data: businessData },
      })

      const created = res?.data ?? res
      const documentId = created?.documentId
      const slug = created?.slug ?? created?.attributes?.slug

      if (documentId && hours?.length) {
        await createHours(documentId, hours)
      }

      return { documentId, slug }
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        await navigateTo('/login?redirect=/negocios/nuevo')
        return
      }
      if (status === 403) {
        error.value = 'Tu cuenta no tiene permiso para crear negocios. Verifica que tengas el rol BusinessOwner.'
      } else if (status === 400) {
        error.value = err?.response?._data?.error?.message ?? 'Hay campos inválidos. Revisa el formulario.'
      } else {
        error.value = 'Ocurrió un error al crear el negocio. Intenta de nuevo.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() { error.value = null }

  return { createBusiness, loading, error, clearError }
}
