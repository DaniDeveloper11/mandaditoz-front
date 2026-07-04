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

  async function uploadFile(file) {
    const fd = new FormData()
    fd.append('files', file)
    const result = await $fetch(`${config.public.apiBase}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: fd,
    })
    return Array.isArray(result) ? result[0] : result
  }

  async function syncPhotos(businessDocumentId, photos = { current: [], toDelete: [] }) {
    const headers = authHeaders()
    const { current = [], toDelete = [] } = photos

    await Promise.all(
      toDelete.map(docId =>
        $fetch(`${config.public.apiBase}/photos/${docId}`, { method: 'DELETE', headers })
      )
    )

    await Promise.all(current.map(async (photo, index) => {
      if (photo.isNew && photo.file) {
        const uploaded = await uploadFile(photo.file)
        await $fetch(`${config.public.apiBase}/photos`, {
          method: 'POST',
          headers,
          body: {
            data: {
              business: businessDocumentId,
              file: uploaded.id,
              order: index,
              caption: photo.alternativeText || null,
            },
          },
        })
      } else if (photo.documentId && photo.order !== index) {
        await $fetch(`${config.public.apiBase}/photos/${photo.documentId}`, {
          method: 'PUT',
          headers,
          body: { data: { order: index } },
        })
      }
    }))
  }

  async function syncMenu(menu) {
    if (!menu) return {}

    const payload = {}

    // PDF
    if (menu.pdf?.remove) {
      payload.menuPdf = null
    } else if (menu.pdf?.file) {
      const uploaded = await uploadFile(menu.pdf.file)
      payload.menuPdf = uploaded.id
    }

    // Imágenes
    if (Array.isArray(menu.images)) {
      const ids = []
      for (const img of menu.images) {
        if (img.isNew && img.file) {
          const uploaded = await uploadFile(img.file)
          ids.push(uploaded.id)
        } else if (img.id) {
          ids.push(img.id)
        }
      }
      payload.menuImages = ids
    }

    return payload
  }

  async function updateBusiness(documentId, data) {
    loading.value = true
    error.value = null
    try {
      const { hours, photos, menu, ...businessData } = data
      const menuPayload = await syncMenu(menu)
      await Promise.all([
        update(documentId, { ...businessData, ...menuPayload }),
        updateHours(documentId, hours ?? []),
        syncPhotos(documentId, photos),
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
