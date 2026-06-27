<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-brand-bg-dark px-4 py-12">

    <!-- Logo -->
    <a href="/" class="mb-8">
      <img src="/logo-cielo-horizontal.svg" alt="Mandaditoz" class="h-10 w-auto" />
    </a>

    <div class="w-full max-w-md">
      <div class="card px-8 py-10">

        <!-- Sin código en la URL -->
        <div v-if="!code" class="text-center py-4">
          <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-error/10">
            <ShieldAlert class="size-7 text-error" />
          </div>
          <h1 class="font-display text-xl font-semibold text-brand-text mb-2">Enlace inválido</h1>
          <p class="text-sm text-brand-text-soft mb-6">
            Este enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.
          </p>
          <a href="/login" class="btn-primary inline-flex">
            Volver al inicio de sesión
          </a>
        </div>

        <!-- Contraseña ya restablecida -->
        <div v-else-if="done" class="text-center py-4">
          <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-success/10">
            <ShieldCheck class="size-7 text-success" />
          </div>
          <h1 class="font-display text-xl font-semibold text-brand-text mb-2">¡Contraseña actualizada!</h1>
          <p class="text-sm text-brand-text-soft mb-6">
            Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.
          </p>
          <a href="/login" class="btn-primary inline-flex">
            Iniciar sesión
          </a>
        </div>

        <!-- Formulario -->
        <template v-else>
          <div class="mb-7 text-center">
            <h1 class="font-display text-2xl font-semibold text-brand-text">Nueva contraseña</h1>
            <p class="mt-1.5 text-sm text-brand-text-soft">Elige una contraseña segura para tu cuenta</p>
          </div>

          <form class="space-y-5" @submit.prevent="handleSubmit">

            <div>
              <label for="new-password" class="block text-sm font-medium text-brand-text mb-1.5">
                Nueva contraseña
              </label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
                <input
                  id="new-password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  minlength="8"
                  placeholder="Mínimo 8 caracteres"
                  class="w-full pl-9 pr-10 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-brand-azulgris hover:text-brand-primary transition"
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="size-4" />
                  <EyeOff v-else class="size-4" />
                </button>
              </div>
            </div>

            <div>
              <label for="confirm-password" class="block text-sm font-medium text-brand-text mb-1.5">
                Confirmar contraseña
              </label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
                <input
                  id="confirm-password"
                  v-model="form.passwordConfirmation"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  placeholder="Repite tu contraseña"
                  :class="[
                    'w-full pl-9 pr-3 py-2.5 rounded-lg border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:border-brand-primary transition',
                    passwordMismatch ? 'border-error focus:ring-error/40' : 'border-brand-border focus:ring-brand-primary/40'
                  ]"
                />
              </div>
              <p v-if="passwordMismatch" class="mt-1 text-xs text-error">Las contraseñas no coinciden</p>
            </div>

            <button
              type="submit"
              class="btn-primary w-full justify-center"
              :disabled="passwordMismatch"
            >
              Restablecer contraseña
            </button>
          </form>
        </template>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Lock, Eye, EyeOff, ShieldCheck, ShieldAlert } from '@lucide/vue'
import Swal from 'sweetalert2'

definePageMeta({ layout: false })

const route = useRoute()
const { resetPassword } = useAuth()

const code = route.query.code ?? null
const done = ref(false)
const showPassword = ref(false)
const form = reactive({ password: '', passwordConfirmation: '' })

const passwordMismatch = computed(() =>
  form.passwordConfirmation.length > 0 && form.password !== form.passwordConfirmation
)

async function handleSubmit() {
  if (passwordMismatch.value) return

  Swal.fire({
    title: 'Actualizando contraseña…',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  })

  try {
    await resetPassword({
      code,
      password:             form.password,
      passwordConfirmation: form.passwordConfirmation,
    })
    Swal.close()
    done.value = true
  } catch (e) {
    const msg = e?.data?.error?.message ?? 'No se pudo restablecer la contraseña. El enlace puede haber expirado.'
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#1D5A8A',
    })
  }
}
</script>
