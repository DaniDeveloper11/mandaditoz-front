export function useClaimInvite(token) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase
  const store = useAuthStore()

  /**
   * Estado de la invitación: valid | expired | used | not_found.
   * El backend nunca devuelve el token ni el teléfono completo.
   */
  function fetchInvite() {
    return $fetch(`${base}/claims/invite/${encodeURIComponent(toValue(token))}`)
  }

  /**
   * Canjea la invitación: crea (o reutiliza) la cuenta y deja el reclamo en
   * revisión. Devuelve JWT, así que la sesión queda iniciada aunque el negocio
   * todavía no sea suyo — lo será cuando el admin apruebe.
   */
  async function redeem({ email, password, displayName }) {
    const data = await $fetch(`${base}/claims/invite/${encodeURIComponent(toValue(token))}/redeem`, {
      method: 'POST',
      body: { email, password, displayName },
    })
    store.setAuth(data.jwt, data.user)
    return data
  }

  return { fetchInvite, redeem }
}
