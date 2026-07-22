export default defineNuxtRouteMiddleware((to) => {
  const raw = to.query.ciudad ?? to.query.city
  if (typeof raw !== 'string') return
  const slug = raw.trim().toLowerCase()
  if (!slug) return

  const cookie = useCookie('city:active', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  if (cookie.value !== slug) cookie.value = slug
})
