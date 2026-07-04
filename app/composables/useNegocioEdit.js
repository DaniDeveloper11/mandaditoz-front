export function useNegocioEdit() {
  const config = useRuntimeConfig()
  const { token } = useAuthStore()

  const loading = ref(false)
  const error = ref(null)

  function authHeaders() {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function update(documentId, data) {
    return $fetch(`${config.public.apiBase}/businesses/${documentId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: { data },
    })
  }

  function toStrapiTime(t) {
    if (!t) return null
    // "HH:mm" → "HH:mm:ss.SSS"
    return t.split(':').length === 2 ? `${t}:00.000` : t
  }

  async function updateHours(businessDocumentId, hours) {
    const headers = authHeaders()
    await Promise.all(
      hours.map(({ documentId, openTime, closeTime, ...fields }) => {
        const data = {
          ...fields,
          openTime:  toStrapiTime(openTime),
          closeTime: toStrapiTime(closeTime),
        }
        if (documentId) {
          return $fetch(`${config.public.apiBase}/business-hours/${documentId}`, {
            method: 'PUT',
            headers,
            body: { data },
          })
        }
        return $fetch(`${config.public.apiBase}/business-hours`, {
          method: 'POST',
          headers,
          body: { data: { ...data, business: businessDocumentId } },
        })
      })
    )
  }

  async function updateBusiness(documentId, data) {
    loading.value = true
    error.value = null
    try {
      const { hours, ...businessData } = data
      await Promise.all([
        update(documentId, businessData),
        updateHours(documentId, hours ?? []),
      ])
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        await navigateTo('/login')
        return
      }
      if (status === 403) {
        error.value = 'No tienes permiso para editar este negocio'
      } else if (status === 404) {
        error.value = 'Negocio no encontrado'
      } else {
        error.value = 'Ocurrió un error al guardar los cambios'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return { updateBusiness, loading, error, clearError }
}
