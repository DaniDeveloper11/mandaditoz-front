<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Share, SquarePlus, CheckCircle2, Smartphone, Compass, Copy, Check, Download,
  Ellipsis, ArrowDown, ArrowUp, X,
} from '@lucide/vue'

definePageMeta({ layout: 'landing' })

// Página para compartir mientras la app de iOS no está en la App Store.
// iOS no permite instalar una PWA desde un botón: hay que usar
// Compartir → "Agregar a inicio" en Safari, así que aquí solo guiamos.
const siteUrl = useRuntimeConfig().public.siteUrl
const installUrl = `${siteUrl}/instalar`
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=mx.mandaditoz.app'

useSeoMeta({
  title: 'Instala Mandaditoz en tu celular',
  description: 'Agrega Mandaditoz a la pantalla de inicio de tu iPhone o descarga la app para Android. Gratis.',
  ogTitle: 'Instala Mandaditoz en tu celular',
  ogDescription: 'Agrégalo a tu pantalla de inicio en iPhone o descárgalo en Android.',
  ogUrl: installUrl,
})
useHead({ link: [{ rel: 'canonical', href: installUrl }] })

// En SSR no sabemos el dispositivo: se renderiza la guía de iPhone (el caso
// para el que existe esta página) y se ajusta al montar.
// 'ios-safari' | 'ios-otro' | 'ios-inapp' | 'android' | 'desktop' | 'instalada'
const modo = ref('ios-safari')
const deferredPrompt = ref(null)
const copiado = ref(false)
const esIPad = ref(false)
// Safari 26 (iOS 26) escondió Compartir dentro del botón "•••" de abajo a la
// derecha. Se lee de "Version/NN" porque desde iOS 26 el UA congela la
// versión del sistema en 18_x.
const safariVersion = ref(0)
const guiaAbierta = ref(false)

const safariNuevo = computed(() => modo.value === 'ios-safari' && !esIPad.value && safariVersion.value >= 26)

// Dónde está el botón Compartir en pantalla, para apuntarle con la flecha
const flecha = computed(() => {
  if (esIPad.value || modo.value === 'ios-otro') return 'arriba-derecha' // en la barra de direcciones
  if (safariNuevo.value) return 'abajo-derecha'
  return 'abajo-centro'
})

const pasos = computed(() => {
  const lista = safariNuevo.value
    ? [
        { icon: Ellipsis, titulo: 'Toca el botón •••', texto: 'Está abajo a la derecha, junto a la barra de direcciones.' },
        { icon: Share, titulo: 'Toca "Compartir"', texto: 'Se abre el menú para compartir la página.' },
      ]
    : [
        {
          icon: Share,
          titulo: 'Toca el botón Compartir',
          texto: flecha.value === 'arriba-derecha'
            ? 'Está arriba a la derecha, en la barra de direcciones.'
            : 'Está en la barra de abajo de la pantalla.',
        },
      ]
  lista.push(
    { icon: SquarePlus, titulo: 'Elige "Agregar a inicio"', texto: 'Desliza el menú hacia arriba, o toca "Ver más", si no la ves a la primera.' },
    { icon: null, titulo: 'Toca "Agregar"', texto: 'Mandaditoz aparecerá en tu pantalla de inicio junto a tus otras apps.' },
  )
  return lista
})

onMounted(() => {
  const ua = navigator.userAgent
  esIPad.value = /iPad/.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPadOS se presenta como Mac
  const esIOS = esIPad.value || /iPhone|iPod/.test(ua)
  safariVersion.value = Number(ua.match(/Version\/(\d+)/)?.[1] ?? 0)
  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true

  if (standalone) modo.value = 'instalada'
  else if (esIOS) {
    // Navegadores dentro de apps (Facebook, Instagram, etc.) no tienen "Agregar a inicio"
    if (/FBAN|FBAV|Instagram|Line\/|TikTok|Snapchat|LinkedInApp/i.test(ua)) modo.value = 'ios-inapp'
    else if (/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) modo.value = 'ios-otro'
    else modo.value = 'ios-safari'
  } else if (/Android/i.test(ua)) modo.value = 'android'
  else modo.value = 'desktop'

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
  })
})

async function instalarAndroid() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  await deferredPrompt.value.userChoice
  deferredPrompt.value = null
}

async function copiarLink() {
  try {
    await navigator.clipboard.writeText(installUrl)
    copiado.value = true
    setTimeout(() => { copiado.value = false }, 2500)
  } catch {
    // Sin permiso de portapapeles: el link queda visible para copiarlo a mano
  }
}
</script>

<template>
  <div class="bg-white">
    <div class="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <div class="text-center">
        <img src="/apple-touch-icon.png" alt="" class="mx-auto size-20 rounded-2xl shadow-md ring-1 ring-gray-200" />
        <h1 class="mt-6 font-display text-3xl sm:text-4xl font-bold text-brand-text">
          Instala Mandaditoz
        </h1>
        <p class="mt-3 text-gray-600">
          Ten el directorio de negocios de tu municipio a un toque, como cualquier otra app.
        </p>
      </div>

      <!-- Ya instalada -->
      <div v-if="modo === 'instalada'" class="mt-10 rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-100">
        <CheckCircle2 class="mx-auto size-10 text-emerald-600" />
        <p class="mt-3 font-semibold text-emerald-800">¡Listo! Ya estás usando Mandaditoz como app.</p>
        <NuxtLink to="/" class="mt-4 inline-block font-semibold text-brand-primary">Ir al inicio →</NuxtLink>
      </div>

      <!-- Navegador dentro de Facebook/Instagram/etc. -->
      <div v-else-if="modo === 'ios-inapp'" class="mt-10 rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-100">
        <div class="flex items-start gap-3">
          <Compass class="size-6 shrink-0 text-brand-ocre" />
          <div>
            <p class="font-semibold text-brand-text">Primero ábrelo en Safari</p>
            <p class="mt-1 text-sm text-gray-700">
              Desde esta app no se puede instalar. Toca el menú <strong>•••</strong> y elige
              <strong>"Abrir en Safari"</strong>, o copia el enlace y pégalo en Safari.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 font-semibold text-white"
          @click="copiarLink"
        >
          <component :is="copiado ? Check : Copy" class="size-5" />
          {{ copiado ? 'Enlace copiado' : 'Copiar enlace' }}
        </button>
        <p class="mt-2 text-center text-xs text-gray-500 break-all">{{ installUrl }}</p>
      </div>

      <!-- Android -->
      <div v-else-if="modo === 'android'" class="mt-10 space-y-4">
        <a
          :href="PLAY_STORE_URL"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 font-semibold text-white"
        >
          <Download class="size-5" />
          Descargar en Google Play
        </a>
        <button
          v-if="deferredPrompt"
          type="button"
          class="w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-brand-text"
          @click="instalarAndroid"
        >
          O instalar la versión web
        </button>
      </div>

      <!-- Computadora -->
      <div v-else-if="modo === 'desktop'" class="mt-10 rounded-2xl bg-gray-50 p-6 text-center ring-1 ring-gray-200">
        <Smartphone class="mx-auto size-10 text-brand-primary" />
        <p class="mt-3 font-semibold text-brand-text">Abre este enlace desde tu celular</p>
        <p class="mt-1 text-sm text-gray-600 break-all">{{ installUrl }}</p>
        <a :href="PLAY_STORE_URL" class="mt-4 inline-block text-sm font-semibold text-brand-primary">
          ¿Tienes Android? Descárgala en Google Play →
        </a>
      </div>

      <!-- iPhone / iPad (Safari, o Chrome/Firefox/Edge en iOS 16.4+) -->
      <template v-else>
        <p v-if="modo === 'ios-otro'" class="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-gray-700 ring-1 ring-amber-100">
          Funciona mejor desde <strong>Safari</strong>. Si no ves la opción del paso 2,
          copia este enlace y ábrelo en Safari:
          <button type="button" class="font-semibold text-brand-primary" @click="copiarLink">
            {{ copiado ? 'copiado ✓' : 'copiar enlace' }}
          </button>
        </p>

        <button
          type="button"
          class="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3.5 text-lg font-semibold text-white shadow-sm"
          @click="guiaAbierta = true"
        >
          <Download class="size-5" />
          Instalar
        </button>

        <ol class="mt-8 space-y-4">
          <li
            v-for="(paso, i) in pasos"
            :key="paso.titulo"
            class="flex items-start gap-4 rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-200"
          >
            <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-primary font-bold text-white">{{ i + 1 }}</span>
            <div>
              <p class="font-semibold text-brand-text">
                {{ paso.titulo }}
                <component :is="paso.icon" v-if="paso.icon" class="inline size-5 align-text-bottom text-blue-500" aria-hidden="true" />
              </p>
              <p class="mt-1 text-sm text-gray-600">{{ paso.texto }}</p>
            </div>
          </li>
        </ol>

        <p class="mt-8 text-center text-sm text-gray-500">
          Pronto estaremos también en la App Store.
        </p>

        <!-- Guía sobre la pantalla: iOS no deja instalar desde la página, así que
             la flecha señala el botón del navegador que hay que tocar. -->
        <Teleport to="body">
          <Transition
            enter-active-class="transition duration-200"
            enter-from-class="opacity-0"
            leave-active-class="transition duration-150"
            leave-to-class="opacity-0"
          >
            <div
              v-if="guiaAbierta"
              class="fixed inset-0 z-50 bg-black/60"
              role="dialog"
              aria-modal="true"
              aria-label="Cómo instalar Mandaditoz"
              @click.self="guiaAbierta = false"
            >
              <div
                class="absolute inset-x-4 mx-auto max-w-sm rounded-2xl bg-white p-5 shadow-xl"
                :class="flecha === 'arriba-derecha' ? 'top-24' : 'bottom-28'"
              >
                <button
                  type="button"
                  class="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Cerrar"
                  @click="guiaAbierta = false"
                >
                  <X class="size-5" />
                </button>
                <p class="pr-6 font-display text-lg font-bold text-brand-text">Instálala en 3 toques</p>
                <ol class="mt-3 space-y-2.5">
                  <li v-for="(paso, i) in pasos" :key="paso.titulo" class="flex items-center gap-3 text-sm text-gray-700">
                    <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">{{ i + 1 }}</span>
                    <span>{{ paso.titulo }}</span>
                    <component :is="paso.icon" v-if="paso.icon" class="size-4 shrink-0 text-blue-500" aria-hidden="true" />
                  </li>
                </ol>
              </div>

              <ArrowUp
                v-if="flecha === 'arriba-derecha'"
                class="absolute right-6 top-3 size-12 animate-bounce text-white"
                aria-hidden="true"
              />
              <ArrowDown
                v-else
                class="absolute bottom-4 size-12 animate-bounce text-white"
                :class="flecha === 'abajo-derecha' ? 'right-5' : 'left-1/2 -ml-6'"
                aria-hidden="true"
              />
            </div>
          </Transition>
        </Teleport>
      </template>
    </div>
  </div>
</template>
