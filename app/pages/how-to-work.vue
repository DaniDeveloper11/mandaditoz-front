<script setup>
import {
  Briefcase, User, UserPlus, Store, BadgeCheck, MessageCircle,
  MapPin, Search, Eye, Phone,
  Clock, Image as ImageIcon, Star, Share2, BarChart3,
  Check, Plus,
} from '@lucide/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

definePageMeta({ layout: 'landing' })

const modo = ref('dueno')

const pasosDueno = [
  {
    title: 'Crea tu cuenta',
    body: 'Regístrate con tu correo y teléfono. Sin tarjeta, sin costo.',
    icon: UserPlus,
    color: 'bg-blue-100',
    iconColor: 'text-brand-primary',
  },
  {
    title: 'Captura tu negocio',
    body: 'Nombre, dirección, categoría, horario y fotos. Toma 5 minutos.',
    icon: Store,
    color: 'bg-amber-100',
    iconColor: 'text-brand-ocre',
  },
  {
    title: 'Verificamos y publicamos',
    body: 'Revisamos que los datos sean reales y tu perfil sale al directorio.',
    icon: BadgeCheck,
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    title: 'Recibe clientes',
    body: 'Los vecinos te encuentran, te llaman o te escriben por WhatsApp.',
    icon: MessageCircle,
    color: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
]

const pasosVecino = [
  {
    title: 'Elige tu municipio',
    body: 'Selecciona tu ciudad para ver solo lo que hay cerca de ti.',
    icon: MapPin,
    color: 'bg-blue-100',
    iconColor: 'text-brand-primary',
  },
  {
    title: 'Busca lo que necesitas',
    body: 'Filtra por categoría o escribe el nombre. Ve horarios en tiempo real.',
    icon: Search,
    color: 'bg-amber-100',
    iconColor: 'text-brand-ocre',
  },
  {
    title: 'Revisa el perfil',
    body: 'Fotos, dirección, teléfono y reseñas — todo lo que necesitas para decidir.',
    icon: Eye,
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    title: 'Contacta al instante',
    body: 'Llama, manda WhatsApp o ve la ubicación con un solo clic.',
    icon: Phone,
    color: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
]

const pasosActivos = computed(() => modo.value === 'dueno' ? pasosDueno : pasosVecino)

const faqs = [
  {
    q: '¿Cuánto cuesta registrar mi negocio?',
    a: 'Nada. El registro y el listado básico son gratis, y siempre lo serán. No hay comisiones por venta, cobros por contacto ni tarjeta al momento de registrarte.',
  },
  {
    q: '¿En qué municipios funciona?',
    a: 'Estamos activos en varios municipios de Jalisco y agregamos nuevos cada mes. Si el tuyo aún no aparece, escríbenos y lo priorizamos.',
  },
  {
    q: '¿Necesito instalar una aplicación?',
    a: 'No. Todo funciona desde el navegador de tu teléfono o computadora. No hay app que instalar ni en el negocio ni para los clientes que te buscan.',
  },
  {
    q: '¿Cómo verifican los negocios?',
    a: 'Revisamos manualmente que el nombre, dirección, teléfono y horario coincidan con el negocio real antes de publicar el perfil. Así el directorio es confiable para todos.',
  },
  {
    q: '¿Puedo editar mi información después?',
    a: 'Sí. Inicias sesión con tu cuenta y actualizas horario, teléfono, fotos o categoría cuando quieras. Los cambios se publican al instante.',
  },
]

const features = [
  {
    icon: Phone,
    title: 'Información y contacto',
    body: 'Nombre, categoría, descripción, teléfono, WhatsApp y dirección en el mapa.',
    color: 'bg-blue-100',
    iconColor: 'text-brand-primary',
  },
  {
    icon: Clock,
    title: 'Horario en tiempo real',
    body: 'Define tus horarios por día y muestra "Abierto ahora" automáticamente.',
    color: 'bg-amber-100',
    iconColor: 'text-brand-ocre',
  },
  {
    icon: ImageIcon,
    title: 'Galería de fotos',
    body: 'Sube hasta 10 fotos de tu local, tus productos y tu equipo.',
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    icon: Star,
    title: 'Reseñas de clientes',
    body: 'Tus clientes dejan reseñas que construyen la reputación de tu negocio.',
    color: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    icon: Share2,
    title: 'Redes sociales',
    body: 'Enlaza tu Facebook, Instagram o TikTok directo desde tu perfil.',
    color: 'bg-blue-100',
    iconColor: 'text-brand-primary',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas',
    body: 'Ve cuántas personas vieron tu perfil y dieron clic en tu teléfono.',
    color: 'bg-amber-100',
    iconColor: 'text-brand-ocre',
  },
]
</script>

<template>
  <main class="flex-1">

    <!-- Hero: Cómo funciona -->
    <section class="relative overflow-hidden bg-slate-50 py-16 md:py-24 px-6 md:px-12">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

        <!-- Left: heading + copy + CTAs -->
        <div>
          <!-- Eyebrow -->
          <div class="flex items-center gap-3 mb-8">
            <span class="h-px w-10 bg-brand-ocre" />
            <span class="text-brand-ocre text-xs font-semibold tracking-[0.25em] uppercase">
              Cómo funciona
            </span>
          </div>

          <!-- Headline -->
          <h1 class="font-display font-black text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight text-brand-bg-dark">
            Conectar tu negocio con tu comunidad,
            <span class="block text-brand-primary-dark">sin complicarte.</span>
          </h1>

          <!-- Body copy -->
          <p class="mt-8 max-w-lg text-brand-text-soft text-base md:text-lg leading-relaxed">
            Mandaditoz es un directorio local: los negocios crean su perfil
            gratis y los vecinos los encuentran, ven sus horarios y los
            contactan al instante. Así de simple.
          </p>

          <!-- CTAs -->
          <div class="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <NuxtLink
              to="/negocios/publicar"
              class="inline-flex items-center justify-center bg-brand-primary hover:bg-brand-bg-dark text-white font-semibold text-sm px-7 py-4 rounded-xl transition-colors shadow-sm"
            >
              Registra tu negocio gratis
            </NuxtLink>
            <NuxtLink
              to="/list"
              class="inline-flex items-center gap-2 text-brand-primary font-semibold text-sm hover:text-brand-bg-dark transition-colors"
            >
              Ver el directorio
              <span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Right: flow diagram card -->
        <div class="relative">
          <div class="relative rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200/70 p-6 md:p-8 shadow-sm">
            <div class="flex flex-col gap-4">

              <!-- Step 1: El negocio local -->
              <div class="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
                <div class="w-12 h-12 rounded-xl bg-brand-terracota flex items-center justify-center shrink-0">
                  <Briefcase class="w-6 h-6 text-white" />
                </div>
                <div>
                  <p class="font-display font-black text-lg text-brand-bg-dark leading-tight">El negocio local</p>
                  <p class="text-brand-azulgris text-sm mt-0.5">Crea y edita su perfil</p>
                </div>
              </div>

              <!-- Arrow -->
              <div class="flex justify-center" aria-hidden="true">
                <svg width="16" height="28" viewBox="0 0 16 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1 L8 22" stroke="#8094A8" stroke-width="1.5" stroke-dasharray="3 3" stroke-linecap="round" />
                  <path d="M3 18 L8 24 L13 18" stroke="#8094A8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                </svg>
              </div>

              <!-- Step 2: Mandaditoz (highlighted) -->
              <div class="bg-brand-bg-dark rounded-2xl px-5 py-4 flex items-center gap-4 shadow-md">
                <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 40 40" class="w-7 h-7" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <line x1="20" y1="6" x2="20" y2="34" stroke="#599ed4" stroke-width="2" stroke-linecap="round" />
                    <line x1="6" y1="20" x2="34" y2="20" stroke="#599ed4" stroke-width="2" stroke-linecap="round" />
                    <circle cx="20" cy="6" r="3" fill="#599ed4" />
                    <circle cx="20" cy="34" r="3" fill="#D48B1A" />
                    <circle cx="6" cy="20" r="3" fill="#D48B1A" />
                    <circle cx="34" cy="20" r="3" fill="#599ed4" />
                    <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />
                  </svg>
                </div>
                <div>
                  <p class="font-display font-black text-lg text-white leading-tight">Mandaditoz</p>
                  <p class="text-white/60 text-sm mt-0.5">Verifica y publica el perfil</p>
                </div>
              </div>

              <!-- Arrow -->
              <div class="flex justify-center" aria-hidden="true">
                <svg width="16" height="28" viewBox="0 0 16 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1 L8 22" stroke="#8094A8" stroke-width="1.5" stroke-dasharray="3 3" stroke-linecap="round" />
                  <path d="M3 18 L8 24 L13 18" stroke="#8094A8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                </svg>
              </div>

              <!-- Step 3: El vecino / cliente -->
              <div class="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
                <div class="w-12 h-12 rounded-xl bg-success flex items-center justify-center shrink-0">
                  <User class="w-6 h-6 text-white" />
                </div>
                <div>
                  <p class="font-display font-black text-lg text-brand-bg-dark leading-tight">El vecino / cliente</p>
                  <p class="text-brand-azulgris text-sm mt-0.5">Encuentra y contacta</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Paso a paso -->
    <section class="bg-white py-16 md:py-24 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="text-center max-w-2xl mx-auto">
          <p class="text-brand-primary text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            Paso a paso
          </p>
          <h2 class="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight text-brand-bg-dark">
            ¿Cómo lo usas tú?
          </h2>

          <!-- Toggle -->
          <div class="mt-10 inline-flex rounded-full bg-slate-100 p-1.5">
            <button
              type="button"
              @click="modo = 'dueno'"
              :class="[
                'px-6 md:px-8 py-3 rounded-full text-sm font-semibold transition-all',
                modo === 'dueno'
                  ? 'bg-white text-brand-bg-dark shadow-sm'
                  : 'text-brand-azulgris hover:text-brand-text',
              ]"
            >
              Soy dueño de un negocio
            </button>
            <button
              type="button"
              @click="modo = 'vecino'"
              :class="[
                'px-6 md:px-8 py-3 rounded-full text-sm font-semibold transition-all',
                modo === 'vecino'
                  ? 'bg-white text-brand-bg-dark shadow-sm'
                  : 'text-brand-azulgris hover:text-brand-text',
              ]"
            >
              Busco un negocio
            </button>
          </div>
        </div>

        <!-- Steps grid -->
        <div class="mt-14 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            v-for="(paso, i) in pasosActivos"
            :key="`${modo}-${i}`"
            class="bg-slate-50 rounded-3xl p-6 md:p-7 flex flex-col"
          >
            <p class="text-brand-azulgris/70 text-xs font-semibold tracking-[0.25em] uppercase">
              Paso {{ i + 1 }}
            </p>
            <div :class="['mt-5 w-14 h-14 rounded-xl flex items-center justify-center', paso.color]">
              <component :is="paso.icon" :class="['w-7 h-7', paso.iconColor]" />
            </div>

            <h3 class="mt-8 font-display font-black text-2xl text-brand-bg-dark leading-tight">
              {{ paso.title }}
            </h3>
            <p class="mt-4 text-brand-text-soft text-sm md:text-base leading-relaxed">
              {{ paso.body }}
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- Qué incluye el perfil -->
    <section class="bg-slate-50 py-16 md:py-24 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <!-- Header -->
        <div class="max-w-2xl mb-14 md:mb-16">
          <p class="text-brand-primary text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            Todo en un solo lugar
          </p>
          <h2 class="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight text-brand-bg-dark">
            Qué incluye el perfil<br class="hidden md:block" />
            de tu negocio
          </h2>
          <p class="mt-6 text-brand-azulgris text-base md:text-lg leading-relaxed max-w-xl">
            Sin apps que instalar ni configuraciones complicadas. Todo se administra desde una sola página de edición.
          </p>
        </div>

        <!-- Features grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="(f, i) in features"
            :key="i"
            class="bg-white rounded-3xl p-6 md:p-7 flex flex-col"
          >
            <div :class="['w-14 h-14 rounded-xl flex items-center justify-center', f.color]">
              <component :is="f.icon" :class="['w-7 h-7', f.iconColor]" />
            </div>
            <h3 class="mt-8 font-display font-black text-2xl text-brand-bg-dark leading-tight">
              {{ f.title }}
            </h3>
            <p class="mt-4 text-brand-text-soft text-sm md:text-base leading-relaxed">
              {{ f.body }}
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- Para quién es -->
    <section class="bg-white py-16 md:py-24 px-6 md:px-12">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

        <!-- Card: dueños de negocio -->
        <div class="rounded-3xl bg-gradient-to-br from-brand-primary to-brand-bg-dark p-8 md:p-10 flex flex-col">
          <div class="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
            <Briefcase class="w-7 h-7 text-white" />
          </div>

          <h3 class="mt-10 font-display font-black text-3xl md:text-4xl text-white leading-tight">
            Para dueños de negocio
          </h3>
          <p class="mt-4 text-white/70 text-base leading-relaxed max-w-md">
            Si tienes una taquería, abarrotes, estética o cualquier negocio local en Jalisco, este es tu escaparate digital gratuito.
          </p>

          <ul class="mt-8 space-y-4">
            <li v-for="item in ['Gratis para siempre, sin comisiones', 'Tu propia página editable en minutos', 'Miles de vecinos buscando cada mes']" :key="item" class="flex items-center gap-3">
              <span class="shrink-0 w-6 h-6 rounded-full bg-brand-ocre flex items-center justify-center">
                <Check class="w-3.5 h-3.5 text-white" stroke-width="3" />
              </span>
              <span class="text-white text-sm md:text-base">{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- Card: vecinos y clientes -->
        <div class="rounded-3xl bg-white border border-slate-200 p-8 md:p-10 flex flex-col">
          <div class="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
            <User class="w-7 h-7 text-emerald-700" />
          </div>

          <h3 class="mt-10 font-display font-black text-3xl md:text-4xl text-brand-bg-dark leading-tight">
            Para vecinos y clientes
          </h3>
          <p class="mt-4 text-brand-azulgris text-base leading-relaxed max-w-md">
            Encuentra el negocio que buscas en tu municipio, revisa si está abierto y contáctalo — sin registrarte ni pagar nada.
          </p>

          <ul class="mt-8 space-y-4">
            <li v-for="item in ['Sin registro ni descargas', 'Negocios verificados y reales', 'Contacto directo: llamada o WhatsApp']" :key="item" class="flex items-center gap-3">
              <span class="shrink-0 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                <Check class="w-3.5 h-3.5 text-white" stroke-width="3" />
              </span>
              <span class="text-brand-bg-dark text-sm md:text-base">{{ item }}</span>
            </li>
          </ul>
        </div>

      </div>
    </section>

    <!-- FAQ -->
    <section class="bg-slate-50 py-16 md:py-24 px-6 md:px-12">
      <div class="max-w-4xl mx-auto">

        <!-- Header -->
        <div class="text-center mb-12 md:mb-16">
          <p class="text-brand-primary text-xs font-semibold tracking-[0.25em] uppercase mb-4">
            Dudas frecuentes
          </p>
          <h2 class="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight text-brand-bg-dark">
            Preguntas frecuentes
          </h2>
        </div>

        <!-- Accordion -->
        <div class="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-200">
          <Disclosure
            v-for="(faq, i) in faqs"
            :key="i"
            v-slot="{ open }"
            as="div"
          >
            <DisclosureButton class="w-full flex items-center justify-between gap-6 px-6 md:px-8 py-6 md:py-7 text-left group">
              <span class="font-display font-black text-lg md:text-xl text-brand-bg-dark leading-tight">
                {{ faq.q }}
              </span>
              <span
                :class="[
                  'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                  open ? 'bg-brand-primary text-white rotate-45' : 'bg-blue-100 text-brand-primary',
                ]"
              >
                <Plus class="w-5 h-5" stroke-width="2.5" />
              </span>
            </DisclosureButton>
            <DisclosurePanel class="px-6 md:px-8 pb-6 md:pb-7 -mt-2">
              <p class="text-brand-text-soft text-sm md:text-base leading-relaxed max-w-3xl">
                {{ faq.a }}
              </p>
            </DisclosurePanel>
          </Disclosure>
        </div>

      </div>
    </section>
        <!-- CTA: ¿Tienes un negocio en Jalisco? -->
    <section class="bg-slate-50 py-16 md:py-20 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">
        <div class="relative overflow-hidden rounded-3xl bg-brand-bg-dark px-8 md:px-16 py-14 md:py-20">

          <!-- Decorative background logo -->
          <img
            :src="'/fondo_logo.png'"
            alt=""
            aria-hidden="true"
            class="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 w-[420px] md:w-[520px] max-w-none opacity-20 object-contain select-none"
          />

          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div class="max-w-xl">
              <h2 class="font-display font-black text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-white">
                ¿Tienes un negocio<br>en Jalisco?
              </h2>
              <p class="mt-6 text-white/70 text-base md:text-lg leading-relaxed max-w-md">
                Regístralo gratis en menos de 5 minutos y aparece ante miles de clientes de tu comunidad.
              </p>
            </div>

            <div class="shrink-0">
              <a
                href="/negocios/publicar"
                class="inline-flex items-center gap-2 bg-brand-ocre hover:bg-amber-600 text-white font-semibold text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-2xl transition-colors shadow-lg whitespace-nowrap"
              >
                Registra tu negocio gratis
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>

  </main>
</template>
