export function useAuth() {
  const config = useRuntimeConfig()
  const base   = config.public.apiBase
  const store  = useAuthStore()

  async function register({ username, email, password, displayName, phone }) {
    const body = { username, email, password }
    if (displayName) body.displayName = displayName
    if (phone)       body.phone       = phone

    const data = await $fetch(`${base}/auth/register-owner`, {
      method: 'POST',
      body,
    })
    store.setAuth(data.jwt, data.user)
    return data
  }

  async function login({ identifier, password }) {
    const data = await $fetch(`${base}/auth/local`, {
      method: 'POST',
      body: { identifier, password },
    })
    store.setAuth(data.jwt, data.user)
    return data
  }

  async function forgotPassword(email) {
    const data = await $fetch(`${base}/auth/forgot-password`, {
      method: 'POST',
      body: { email },
    })
    if (!data?.ok) throw new Error('El servidor no confirmó el envío.')
    return data
  }

  async function resetPassword({ code, password, passwordConfirmation }) {
    const data = await $fetch(`${base}/auth/reset-password`, {
      method: 'POST',
      body: { code, password, passwordConfirmation },
    })
    store.setAuth(data.jwt, data.user)
    return data
  }

  return {
    user:        store.user,
    token:       store.token,
    isLoggedIn:  store.isLoggedIn,
    register,
    login,
    forgotPassword,
    resetPassword,
    logout:      store.logout,
  }
}
