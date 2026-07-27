const SESSION_KEY = 'mzz:session-id'

function getOrCreateSessionId() {
  if (!import.meta.client) return null
  try {
    let sid = window.localStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = (crypto?.randomUUID?.() ?? `sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`)
      window.localStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    return `anon_${Date.now().toString(36)}`
  }
}

/**
 * Composable para registrar eventos de tráfico por negocio.
 * El backend deduplica por (business, type, sessionId) en ventana de 30 min.
 */
export function useBusinessEvents() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  async function track(businessDocumentId, type) {
    if (!import.meta.client || !businessDocumentId || !type) return
    const sessionId = getOrCreateSessionId()
    if (!sessionId) return
    try {
      await $fetch(`${base}/business-events`, {
        method: 'POST',
        body: { data: { business: businessDocumentId, type, sessionId } },
      })
    } catch (err) {
      if (import.meta.dev) console.warn('[track]', type, err?.message)
    }
  }

  return { track }
}
