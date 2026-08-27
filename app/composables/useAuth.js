export function useAuth() {
  const config = useRuntimeConfig()
  const base   = config.public.apiBase
  const store  = useAuthStore()

  async function register({ username, email, password, displayName, phone }) {
    const body = { username, email, password }
    if (displayName) body.displayName = displayName
    if (phone)       body.phone       = phone

    return await $fetch(`${base}/auth/register-owner`, {
      method: 'POST',
      body,
    })
  }

  /**
   * Registro exprés de comensal: nombre, WhatsApp, correo y contraseña.
   * A diferencia de `register` (dueño de negocio), esta ruta devuelve el JWT
   * de una vez y deja la sesión iniciada — el comensal se registra a medio
   * pedido y mandarlo a confirmar el correo antes de seguir mata la venta.
   */
  async function registerCustomer({ displayName, phone, email, password }) {
    const data = await $fetch(`${base}/auth/register-customer`, {
      method: 'POST',
      body: { displayName, phone, email, password },
    })
    store.setAuth(data.jwt, data.user)
    return data
  }

  /**
   * Relee el usuario del servidor. Necesario después de publicar un negocio:
   * el backend asciende el rol a BusinessOwner y la copia en la cookie
   * se queda con el rol viejo.
   */
  async function refreshUser() {
    if (!store.token) return null
    const me = await $fetch(`${base}/users/me`, {
      headers: { Authorization: `Bearer ${store.token}` },
    })
    store.setAuth(store.token, me)
    return me
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
    registerCustomer,
    refreshUser,
    login,
    forgotPassword,
    resetPassword,
    logout:      store.logout,
  }
}
