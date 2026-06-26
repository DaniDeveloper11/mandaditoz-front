<template>
  <div>
    <form class="space-y-4" @submit.prevent="handleSubmit">

      <!-- Username -->
      <div>
        <label for="username" class="block text-sm font-medium text-brand-text mb-1.5">
          Nombre de usuario <span class="text-error">*</span>
        </label>
        <div class="relative">
          <AtSign class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="username"
            v-model="form.username"
            type="text"
            autocomplete="username"
            required
            placeholder="juanperez"
            class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
        </div>
      </div>

      <!-- Display name (opcional) -->
      <div>
        <label for="displayName" class="block text-sm font-medium text-brand-text mb-1.5">
          Nombre completo <span class="text-brand-azulgris text-xs">(opcional)</span>
        </label>
        <div class="relative">
          <User class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="displayName"
            v-model="form.displayName"
            type="text"
            autocomplete="name"
            placeholder="Juan Pérez"
            class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
        </div>
      </div>

      <!-- Email -->
      <div>
        <label for="reg-email" class="block text-sm font-medium text-brand-text mb-1.5">
          Correo electrónico <span class="text-error">*</span>
        </label>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="reg-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            placeholder="tu@correo.com"
            class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
        </div>
      </div>

      <!-- Teléfono (opcional) -->
      <div>
        <label for="phone" class="block text-sm font-medium text-brand-text mb-1.5">
          Teléfono <span class="text-brand-azulgris text-xs">(opcional)</span>
        </label>
        <div class="relative">
          <Phone class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            autocomplete="tel"
            placeholder="+523312345678"
            class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
        </div>
      </div>

      <!-- Contraseña -->
      <div>
        <label for="reg-password" class="block text-sm font-medium text-brand-text mb-1.5">
          Contraseña <span class="text-error">*</span>
        </label>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="reg-password"
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

      <!-- Confirmar contraseña -->
      <div>
        <label for="confirm-password" class="block text-sm font-medium text-brand-text mb-1.5">
          Confirmar contraseña <span class="text-error">*</span>
        </label>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="confirm-password"
            v-model="form.confirmPassword"
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
        class="btn-primary w-full justify-center mt-1"
        :disabled="passwordMismatch"
      >
        Crear cuenta
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-brand-text-soft">
      ¿Ya tienes cuenta?
      <button
        class="font-semibold text-brand-primary hover:text-brand-primary-dark transition ml-1"
        @click="$emit('change-mode', 'login')"
      >
        Inicia sesión
      </button>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { AtSign, User, Mail, Phone, Lock, Eye, EyeOff } from '@lucide/vue'
import Swal from 'sweetalert2'

defineEmits(['change-mode'])

const { register } = useAuth()

const showPassword = ref(false)
const form = reactive({
  username: '',
  displayName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const passwordMismatch = computed(() =>
  form.confirmPassword.length > 0 && form.password !== form.confirmPassword
)

async function handleSubmit() {
  if (passwordMismatch.value) return

  Swal.fire({
    title: 'Creando cuenta…',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  })

  try {
    await register({
      username:    form.username,
      email:       form.email,
      password:    form.password,
      displayName: form.displayName || undefined,
      phone:       form.phone       || undefined,
    })

    await Swal.fire({
      icon: 'success',
      title: '¡Cuenta creada!',
      text: `Bienvenido, ${form.displayName || form.username}. Tu cuenta fue registrada correctamente.`,
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#1D5A8A',
    })

    navigateTo('/')
  } catch (e) {
    const msg = e?.data?.error?.message ?? 'Error al crear la cuenta. Intenta de nuevo.'
    Swal.fire({
      icon: 'error',
      title: 'No se pudo registrar',
      text: msg,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#1D5A8A',
    })
  }
}
</script>
