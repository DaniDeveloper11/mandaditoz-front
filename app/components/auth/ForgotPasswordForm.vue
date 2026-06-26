<template>
  <div>
  <div v-if="sent" class="text-center py-4">
    <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-primary/10">
      <MailCheck class="size-7 text-brand-primary" />
    </div>
    <h3 class="font-display text-lg font-semibold text-brand-text mb-2">Revisa tu correo</h3>
    <p class="text-sm text-brand-text-soft mb-6">
      Si existe una cuenta con <span class="font-medium text-brand-text">{{ sentEmail }}</span>,
      recibirás un enlace para restablecer tu contraseña.
    </p>
    <button
      class="text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition"
      @click="$emit('change-mode', 'login')"
    >
      Volver al inicio de sesión
    </button>
  </div>

  <div v-else>
    <p class="text-sm text-brand-text-soft mb-5">
      Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
    </p>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div>
        <label for="forgot-email" class="block text-sm font-medium text-brand-text mb-1.5">
          Correo electrónico
        </label>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
          <input
            id="forgot-email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="tu@correo.com"
            class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
          />
        </div>
      </div>

      <button type="submit" class="btn-primary w-full justify-center">
        Enviar enlace
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-brand-text-soft">
      <button
        class="font-semibold text-brand-primary hover:text-brand-primary-dark transition"
        @click="$emit('change-mode', 'login')"
      >
        ← Volver al inicio de sesión
      </button>
    </p>
  </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Mail, MailCheck } from '@lucide/vue'

defineEmits(['change-mode'])

const email = ref('')
const sent = ref(false)
const sentEmail = ref('')

function handleSubmit() {
  // TODO: conectar con Strapi auth
  sentEmail.value = email.value
  sent.value = true
  console.log('Forgot password:', email.value)
}
</script>
