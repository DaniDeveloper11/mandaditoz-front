import { mapMenuSection, mapMenuItem, mapMedia } from '~/utils/strapi'

/**
 * CRUD del menú estructurado para el panel del dueño.
 *
 * Guardado por entidad (POST/PUT inmediato), no un formulario gigante: es lo
 * coherente con los toggles inline de disponibilidad, que son la operación más
 * frecuente del día.
 *
 * Ojo: useApi() no manda header de auth. Todo lo autenticado va con $fetch
 * explícito, igual que en useNegocioEdit.js.
 */
export function useMenuEdit() {
  const config = useRuntimeConfig()
  const { token } = useAuthStore()

  const base = config.public.apiBase

  function authHeaders() {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Trae el menú completo de un negocio, incluidas las secciones inactivas
   * (el dueño necesita verlas para reactivarlas). Excluye las archivadas.
   */
  async function fetchMenu(businessDocumentId) {
    const res = await $fetch(`${base}/menu-sections`, {
      headers: authHeaders(),
      query: {
        'filters[business][documentId][$eq]': businessDocumentId,
        'filters[archivedAt][$null]': true,
        'populate[items][populate]': 'photo',
        'sort': 'order:asc',
        'pagination[pageSize]': 100,
      },
    })

    return (res?.data ?? [])
      .map(section => mapMenuSection(section, { includeInactive: true }))
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)
  }

  // ---- Secciones ----

  async function createSection(businessDocumentId, { name, description = null, order = 0 }) {
    const res = await $fetch(`${base}/menu-sections`, {
      method: 'POST',
      headers: authHeaders(),
      body: { data: { name, description, order, isActive: true, business: businessDocumentId } },
    })
    return mapMenuSection({ ...res.data, items: [] }, { includeInactive: true })
  }

  async function updateSection(documentId, data) {
    const res = await $fetch(`${base}/menu-sections/${documentId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: { data },
    })
    return res?.data ?? null
  }

  /** Borra la sección. El backend borra sus platillos en cascada. */
  async function deleteSection(documentId) {
    await $fetch(`${base}/menu-sections/${documentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  }

  // ---- Platillos ----

  async function createItem(sectionDocumentId, { name, description = null, price, order = 0, photoId = null }) {
    const data = {
      name,
      description,
      price,
      order,
      isAvailable: true,
      section: sectionDocumentId,
    }
    if (photoId) data.photo = photoId

    // Sin `populate` la respuesta del POST no trae la relación `photo`, y el
    // platillo aparecería sin imagen hasta recargar la página.
    const res = await $fetch(`${base}/menu-items`, {
      method: 'POST',
      headers: authHeaders(),
      query: { populate: 'photo' },
      body: { data },
    })
    return mapMenuItem(res.data)
  }

  /** Devuelve el platillo ya mapeado, con la foto poblada (ver nota en createItem). */
  async function updateItem(documentId, data) {
    const res = await $fetch(`${base}/menu-items/${documentId}`, {
      method: 'PUT',
      headers: authHeaders(),
      query: { populate: 'photo' },
      body: { data },
    })
    return res?.data ? mapMenuItem(res.data) : null
  }

  async function deleteItem(documentId) {
    await $fetch(`${base}/menu-items/${documentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  }

  /** Sube una imagen y devuelve { id, url } para asignarla a un platillo. */
  async function uploadPhoto(file) {
    const fd = new FormData()
    fd.append('files', file)
    const result = await $fetch(`${base}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: fd,
    })
    const uploaded = Array.isArray(result) ? result[0] : result
    return { id: uploaded.id, ...mapMedia(uploaded) }
  }

  return {
    fetchMenu,
    createSection, updateSection, deleteSection,
    createItem, updateItem, deleteItem,
    uploadPhoto,
  }
}
