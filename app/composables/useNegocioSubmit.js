export function useNegocioSubmit() {
  const config = useRuntimeConfig()

  const loading = ref(false)
  const error = ref(null)

  function toStrapiTime(t) {
    if (!t) return null
    return t.split(':').length === 2 ? `${t}:00.000` : t
  }

  async function submit(data) {
    loading.value = true
    error.value = null
    try {
      const { hours, ...businessData } = data
      const payload = {
        ...businessData,
        hours: (hours ?? []).map(h => ({
          dayOfWeek: h.dayOfWeek,
          openTime:  toStrapiTime(h.openTime),
          closeTime: toStrapiTime(h.closeTime),
          isClosed:  h.isClosed,
          is24Hours: h.is24Hours,
        })),
      }

      const res = await $fetch(`${config.public.apiBase}/businesses/submit`, {
        method: 'POST',
        body: { data: payload },
      })

      return { documentId: res?.documentId ?? null }
    } catch (err) {
      const status = err?.response?.status
      if (status === 400) {
        error.value = err?.response?._data?.error?.message ?? 'Hay campos inválidos. Revisa el formulario.'
      } else {
        error.value = 'Ocurrió un error al enviar la solicitud. Intenta de nuevo.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() { error.value = null }

  return { submit, loading, error, clearError }
}
