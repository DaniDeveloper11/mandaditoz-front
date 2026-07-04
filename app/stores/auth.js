import { defineStore } from 'pinia'
import { computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie('auth:token', {
    maxAge: 60 * 60 * 24 * 7, // 7 días
    secure: import.meta.env.PROD,
    sameSite: 'lax',
  })

  const user = useCookie('auth:user', {
    maxAge: 60 * 60 * 24 * 7,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    default: () => null,
  })

  const isLoggedIn = computed(() => !!token.value)

  function setAuth(jwt, userData) {
    token.value = jwt
    user.value  = userData
  }

  function logout() {
    token.value = null
    user.value  = null
  }

  return { token, user, isLoggedIn, setAuth, logout }
})
