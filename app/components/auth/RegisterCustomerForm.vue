<template>
  <div>
    <form class="space-y-4" @submit.prevent="handleSubmit">

      <!-- Nombre -->
      <div>
        <label for="cust-name" class="block text-sm font-medium text-brand-text mb-1.5">
          ¿Cómo te llamas? <span class="text-error">*</span>
        </label>
        <div class="relative">
          <User class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="cust-name"
            v-model="form.displayName"
            type="text"
            autocomplete="name"
            required
            placeholder="Juan Pérez"
            class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
        </div>
      </div>

      <!-- WhatsApp -->
      <div>
        <label for="cust-phone" class="block text-sm font-medium text-brand-text mb-1.5">
          Tu WhatsApp <span class="text-error">*</span>
        </label>
        <div class="relative">
          <Phone class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="cust-phone"
            v-model="form.phone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            required
            placeholder="331 234 5678"
            class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
        </div>
        <p class="mt-1 text-xs text-brand-text-soft">
          A este número te va a escribir el negocio.
        </p>
      </div>

      <!-- Correo -->
      <div>
        <label for="cust-email" class="block text-sm font-medium text-brand-text mb-1.5">
          Correo electrónico <span class="text-error">*</span>
        </label>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="cust-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            placeholder="tu@correo.com"
            class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
        </div>
        <p class="mt-1 text-xs text-brand-text-soft">
          Solo para recuperar tu cuenta. No tienes que confirmarlo ahora.
        </p>
      </div>

      <!-- Contraseña -->
      <div>
        <label for="cust-password" class="block text-sm font-medium text-brand-text mb-1.5">
          Contraseña <span class="text-error">*</span>
        </label>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="cust-password"
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

      <button type="submit" class="btn-primary w-full justify-center mt-1" :disabled="submitting">
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

    <div class="mt-5 pt-5 border-t border-brand-border text-center">
      <p class="text-sm text-brand-text-soft">
        ¿Tienes un negocio y quieres publicarlo?
      </p>
      <button
        class="mt-1 text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition"
        @click="$emit('change-mode', 'register-owner')"
      >
        Crear cuenta de negocio
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Phone, Mail, Lock, Eye, EyeOff } from '@lucide/vue'
import Swal from 'sweetalert2'

defineEmits(['change-mode'])

const { registerCustomer } = useAuth()
const route = useRoute()

const showPassword = ref(false)
const submitting = ref(false)
const form = reactive({ displayName: '', phone: '', email: '', password: '' })

async function handleSubmit() {
  // Validación local del teléfono para no gastar un viaje al servidor por un
  // número incompleto, que es el error más común en móvil.
  const digits = form.phone.replace(/\D/g, '')
  if (digits.length < 10) {
    Swal.fire({
      icon: 'warning',
      title: 'Revisa tu WhatsApp',
      text: 'Escribe los 10 dígitos de tu número, con lada.',
      confirmButtonText: 'Corregir',
      confirmButtonColor: '#1D5A8A',
    })
    return
  }

  submitting.value = true
  Swal.fire({
    title: 'Creando tu cuenta…',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  })

  try {
    await registerCustomer({
      displayName: form.displayName.trim(),
      phone: form.phone,
      email: form.email.trim(),
      password: form.password,
    })

    Swal.close()
    // Ya quedó con sesión iniciada: se le devuelve justo a donde iba.
    navigateTo(route.query.redirect ?? '/')
  } catch (e) {
    const msg = e?.data?.error?.message ?? 'No se pudo crear la cuenta. Intenta de nuevo.'
    Swal.fire({
      icon: 'error',
      title: 'No se pudo registrar',
      text: msg,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#1D5A8A',
    })
  } finally {
    submitting.value = false
  }
}
</script>
