<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-brand-bg-dark px-4 py-12">

    <!-- Logo -->
    <a href="/" class="mb-8">
      <img src="/logo-cielo-horizontal.svg" alt="Mandaditoz" class="h-10 w-auto" />
    </a>

    <!-- Card -->
    <div class="w-full max-w-md">
      <div class="card px-8 py-10">

        <!-- Encabezado -->
        <div class="mb-7 text-center">
          <h1 class="font-display text-2xl font-semibold text-brand-text">
            {{ titles[mode] }}
          </h1>
          <p v-if="mode === 'register'" class="mt-1.5 text-sm text-brand-text-soft">
            Crea tu cuenta gratuitamente
          </p>
        </div>

        <!-- Tab login / register (solo en esos dos modos) -->
        <div v-if="mode !== 'forgot'" class="flex rounded-lg bg-gray-100 p-1 mb-7">
          <button
            class="flex-1 rounded-md py-1.5 text-sm font-medium transition"
            :class="mode === 'login'
              ? 'bg-white shadow-sm text-brand-primary'
              : 'text-brand-text-soft hover:text-brand-text'"
            @click="mode = 'login'"
          >
            Iniciar sesión
          </button>
          <button
            class="flex-1 rounded-md py-1.5 text-sm font-medium transition"
            :class="mode === 'register'
              ? 'bg-white shadow-sm text-brand-primary'
              : 'text-brand-text-soft hover:text-brand-text'"
            @click="mode = 'register'"
          >
            Registrarse
          </button>
        </div>

        <!-- Título de olvidé contraseña -->
        <div v-if="mode === 'forgot'" class="mb-6">
          <h2 class="text-base font-semibold text-brand-text">Recuperar contraseña</h2>
        </div>

        <!-- Formularios -->
        <Transition name="fade" mode="out-in">
          <AuthLoginForm v-if="mode === 'login'" @change-mode="mode = $event" />
          <AuthRegisterForm v-else-if="mode === 'register'" @change-mode="mode = $event" />
          <AuthForgotPasswordForm v-else @change-mode="mode = $event" />
        </Transition>

      </div>

      <!-- Leyenda inferior -->
      <p class="mt-6 text-center text-xs text-white/30">
        Al continuar aceptas nuestros
        <a href="#" class="underline hover:text-white/60 transition">Términos de uso</a>
        y
        <a href="#" class="underline hover:text-white/60 transition">Política de privacidad</a>.
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({ layout: false })

const mode = ref('login')

const titles = {
  login: 'Bienvenido de vuelta',
  register: 'Únete a Mandaditoz',
  forgot: 'Recuperar acceso',
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
