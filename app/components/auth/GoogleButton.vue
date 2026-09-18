<template>
  <div v-if="disponible && !fallo" class="space-y-4">
    <!-- App Android: botón propio. El de Google es un iframe que no existe
         fuera del navegador, así que aquí se dibuja y se llama al plugin. -->
    <button
      v-if="nativo"
      type="button"
      class="btn-secondary w-full flex items-center justify-center gap-2.5 rounded-full"
      :disabled="ocupado"
      @click="entrarNativo"
    >
      <svg class="size-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.27-3.15.76-4.59l-7.98-6.19A23.96 23.96 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      <span>{{ ocupado ? 'Conectando…' : etiqueta }}</span>
    </button>

    <!-- Web: el botón oficial, renderizado por Google dentro de este div. -->
    <div v-else ref="contenedor" class="flex justify-center [color-scheme:light]" />

    <div class="flex items-center gap-3">
      <span class="h-px flex-1 bg-brand-border" />
      <span class="text-xs text-brand-text-soft">o con tu correo</span>
      <span class="h-px flex-1 bg-brand-border" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { safeRedirectPath } from '~/utils/urls'

const props = defineProps({
  // 'signin_with' | 'signup_with' — solo cambia el texto del botón de Google.
  texto: { type: String, default: 'signin_with' },
})

const { disponible, enAppNativa, idTokenNativo, montarBotonWeb, canjear } = useGoogleAuth()
const route = useRoute()

const contenedor = ref(null)
const nativo = ref(false)
const ocupado = ref(false)
// Si Google no carga (red, bloqueador de rastreadores) se esconde la sección
// entera: un separador "o con tu correo" sin nada arriba no se entiende.
const fallo = ref(false)

const etiqueta = computed(() =>
  props.texto === 'signup_with' ? 'Registrarse con Google' : 'Continuar con Google'
)

onMounted(async () => {
  if (!disponible.value) return

  nativo.value = await enAppNativa()
  if (nativo.value) return

  // `nativo` acaba de cambiar: hay que esperar a que Vue pinte el div antes de
  // que Google intente montar su iframe dentro.
  await nextTick()
  if (!contenedor.value) return

  try {
    await montarBotonWeb(contenedor.value, { onToken: entrar, onError: mostrarError, texto: props.texto })
  } catch (e) {
    // Sin botón de Google el formulario de correo sigue ahí, así que esto no
    // bloquea a nadie: se registra y se oculta la sección.
    console.warn('[google] no se pudo montar el botón:', e.message)
    fallo.value = true
  }
})

async function entrarNativo() {
  if (ocupado.value) return
  ocupado.value = true
  try {
    // `entrar` no lanza (atrapa lo suyo y suelta `ocupado`), así que este catch
    // cubre solo la parte nativa: el selector de cuentas de Android.
    await entrar(await idTokenNativo())
  } catch (e) {
    ocupado.value = false
    // Cerrar el selector no es un error que merezca una alerta.
    if (/cancel/i.test(e?.message ?? '')) return
    mostrarError(e)
  }
}

async function entrar(idToken) {
  ocupado.value = true
  Swal.fire({
    title: 'Entrando con Google…',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  })

  try {
    await canjear(idToken)
    Swal.close()
    // Mismo destino validado que el login por correo: sin esto,
    // /login?redirect=https://sitio.malo saca al usuario del sitio.
    navigateTo(safeRedirectPath(route.query.redirect) ?? '/')
  } catch (e) {
    mostrarError(e)
  } finally {
    ocupado.value = false
  }
}

function mostrarError(e) {
  const msg = e?.data?.error?.message ?? e?.message ?? 'No se pudo entrar con Google.'
  Swal.fire({
    icon: 'error',
    title: 'No se pudo entrar con Google',
    text: msg,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#1D5A8A',
  })
}
</script>
