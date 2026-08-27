<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-brand-bg-dark px-4 py-12">

    <!-- Logo -->
    <div class="flex w-full justify-center">
      <a href="/" class="mb-8">
        <img :src="logoLight" alt="Mandaditoz" class="h-14 sm:h-20 w-auto" />
      </a>

    </div>

    <!-- Card -->
    <div class="w-full max-w-md">
      <div class="card px-8 py-10">

        <!-- Encabezado -->
        <div class="mb-7 text-center">
          <h1 class="font-display text-2xl font-semibold text-brand-text">
            {{ titles[mode] }}
          </h1>
          <p v-if="subtitles[mode]" class="mt-1.5 text-sm text-brand-text-soft">
            {{ subtitles[mode] }}
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
            :class="isRegister
              ? 'bg-white shadow-sm text-brand-primary'
              : 'text-brand-text-soft hover:text-brand-text'"
            @click="goRegister()"
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
          <AuthRegisterCustomerForm v-else-if="mode === 'register'" @change-mode="mode = $event" />
          <AuthRegisterForm v-else-if="mode === 'register-owner'" @change-mode="mode = $event" />
          <AuthForgotPasswordForm v-else @change-mode="mode = $event" />
        </Transition>

      </div>

      <!-- Solicitud pública -->
      <p v-if="mode === 'register-owner'" class="mt-5 text-center text-sm text-white/70">
        ¿No quieres crear cuenta?
        <a href="/negocios/publicar" class="font-semibold text-white underline hover:text-brand-primary transition">
          Envía tu solicitud aquí
        </a>
      </p>

      <!-- Leyenda inferior -->
      <p class="mt-6 text-center text-xs text-white/30">
        Al continuar aceptas nuestros
        <a href="/terminos" class="underline hover:text-white/60 transition">Términos de uso</a>
        y
        <a href="/privacidad" class="underline hover:text-white/60 transition">Política de privacidad</a>.
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({ layout: false })

const route = useRoute()

// El registro se bifurca por intención:
//   ?type=r                 → comensal (alta exprés, entra de inmediato)
//   ?type=r&intent=negocio  → dueño de negocio (confirma correo antes de entrar)
function initialMode() {
  if (route.query.type !== 'r') return 'login'
  return route.query.intent === 'negocio' ? 'register-owner' : 'register'
}

const mode = ref(initialMode())
const isRegister = computed(() => mode.value.startsWith('register'))

// La pestaña cubre los dos modos de alta: si ya estás en uno, no te saca de él.
function goRegister() {
  if (!isRegister.value) mode.value = 'register'
}
const logoLight = '/logo-cielo-horizontal-dark.svg'

const titles = {
  login: 'Bienvenido de vuelta',
  register: 'Únete a Mandaditoz',
  'register-owner': 'Publica tu negocio',
  forgot: 'Recuperar acceso',
}

const subtitles = {
  register: 'Toma menos de un minuto',
  'register-owner': 'Crea la cuenta con la que vas a administrarlo',
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
