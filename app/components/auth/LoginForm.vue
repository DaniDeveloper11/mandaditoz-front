<template>
  <div>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div>
      <label for="email" class="block text-sm font-medium text-brand-text mb-1.5">
        Correo electrónico
      </label>
      <div class="relative">
        <Mail class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          placeholder="tu@correo.com"
          class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
        />
      </div>
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-brand-text mb-1.5">
        Contraseña
      </label>
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          required
          placeholder="••••••••"
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

    <div class="flex items-center justify-between">
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input
          v-model="form.remember"
          type="checkbox"
          class="rounded border-brand-border text-brand-primary focus:ring-brand-primary/40"
        />
        <span class="text-sm text-brand-text-soft">Recordarme</span>
      </label>
      <button
        type="button"
        class="text-sm font-medium text-brand-primary hover:text-brand-primary-dark transition"
        @click="$emit('change-mode', 'forgot')"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </div>

    <button type="submit" class="btn-primary w-full justify-center">
      Iniciar sesión
    </button>
  </form>

  <p class="mt-6 text-center text-sm text-brand-text-soft">
    ¿No tienes cuenta?
    <button
      class="font-semibold text-brand-primary hover:text-brand-primary-dark transition ml-1"
      @click="$emit('change-mode', 'register')"
    >
      Regístrate gratis
    </button>
  </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Mail, Lock, Eye, EyeOff } from '@lucide/vue'
import Swal from 'sweetalert2'

defineEmits(['change-mode'])

const { login } = useAuth()
const route = useRoute()

const showPassword = ref(false)
const form = reactive({ email: '', password: '', remember: false })

async function handleSubmit() {
  Swal.fire({
    title: 'Iniciando sesión…',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  })

  try {
    await login({ identifier: form.email, password: form.password })
    Swal.close()
    navigateTo(route.query.redirect ?? '/')
  } catch (e) {
    const msg = e?.data?.error?.message ?? 'Correo o contraseña incorrectos.'
    Swal.fire({
      icon: 'error',
      title: 'Error al iniciar sesión',
      text: msg,
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: '#1D5A8A',
    })
  }
}
</script>
