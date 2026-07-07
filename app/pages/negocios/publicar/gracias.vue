<script setup>
import { CheckCircle2, Home, Search } from '@lucide/vue'

definePageMeta({ layout: 'publicar' })
</script>

<template>
  <div class="min-h-screen bg-slate-100 py-16 px-4 md:px-8">
    <div class="max-w-lg mx-auto text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
        <CheckCircle2 class="w-8 h-8 text-emerald-600" />
      </div>

      <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text mb-3">
        ¡Recibimos tu solicitud!
      </h1>

      <p class="text-brand-azulgris text-base leading-relaxed mb-8">
        Un administrador revisará la información y publicará tu negocio en el directorio.
        Si necesitamos aclarar algo te contactaremos al email o teléfono que registraste.
      </p>

      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8 text-left">
        <h2 class="font-display font-bold text-lg text-brand-text mb-3">Mientras tanto…</h2>
        <ul class="space-y-2 text-sm text-brand-azulgris">
          <li class="flex gap-2"><span class="text-brand-primary">•</span> El proceso normalmente toma entre 24 y 48 horas hábiles.</li>
          <li class="flex gap-2"><span class="text-brand-primary">•</span> No necesitas crear una cuenta; si más adelante deseas administrar tu negocio, podrás reclamarlo con tu email.</li>
          <li class="flex gap-2"><span class="text-brand-primary">•</span> Revisa tu bandeja de correo (incluida la carpeta de spam) por si te escribimos.</li>
        </ul>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Home class="w-4 h-4" />
          Volver al inicio
        </NuxtLink>
        <NuxtLink
          to="/list"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-brand-text hover:bg-white transition-colors"
        >
          <Search class="w-4 h-4" />
          Explorar negocios
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
