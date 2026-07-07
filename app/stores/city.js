import { defineStore } from 'pinia'
import { computed } from 'vue'
import { mapCity } from '~/utils/strapi'

const DEFAULT_CITY = { name: 'Etzatlán', slug: 'etzatlan', stateName: 'Jalisco' }

export const useCityStore = defineStore('city', () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const activeCitySlug = useCookie('city:active', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => DEFAULT_CITY.slug,
  })

  const cities = useState('city:list', () => [])
  const citiesPending = useState('city:pending', () => false)

  async function fetchCities() {
    if (cities.value.length) return
    citiesPending.value = true
    try {
      const res = await $fetch(`${base}/cities`, {
        query: {
          'filters[isActive][$eq]': true,
          'populate[state]': true,
          sort: 'name:asc',
          'pagination[pageSize]': 100,
        },
      })
      cities.value = (res?.data ?? []).map((c) => ({
        ...mapCity(c),
        stateName: c.state?.name ?? null,
      }))
    } finally {
      citiesPending.value = false
    }
  }

  const activeCity = computed(() => {
    const match = cities.value.find(c => c.slug === activeCitySlug.value)
    if (match) return match
    return { ...DEFAULT_CITY, id: null, documentId: null }
  })

  const activeCityName = computed(() => activeCity.value?.name ?? DEFAULT_CITY.name)
  const activeCityState = computed(() => activeCity.value?.stateName ?? DEFAULT_CITY.stateName)
  const activeCityLabel = computed(() =>
    activeCityState.value
      ? `${activeCityName.value}, ${activeCityState.value}`
      : activeCityName.value,
  )

  function setActiveCity(slug) {
    activeCitySlug.value = slug
  }

  return {
    activeCitySlug,
    activeCity,
    activeCityName,
    activeCityState,
    activeCityLabel,
    cities,
    citiesPending,
    fetchCities,
    setActiveCity,
  }
})
