<script setup>
import { HelpCircle } from '@lucide/vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-100">

    <!-- Header minimalista -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-3xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">
        <NuxtLink to="/" class="shrink-0">
          <img src="/logo-cielo-horizontal.svg" alt="Mandaditoz" class="h-8 w-auto" />
        </NuxtLink>
        <NuxtLink
          to="/"
          class="text-sm font-semibold text-brand-azulgris hover:text-brand-text transition-colors"
        >
          Cancelar
        </NuxtLink>
      </div>
    </header>

    <!-- Contenido -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer minimalista -->
    <footer class="border-t border-gray-200 bg-white">
      <div class="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4 md:px-8 py-4 text-xs text-brand-azulgris">
        <p>© 2026 Mandaditoz · Directorio 100% gratuito</p>
        <NuxtLink to="/" class="inline-flex items-center gap-1.5 hover:text-brand-text transition-colors">
          <HelpCircle class="w-3.5 h-3.5" />
          ¿Necesitas ayuda?
        </NuxtLink>
      </div>
    </footer>

  </div>
</template>
