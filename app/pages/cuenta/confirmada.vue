<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-brand-bg-dark px-4 py-12">

    <a href="/" class="mb-8">
      <img src="/logo-cielo-horizontal-dark.svg" alt="Mandaditoz" class="h-14 sm:h-20 w-auto" />
    </a>

    <div class="w-full max-w-md">
      <div class="card px-8 py-10 text-center">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-success/10">
          <MailCheck class="size-7 text-success" />
        </div>

        <h1 class="font-display text-2xl font-semibold text-brand-text mb-2">
          ¡Cuenta confirmada!
        </h1>

        <p class="text-sm text-brand-text-soft mb-6">
          <template v-if="destino">
            Tu correo fue verificado correctamente. Inicia sesión y te llevamos de vuelta a donde ibas.
          </template>
          <template v-else>
            Tu correo fue verificado correctamente. Ya puedes iniciar sesión y comenzar a usar Mandaditoz.
          </template>
        </p>

        <a :href="loginHref" class="btn-primary inline-flex">
          Iniciar sesión
        </a>
      </div>

      <p class="mt-6 text-center text-xs text-white/30">
        ¿Necesitas ayuda?
        <a href="/" class="underline hover:text-white/60 transition">Volver al inicio</a>
      </p>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MailCheck } from '@lucide/vue'
import { safeRedirectPath } from '~/utils/urls'

definePageMeta({ layout: false })

// A esta página se llega por el 302 de Strapi tras confirmar el correo: no hay
// sesión ni historial, así que lo único que puede decirnos a dónde iba el
// usuario es el `?to=` que le cuelga el envoltorio de emailConfirmation en el
// backend. Se revalida porque viaja en una URL.
const destino = safeRedirectPath(useRoute().query.to)

const loginHref = computed(() =>
  destino ? `/login?redirect=${encodeURIComponent(destino)}` : '/login'
)
</script>
