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
          Tu correo fue verificado correctamente. Ya puedes iniciar sesión y comenzar a usar Mandaditoz.
        </p>

        <a href="/login" class="btn-primary inline-flex">
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
import { MailCheck } from '@lucide/vue'

definePageMeta({ layout: false })
</script>
