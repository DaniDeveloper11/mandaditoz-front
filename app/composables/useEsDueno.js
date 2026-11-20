/**
 * ¿El usuario con sesión es dueño del negocio `slug`? `null` mientras no se
 * sabe (servidor, o la petición en curso), luego true/false.
 *
 * Se resuelve contra GET /businesses/mine porque la API no expone el `owner`
 * de un negocio. Mismo criterio que checkOwnership en BusinessDetailPage.
 * El backend es quien protege de verdad (policy is-owner): esto solo evita
 * pintarle el editor o el estado de un negocio ajeno a quien no es su dueño.
 */
export function useEsDueno(slug) {
  const { token } = useAuthStore()
  const esDueno = ref(null)

  async function comprobar() {
    if (!import.meta.client) return
    if (!token || !toValue(slug)) { esDueno.value = false; return }
    try {
      const res = await $fetch(`${useRuntimeConfig().public.apiBase}/businesses/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      esDueno.value = (res?.data ?? []).some(n => n?.slug === toValue(slug))
    } catch {
      esDueno.value = false
    }
  }

  onMounted(comprobar)
  watch(() => toValue(slug), comprobar)

  return esDueno
}
