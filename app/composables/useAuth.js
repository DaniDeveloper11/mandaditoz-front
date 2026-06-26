export function useAuth() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const user  = useState('auth:user',  () => null)
  const token = useState('auth:token', () => null)

  async function register({ username, email, password, displayName, phone }) {
    const body = { username, email, password }
    if (displayName) body.displayName = displayName
    if (phone)       body.phone       = phone

    const data = await $fetch(`${base}/auth/register-owner`, {
      method: 'POST',
      body,
    })
    token.value = data.jwt
    user.value  = data.user
    return data
  }

  async function login({ identifier, password }) {
    const data = await $fetch(`${base}/auth/local`, {
      method: 'POST',
      body: { identifier, password },
    })
    token.value = data.jwt
    user.value  = data.user
    return data
  }

  async function forgotPassword(email) {
    return $fetch(`${base}/auth/forgot-password`, {
      method: 'POST',
      body: { email },
    })
  }

  function logout() {
    user.value  = null
    token.value = null
  }

  const isLoggedIn = computed(() => !!token.value)

  return { user, token, isLoggedIn, register, login, forgotPassword, logout }
}
