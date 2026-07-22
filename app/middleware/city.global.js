export default defineNuxtRouteMiddleware((to) => {
  const raw = to.query.ciudad ?? to.query.city
  if (typeof raw !== 'string') return
  const slug = raw.trim().toLowerCase()
  if (!slug) return

  const cityStore = useCityStore()
  if (cityStore.activeCitySlug !== slug) {
    cityStore.setActiveCity(slug)
  }
})
