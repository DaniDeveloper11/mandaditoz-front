/**
 * Obtiene un `id_token` de Google y lo canjea por la sesión de Mandaditoz.
 *
 * Hay dos formas de conseguir ese token y una sola de canjearlo:
 *
 *   web      → Google Identity Services (script de accounts.google.com)
 *   Android  → @capgo/capacitor-social-login (Credential Manager nativo)
 *   ambos    → POST /api/auth/google  →  { jwt, user }
 *
 * En la app NO se puede usar el script web: Google bloquea OAuth dentro de un
 * WebView (error `disallowed_useragent`), y el flujo de redirects de Strapi
 * (`/api/connect/google`) tampoco tiene a dónde volver desde `https://localhost`.
 * Por eso ahí se pide el token al sistema operativo, que lo firma con el MISMO
 * client id web — así el backend valida los dos casos con una sola regla.
 */

const GIS_SRC = 'https://accounts.google.com/gsi/client'

let gisPromise = null

/** Carga el script de Google una sola vez por pestaña. */
function cargarGis() {
  if (gisPromise) return gisPromise

  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(window.google)

    const s = document.createElement('script')
    s.src = GIS_SRC
    s.async = true
    s.defer = true
    s.onload = () => {
      if (window.google?.accounts?.id) resolve(window.google)
      else reject(new Error('El script de Google cargó pero no expuso accounts.id'))
    }
    s.onerror = () => {
      // Se limpia para que un segundo intento (mala red, bloqueador que el
      // usuario acaba de desactivar) pueda volver a cargarlo.
      gisPromise = null
      reject(new Error('No se pudo cargar Google. Revisa tu conexión.'))
    }
    document.head.appendChild(s)
  })

  return gisPromise
}

export function useGoogleAuth() {
  const config = useRuntimeConfig()
  const clientId = config.public.googleClientId
  const store = useAuthStore()

  /** ¿Se puede ofrecer el botón? Sin client id configurado, no. */
  const disponible = computed(() => !!clientId)

  let esNativo = null
  async function enAppNativa() {
    if (esNativo !== null) return esNativo
    if (typeof window === 'undefined') return (esNativo = false)
    const { Capacitor } = await import('@capacitor/core')
    esNativo = Capacitor.isNativePlatform()
    return esNativo
  }

  /**
   * Android: el plugin nativo abre el selector de cuentas del sistema.
   * La inicialización es idempotente del lado del plugin, pero se memoiza para
   * no pagar el puente JS↔nativo en cada clic.
   */
  let socialLogin = null
  async function pluginNativo() {
    const { SocialLogin } = await import('@capgo/capacitor-social-login')
    if (!socialLogin) {
      await SocialLogin.initialize({ google: { webClientId: clientId } })
      socialLogin = SocialLogin
    }
    return socialLogin
  }

  async function idTokenNativo() {
    const SocialLogin = await pluginNativo()
    const res = await SocialLogin.login({ provider: 'google', options: {} })
    const token = res?.result?.idToken
    if (!token) throw new Error('Google no devolvió un token de identidad.')
    return token
  }

  /**
   * Web: se pide el token con el botón oficial renderizado por Google.
   *
   * `renderButton` (y no `prompt()`) porque One Tap se puede suprimir sin avisar
   * — el usuario que cerró la burbuja tres veces deja de verla durante días — y
   * un botón que a veces no hace nada es peor que no tener botón.
   */
  async function montarBotonWeb(contenedor, { onToken, onError, texto = 'signin_with' } = {}) {
    if (!clientId) return

    const google = await cargarGis()

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (respuesta) => {
        if (respuesta?.credential) onToken?.(respuesta.credential)
        else onError?.(new Error('Google no devolvió un token de identidad.'))
      },
      // La cancelación en un clic ajeno confunde más de lo que ayuda: el usuario
      // que toca fuera del diálogo cree que canceló y vuelve a darle al botón.
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
      context: 'signin',
    })

    google.accounts.id.renderButton(contenedor, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: texto,
      shape: 'pill',
      logo_alignment: 'left',
      locale: 'es',
      // El ancho va en píxeles y Google lo topa en 400. Se mide el contenedor
      // para que el botón no quede más angosto que los campos del formulario.
      width: Math.min(400, Math.round(contenedor.getBoundingClientRect().width) || 320),
    })
  }

  /** Canjea el id_token por el JWT propio y deja la sesión iniciada. */
  async function canjear(idToken) {
    const data = await $fetch(`${config.public.apiBase}/auth/google`, {
      method: 'POST',
      body: { idToken },
    })
    store.setAuth(data.jwt, data.user)
    return data
  }

  return { disponible, enAppNativa, idTokenNativo, montarBotonWeb, canjear }
}
