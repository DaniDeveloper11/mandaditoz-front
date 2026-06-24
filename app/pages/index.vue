<script setup>
import {
  Utensils, Plus, Sun, Car, Wrench, Briefcase, PawPrint, LayoutGrid,
  MapPin, Phone, Clock, Star, ChevronLeft, ChevronRight,
} from '@lucide/vue'

definePageMeta({ layout: 'landing' })

const featuredBusinesses = [
  {
    name: 'Tacos El Güero',
    initial: 'T',
    iconBg: 'bg-brand-bg-dark',
    accentColor: 'bg-amber-400',
    category: 'Comida',
    categoryStyle: 'bg-blue-50 text-blue-700 border-blue-100',
    open: true,
    description: 'Tacos de canasta, birria y gorditas. El mejor desayuno del centro desde 1998.',
    rating: 4.0,
    reviews: 32,
    address: 'Av. Independencia 42, centro',
    phone: '333 ••• ••• ••••',
    hours: 'Lun–Dom · 7:00 am – 2:00 pm',
  },
  {
    name: 'Balneario La Peñita',
    initial: 'B',
    iconBg: 'bg-brand-bg-dark',
    accentColor: 'bg-blue-500',
    category: 'Turismo',
    categoryStyle: 'bg-amber-50 text-amber-700 border-amber-100',
    open: true,
    description: 'Albercas, restaurante y áreas de picnic junto al río. Ideal para salidas familiares los fines de semana.',
    rating: 5.0,
    reviews: 18,
    address: 'Km 3, Carr. a Ahuacatlán',
    phone: '333 ••• ••• ••••',
    hours: 'Sáb–Dom · 8:00 am – 6:00 pm',
  },
  {
    name: 'Farmacia San José',
    initial: 'F',
    iconBg: 'bg-emerald-700',
    accentColor: 'bg-emerald-600',
    category: 'Salud',
    categoryStyle: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    open: false,
    description: 'Medicamentos de patente y genéricos, medición de presión y glucosa. Servicio a domicilio disponible.',
    rating: 4.0,
    reviews: 11,
    address: 'Calle Morelos 18, centro',
    phone: '333 ••• ••• ••••',
    hours: 'Lun–Sáb · 9:00 am – 8:00 pm',
  },
]

const carouselRefs = {}
function scrollCarousel(category, dir) {
  carouselRefs[category]?.scrollBy({ left: dir * 288, behavior: 'smooth' })
}

const directoryCategories = [
  {
    category: 'Comida',
    icon: Utensils,
    iconBg: 'bg-blue-700',
    accentColor: 'bg-amber-400',
    count: 14,
    businesses: [
      { name: 'Tacos El Güero',         initial: 'T', iconBg: 'bg-slate-700',   open: true,  description: 'Tacos de canasta, birria y gorditas. El mejor desayuno del centro desde 1998.',       rating: 4.0, reviews: 32, address: 'Av. Independencia 42' },
      { name: 'Birria La Guadalajara',   initial: 'B', iconBg: 'bg-red-700',     open: true,  description: 'La mejor birria estilo tapatío. Abierta de madrugada los fines de semana.',           rating: 4.8, reviews: 24, address: 'Calle Juárez 15' },
      { name: 'Panadería La Esperanza',  initial: 'P', iconBg: 'bg-amber-500',   open: true,  description: 'Pan dulce artesanal horneado cada mañana. Conchas, cuernitos y pan de agua.',         rating: 4.5, reviews: 18, address: 'Morelos 5, centro' },
      { name: 'Café del Jardín',         initial: 'C', iconBg: 'bg-slate-500',   open: true,  description: 'Café de olla, tamales y desayunos con vista al jardín central. El favorito del centro.', rating: 4.3, reviews: 41, address: 'Plaza Principal' },
      { name: 'Tortas El Gordo',         initial: 'T', iconBg: 'bg-slate-500',   open: false, description: 'Tortas ahogadas y de milanesa. Raciones generosas y salsas artesanales.',            rating: 3.8, reviews: 15, address: '5 de Mayo 30' },
      { name: 'Tamalería Doña Rosa',     initial: 'T', iconBg: 'bg-rose-700',    open: true,  description: 'Tamales de rajas, pollo y dulce. Pedidos por mayoreo para fiestas y eventos.',       rating: 4.6, reviews: 9,  address: 'Hidalgo 8' },
    ],
  },
  {
    category: 'Salud',
    icon: Plus,
    iconBg: 'bg-emerald-700',
    accentColor: 'bg-emerald-500',
    count: 6,
    businesses: [
      { name: 'Farmacia San José',          initial: 'F', iconBg: 'bg-emerald-700', open: false, description: 'Medicamentos de patente y genéricos. Medición de presión y glucosa. Servicio a domicilio.',  rating: 4.0, reviews: 11, address: 'Morelos 18, centro' },
      { name: 'Dr. Ramírez – Medicina Gral', initial: 'D', iconBg: 'bg-slate-700',   open: true,  description: 'Consultas de medicina general y urgencias menores. Sin cita previa.',                        rating: 4.7, reviews: 8,  address: 'Independencia 90' },
      { name: 'Clínica Santa Rosa',          initial: 'C', iconBg: 'bg-emerald-700', open: true,  description: 'Atención médica integral. Pediatría, ginecología y medicina familiar.',                     rating: 4.1, reviews: 14, address: 'Juárez 44' },
      { name: 'DentaSonrisa',                initial: 'D', iconBg: 'bg-slate-700',   open: true,  description: 'Limpieza, ortodoncia y extracciones. Equipo moderno y trato amable.',                       rating: 4.9, reviews: 21, address: 'Hidalgo 11' },
      { name: 'Laboratorio Etzatlán',        initial: 'L', iconBg: 'bg-slate-500',   open: false, description: 'Análisis clínicos completos. Resultados en 24 horas. Toma a domicilio disponible.',         rating: 4.3, reviews: 7,  address: 'Obregón 6' },
    ],
  },
  {
    category: 'Turismo',
    icon: Sun,
    iconBg: 'bg-amber-500',
    accentColor: 'bg-blue-400',
    count: 5,
    businesses: [
      { name: 'Balneario La Peñita',  initial: 'B', iconBg: 'bg-slate-700',  open: true,  description: 'Albercas, restaurante y áreas de picnic junto al río. Ideal para salidas familiares.',  rating: 5.0, reviews: 18, address: 'Km 3, Carr. Ahuacatlán' },
      { name: 'Hotel Plaza Etzatlán', initial: 'H', iconBg: 'bg-blue-700',   open: true,  description: 'Hotel céntrico con estacionamiento y desayuno incluido. Habitaciones confortables.',     rating: 4.2, reviews: 33, address: 'Plaza Principal 1' },
      { name: 'Hacienda San Marcos',  initial: 'H', iconBg: 'bg-amber-700',  open: true,  description: 'Eventos, bodas y turismo rural en una hacienda histórica del siglo XIX.',                rating: 4.8, reviews: 12, address: 'Carr. San Marcos km 2' },
      { name: 'Tour Laguna de Mag.',  initial: 'T', iconBg: 'bg-emerald-600',open: false, description: 'Recorridos guiados a la Laguna de Magdalena. Aves, pesca y fotografía de naturaleza.',  rating: 4.5, reviews: 6,  address: 'Salida norte, km 5' },
    ],
  },
]

const categories = [
  { label: 'Comida',      count: 14, icon: Utensils,   iconBg: 'bg-blue-50',   iconColor: 'text-blue-700' },
  { label: 'Salud',       count: 6,  icon: Plus,        iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Turismo',     count: 5,  icon: Sun,         iconBg: 'bg-amber-50',  iconColor: 'text-amber-500' },
  { label: 'Transporte',  count: 4,  icon: Car,         iconBg: 'bg-slate-100', iconColor: 'text-slate-500' },
  { label: 'Ferretería',  count: 3,  icon: Wrench,      iconBg: 'bg-rose-50',   iconColor: 'text-rose-600' },
  { label: 'Comercio',    count: 7,  icon: Briefcase,   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Mascotas',    count: 2,  icon: PawPrint,    iconBg: 'bg-amber-50',  iconColor: 'text-amber-500' },
]
</script>

<template>
  <main class="flex-1">
    <!-- Hero -->
    <section class="bg-brand-bg-dark py-12 md:py-20 px-6 md:px-12">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">

        <!-- Left: headline -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight text-white">
            Todo Etzatlán,<br>
            <span class="text-brand-primary-dark">en un lugar.</span>
          </h1>
          <p class="mt-4 text-brand-azulgris text-sm tracking-wide">
            43 negocios · 12 categorías · 100% gratis
          </p>
        </div>

        <!-- Right: search bar -->
        <div class="w-full md:flex-1">
          <div class="flex flex-col sm:flex-row items-stretch bg-white rounded-xl overflow-hidden shadow-lg">

            <!-- Location + input row -->
            <div class="flex flex-1 border-b sm:border-b-0">
              <!-- Location badge -->
              <div class="flex items-center gap-2 px-4 py-3.5 border-r border-gray-200 text-brand-text font-medium text-sm whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-primary shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                Etzatlán
              </div>
              <!-- Search input -->
              <input
                type="text"
                placeholder="¿Qué estás buscando?"
                class="flex-1 min-w-0 px-4 py-3.5 text-brand-text placeholder-gray-400 text-sm focus:outline-none"
              />
            </div>

            <!-- Button: full-width on mobile, auto on sm+ -->
            <button class="hidden sm:block bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold px-6 py-3.5 text-sm transition-colors duration-150 w-full sm:w-auto">
              Buscar
            </button>

          </div>
        </div>

      </div>
    </section>

    <!-- Negocios destacados -->
    <section class="bg-white py-12 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <div class="flex items-center justify-between mb-8">
          <h2 class="font-display font-black text-3xl md:text-4xl text-brand-text">
            Negocios destacados
          </h2>
          <a href="/negocios" class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors whitespace-nowrap">
            Ver todos →
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="biz in featuredBusinesses"
            :key="biz.name"
            class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <!-- Colored top accent -->
            <div :class="['h-1.5 w-full', biz.accentColor]" />

            <div class="p-5 flex flex-col flex-1">
              <!-- Logo + name + badges -->
              <div class="flex items-start gap-4 mb-4">
                <div :class="['w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0', biz.iconBg]">
                  {{ biz.initial }}
                </div>
                <div>
                  <h3 class="font-display font-bold text-lg text-brand-text leading-tight">{{ biz.name }}</h3>
                  <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span :class="['text-xs font-medium px-2 py-0.5 rounded-full border', biz.categoryStyle]">{{ biz.category }}</span>
                    <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1', biz.open ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600']">
                      <span :class="['w-1.5 h-1.5 rounded-full', biz.open ? 'bg-emerald-500' : 'bg-red-500']" />
                      {{ biz.open ? 'Abierto' : 'Cerrado' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="text-brand-text text-sm leading-relaxed mb-4">{{ biz.description }}</p>

              <!-- Rating -->
              <div class="flex items-center gap-1.5 mb-3">
                <div class="flex gap-0.5">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :class="['w-4 h-4', i <= Math.floor(biz.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
                  />
                </div>
                <span class="text-sm font-semibold text-brand-text">{{ biz.rating.toFixed(1) }}</span>
                <span class="text-sm text-brand-azulgris">({{ biz.reviews }} reseñas)</span>
              </div>

              <!-- Details -->
              <div class="space-y-2 mb-5">
                <div class="flex items-center gap-2 text-sm text-brand-azulgris">
                  <MapPin class="w-4 h-4 shrink-0" />
                  <span>{{ biz.address }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-brand-azulgris">
                  <Phone class="w-4 h-4 shrink-0" />
                  <span>{{ biz.phone }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-brand-azulgris">
                  <Clock class="w-4 h-4 shrink-0" />
                  <span>{{ biz.hours }}</span>
                </div>
              </div>

              <!-- CTA -->
              <div class="mt-auto">
                <a
                  href="#"
                  class="block w-full bg-brand-bg-dark hover:opacity-90 text-white text-sm font-semibold text-center py-3.5 rounded-xl transition-opacity"
                >
                  Ver perfil completo →
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Categories -->
    <section class="bg-slate-100 py-12 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <div class="flex items-center justify-between mb-8">
          <h2 class="font-display font-black text-3xl md:text-4xl text-brand-text">
            ¿Qué estás buscando?
          </h2>
          <a href="/categorias" class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors whitespace-nowrap">
            Ver todas →
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <a
            v-for="cat in categories"
            :key="cat.label"
            href="#"
            class="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shrink-0', cat.iconBg]">
              <component :is="cat.icon" :class="['w-6 h-6', cat.iconColor]" />
            </div>
            <div>
              <p class="font-semibold text-brand-text text-sm leading-tight">{{ cat.label }}</p>
              <p class="text-brand-azulgris text-xs mt-0.5">{{ cat.count }} negocios</p>
            </div>
          </a>

          <!-- Ver todas (dark card) -->
          <a
            href="/categorias"
            class="bg-brand-bg-dark rounded-2xl p-5 flex items-center gap-4 hover:opacity-90 transition-opacity"
          >
            <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <LayoutGrid class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="font-semibold text-white text-sm leading-tight">Ver todas</p>
              <p class="text-gray-400 text-xs mt-0.5">12 categorías</p>
            </div>
          </a>
        </div>

      </div>
    </section>

    <!-- Explorar el directorio -->
    <section class="bg-brand-bg-dark py-12 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <!-- Section header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p class="text-brand-azulgris text-xs font-semibold tracking-widest uppercase mb-2">Directorio completo</p>
            <h2 class="font-display font-black text-4xl md:text-5xl text-white">Explorar el directorio</h2>
            <p class="text-brand-azulgris text-sm mt-2">43 negocios · 7 categorías · Etzatlán, Jalisco</p>
          </div>
          <!-- Category filter pills -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categories"
              :key="cat.label"
              class="px-4 py-1.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 transition-colors"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Category rows -->
        <div class="space-y-10">
          <div v-for="cat in directoryCategories" :key="cat.category">

            <!-- Row header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cat.iconBg]">
                  <component :is="cat.icon" class="w-5 h-5 text-white" />
                </div>
                <h3 class="font-display font-black text-2xl text-white">{{ cat.category }}</h3>
                <span class="text-brand-azulgris text-sm">{{ cat.count }} negocios</span>
              </div>
              <div class="flex items-center gap-3">
                <a href="#" class="text-brand-azulgris text-sm hover:text-white transition-colors whitespace-nowrap">Ver todos →</a>
                <button
                  @click="scrollCarousel(cat.category, -1)"
                  class="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <button
                  @click="scrollCarousel(cat.category, 1)"
                  class="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Carousel -->
            <div
              :ref="el => { if (el) carouselRefs[cat.category] = el }"
              class="flex gap-4 overflow-x-auto pb-2"
              style="scrollbar-width: none; -webkit-overflow-scrolling: touch;"
            >
              <div
                v-for="biz in cat.businesses"
                :key="biz.name"
                class="bg-white rounded-2xl overflow-hidden shrink-0 w-56 flex flex-col"
              >
                <div :class="['h-1.5 w-full', cat.accentColor]" />
                <div class="p-4 flex flex-col flex-1">

                  <!-- Logo + name + badge -->
                  <div class="flex items-center gap-3 mb-3">
                    <div :class="['w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base shrink-0', biz.iconBg]">
                      {{ biz.initial }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-brand-text text-sm leading-tight truncate">{{ biz.name }}</p>
                      <span :class="['text-xs font-semibold flex items-center gap-1 mt-0.5', biz.open ? 'text-emerald-600' : 'text-red-500']">
                        <span :class="['w-1.5 h-1.5 rounded-full shrink-0', biz.open ? 'bg-emerald-500' : 'bg-red-500']" />
                        {{ biz.open ? 'Abierto' : 'Cerrado' }}
                      </span>
                    </div>
                  </div>

                  <!-- Description -->
                  <p class="text-brand-text text-xs leading-relaxed mb-3 line-clamp-2">{{ biz.description }}</p>

                  <!-- Rating -->
                  <div class="flex items-center gap-1 mb-2">
                    <div class="flex gap-0.5">
                      <Star
                        v-for="i in 5"
                        :key="i"
                        :class="['w-3 h-3', i <= Math.floor(biz.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
                      />
                    </div>
                    <span class="text-xs font-semibold text-brand-text ml-0.5">{{ biz.rating.toFixed(1) }}</span>
                    <span class="text-xs text-brand-azulgris">({{ biz.reviews }})</span>
                  </div>

                  <!-- Address -->
                  <p class="text-xs text-brand-azulgris truncate">{{ biz.address }}</p>

                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>

    <!-- CTA: ¿Tienes un negocio? -->
    <section class="relative overflow-hidden bg-brand-primary py-16 px-6 md:px-12">

      <!-- Decorative network pattern (right side) -->
      <svg
        class="absolute right-0 top-0 h-full w-72 text-white/10 pointer-events-none"
        viewBox="0 0 280 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="240" cy="40"  r="14" stroke="currentColor" stroke-width="2" />
        <circle cx="160" cy="100" r="14" stroke="currentColor" stroke-width="2" />
        <circle cx="240" cy="160" r="14" stroke="currentColor" stroke-width="2" />
        <circle cx="80"  cy="160" r="14" stroke="currentColor" stroke-width="2" />
        <circle cx="200" cy="220" r="14" stroke="currentColor" stroke-width="2" />
        <circle cx="240" cy="40"  r="5"  fill="currentColor" />
        <circle cx="160" cy="100" r="5"  fill="currentColor" />
        <circle cx="240" cy="160" r="5"  fill="currentColor" />
        <circle cx="80"  cy="160" r="5"  fill="currentColor" />
        <circle cx="200" cy="220" r="5"  fill="currentColor" />
        <line x1="240" y1="54"  x2="160" y2="86"  stroke="currentColor" stroke-width="1.5" />
        <line x1="160" y1="114" x2="240" y2="146" stroke="currentColor" stroke-width="1.5" />
        <line x1="160" y1="114" x2="80"  y2="146" stroke="currentColor" stroke-width="1.5" />
        <line x1="240" y1="174" x2="200" y2="206" stroke="currentColor" stroke-width="1.5" />
        <line x1="80"  y1="174" x2="200" y2="206" stroke="currentColor" stroke-width="1.5" />
      </svg>

      <div class="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">

        <!-- Left: copy -->
        <div class="max-w-xl">
          <p class="text-white/60 text-xs font-semibold tracking-widest uppercase mb-3">Para dueños de negocio</p>
          <h2 class="font-display font-black text-4xl md:text-5xl text-white leading-tight mb-4">
            ¿Tienes un negocio<br>en Etzatlán?
          </h2>
          <p class="text-white/75 text-sm leading-relaxed">
            Regístralo gratis en Mandaditoz y llega a más clientes del municipio.<br class="hidden md:block">
            Sin costos, sin contratos, sin complicaciones.
          </p>
        </div>

        <!-- Right: CTA -->
        <div class="flex flex-col items-center gap-3 shrink-0">
          <a
            href="#"
            class="bg-brand-bg-dark hover:opacity-90 text-white font-semibold text-sm px-8 py-4 rounded-xl transition-opacity whitespace-nowrap"
          >
            Registra tu negocio gratis →
          </a>
          <p class="text-white/50 text-xs">Tarda menos de 5 minutos</p>
        </div>

      </div>
    </section>
  </main>
</template>
