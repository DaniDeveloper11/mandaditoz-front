export function useUpload() {
  const config = useRuntimeConfig()

  const uploading = ref(false)
  const error = ref(null)

  // apiBase = "http://localhost:1337/api" → apiOrigin = "http://localhost:1337"
  const apiOrigin = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')

  function absolutizeUrl(url) {
    if (!url) return url
    if (/^https?:\/\//i.test(url)) return url
    return `${apiOrigin}${url.startsWith('/') ? '' : '/'}${url}`
  }

  async function uploadFile(file) {
    uploading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('files', file)
      const res = await $fetch(`${config.public.apiBase}/upload`, {
        method: 'POST',
        body: formData,
      })
      const first = Array.isArray(res) ? res[0] : res
      if (!first?.id) throw new Error('Respuesta de upload inválida')
      return {
        id: first.id,
        url: absolutizeUrl(first.url),
        name: first.name,
        size: first.size,
        mime: first.mime,
      }
    } catch (err) {
      error.value = 'No se pudo subir el archivo. Intenta con uno más pequeño.'
      throw err
    } finally {
      uploading.value = false
    }
  }

  return { uploadFile, uploading, error }
}
