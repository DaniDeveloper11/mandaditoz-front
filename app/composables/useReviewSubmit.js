export function useReviewSubmit() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase
  const auth = useAuthStore()

  function authHeaders() {
    if (!auth.token) throw new Error('No autenticado')
    return { Authorization: `Bearer ${auth.token}` }
  }

  async function createReview({ businessDocumentId, rating, title, comment, visitDate, photoIds }) {
    try {
      const res = await $fetch(`${base}/reviews`, {
        method: 'POST',
        headers: authHeaders(),
        body: {
          data: {
            business: businessDocumentId,
            rating,
            title: title || null,
            comment,
            visitDate: visitDate || null,
            photos: photoIds?.length ? photoIds : undefined,
          },
        },
      })
      return { ok: true, data: res?.data }
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      const details = err?.response?._data?.error?.details
      if (status === 409 && details?.existingDocumentId) {
        return { ok: false, conflict: true, existingDocumentId: details.existingDocumentId }
      }
      throw err
    }
  }

  // Sin cuenta: pega al endpoint publico. Entra como 'pending' y no aparece
  // en la ficha hasta que un admin la apruebe.
  async function createGuestReview({ businessDocumentId, rating, title, comment, visitDate, photoIds, guestName, guestEmail, website }) {
    try {
      const res = await $fetch(`${base}/reviews/submit`, {
        method: 'POST',
        body: {
          data: {
            business: businessDocumentId,
            rating,
            title: title || null,
            comment,
            visitDate: visitDate || null,
            photos: photoIds?.length ? photoIds : undefined,
            guestName,
            guestEmail: guestEmail || null,
            website: website || '',
          },
        },
      })
      return { ok: true, pending: true, data: res }
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 409) return { ok: false, conflict: true }
      if (status === 429) return { ok: false, rateLimited: true }
      throw err
    }
  }

  async function updateReview(documentId, { rating, title, comment, visitDate, photoIds }) {
    const res = await $fetch(`${base}/reviews/${documentId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: {
        data: {
          rating,
          title: title || null,
          comment,
          visitDate: visitDate || null,
          photos: photoIds?.length ? photoIds : [],
        },
      },
    })
    return res?.data
  }

  async function deleteReview(documentId) {
    await $fetch(`${base}/reviews/${documentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    return true
  }

  async function respondToReview(documentId, message) {
    const res = await $fetch(`${base}/reviews/${documentId}/respond`, {
      method: 'PUT',
      headers: authHeaders(),
      body: { data: { message } },
    })
    return res?.data
  }

  return { createReview, createGuestReview, updateReview, deleteReview, respondToReview }
}
