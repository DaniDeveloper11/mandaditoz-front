/**
 * Exige sesión iniciada. Redirige a /login conservando el destino.
 *
 * Solo se aplica en las páginas nuevas vía definePageMeta; las páginas
 * existentes siguen con su verificación en onMounted para no tocarlas.
 */
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuthStore()
  if (!isLoggedIn) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
