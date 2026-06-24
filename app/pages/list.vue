<script setup>
import { ref } from 'vue'
import { MapPin, Star, BadgeCheck, ChevronLeft, ChevronRight, ChevronDown } from '@lucide/vue'

definePageMeta({ layout: 'landing' })

const verifiedOnly = ref(false)

const businesses = [
  {
    name: 'Tacos El Güero',
    initial: 'T', iconBg: 'bg-slate-800',
    verified: true,
    address: 'Av. Independencia 42', category: 'Comida', categoryStyle: 'bg-blue-100 text-blue-700',
    open: true,
    description: 'Tacos de canasta, birria y gorditas. El mejor desayuno del centro desde 1998.',
    rating: 4.0, reviews: 32,
  },
  {
    name: 'Birria La Guadalajara',
    initial: 'B', iconBg: 'bg-teal-800',
    verified: true,
    address: 'Calle Juárez 15', category: 'Comida', categoryStyle: 'bg-blue-100 text-blue-700',
    open: true,
    description: 'La mejor birria estilo tapatío. Abierta de madrugada los fines de semana.',
    rating: 4.8, reviews: 24,
  },
  {
    name: 'Balneario La Peñita',
    initial: 'B', iconBg: 'bg-amber-600',
    verified: true,
    address: 'Km 3, Carr. Ahuacatlán', category: 'Turismo', categoryStyle: 'bg-amber-100 text-amber-700',
    open: true,
    description: 'Albercas, restaurante y picnic junto al río. Ideal para salidas familiares.',
    rating: 5.0, reviews: 18,
  },
  {
    name: 'Farmacia San José',
    initial: 'F', iconBg: 'bg-emerald-800',
    verified: true,
    address: 'Morelos 18, centro', category: 'Salud', categoryStyle: 'bg-emerald-100 text-emerald-700',
    open: false,
    description: 'Medicamentos de patente y genéricos. Medición de presión y glucosa gratis.',
    rating: 4.0, reviews: 11,
  },
  {
    name: 'Hotel Real Etzatlán',
    initial: 'H', iconBg: 'bg-slate-500',
    verified: false,
    address: 'Plaza Principal 2', category: 'Turismo', categoryStyle: 'bg-amber-100 text-amber-700',
    open: true,
    description: 'Hotel boutique en el centro histórico. Habitaciones con vista al jardín central.',
    rating: 4.2, reviews: 9,
  },
  {
    name: 'Café del Jardín',
    initial: 'C', iconBg: 'bg-slate-600',
    verified: true,
    address: 'Plaza Principal', category: 'Comida', categoryStyle: 'bg-blue-100 text-blue-700',
    open: true,
    description: 'Café de olla, tamales y desayunos con vista al jardín. El favorito dominical.',
    rating: 4.3, reviews: 41,
  },
  {
    name: 'Ferretería San Juan',
    initial: 'F', iconBg: 'bg-slate-800',
    verified: false,
    address: 'Obregón 33', category: 'Ferretería', categoryStyle: 'bg-rose-100 text-rose-700',
    open: true,
    description: 'Herramientas manuales y eléctricas. Electricidad, plomería y pinturas en general.',
    rating: 4.2, reviews: 9,
  },
  {
    name: 'DentaSonrisa',
    initial: 'D', iconBg: 'bg-teal-700',
    verified: true,
    address: 'Hidalgo 11', category: 'Salud', categoryStyle: 'bg-emerald-100 text-emerald-700',
    open: true,
    description: 'Limpieza, ortodoncia y extracciones. Equipo moderno y trato amable para toda la familia.',
    rating: 4.9, reviews: 21,
  },
  {
    name: 'Taxi Veloz Etzatlán',
    initial: 'T', iconBg: 'bg-amber-600',
    verified: true,
    address: 'Disponible las 24h', category: 'Transporte', categoryStyle: 'bg-slate-200 text-slate-700',
    open: true,
    description: 'Servicio de taxi las 24 horas. Viajes al aeropuerto y ciudades cercanas del municipio.',
    rating: 4.1, reviews: 22,
  },
  {
    name: 'Abarrotes Don Manuel',
    initial: 'A', iconBg: 'bg-orange-600',
    verified: false,
    address: 'Mercado Municipal', category: 'Comercio', categoryStyle: 'bg-indigo-100 text-indigo-700',
    open: true,
    description: 'Frutas, verduras y abarrotes frescos. El tianguis más completo del centro histórico.',
    rating: 4.3, reviews: 19,
  },
  {
    name: 'Veterinaria Las Garras',
    initial: 'V', iconBg: 'bg-slate-500',
    verified: true,
    address: 'Reforma 27', category: 'Mascotas', categoryStyle: 'bg-purple-100 text-purple-700',
    open: true,
    description: 'Consultas, vacunas, cirugías y baño. Urgencias veterinarias las 24 horas del día.',
    rating: 4.8, reviews: 16,
  },
  {
    name: 'Panadería La Esperanza',
    initial: 'P', iconBg: 'bg-slate-800',
    verified: false,
    address: 'Morelos 5, centro', category: 'Comida', categoryStyle: 'bg-blue-100 text-blue-700',
    open: true,
    description: 'Pan dulce artesanal horneado cada mañana. Conchas, cuernitos y pan de elote.',
    rating: 4.5, reviews: 18,
  },
]
</script>

<template>
  <div class="min-h-screen bg-slate-100 py-8 px-6 md:px-12">
    <div class="max-w-6xl mx-auto">

      <!-- Page header -->
      <div class="flex items-start gap-4 mb-6">
        <button class="mt-1.5 w-9 h-9 rounded-lg border border-gray-300 bg-white flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors shadow-sm">
          <ChevronLeft class="w-4 h-4 text-brand-text" />
        </button>
        <div>
          <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text leading-tight">
            Resultados para <span class="italic">"tacos"</span>
          </h1>
          <p class="text-brand-azulgris text-sm mt-1">12 resultados · Etzatlán, Jalisco</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div class="flex flex-wrap gap-2">
          <button class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-brand-text font-medium hover:bg-gray-50 transition-colors shadow-sm">
            10 por página <ChevronDown class="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-brand-text font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Categoría <ChevronDown class="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-brand-text font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Ordenar <ChevronDown class="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        <!-- Verified toggle -->
        <div class="flex items-center gap-2.5">
          <span class="text-sm text-brand-text font-medium">Mostrar solo verificadas</span>
          <button
            @click="verifiedOnly = !verifiedOnly"
            :class="['relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none', verifiedOnly ? 'bg-brand-primary' : 'bg-gray-300']"
          >
            <span :class="['absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200', verifiedOnly ? 'translate-x-4' : 'translate-x-0']" />
          </button>
        </div>
      </div>

      <!-- Business grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div
          v-for="biz in businesses"
          :key="biz.name"
          class="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 cursor-pointer"
        >
          <!-- Avatar + name + address -->
          <div class="flex items-start gap-4">
            <div :class="['w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0', biz.iconBg]">
              {{ biz.initial }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h3 class="font-display font-bold text-brand-text text-base leading-tight">{{ biz.name }}</h3>
                <BadgeCheck v-if="biz.verified" class="w-4 h-4 text-blue-500 shrink-0" />
              </div>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <div class="flex items-center gap-1 text-brand-azulgris text-xs">
                  <MapPin class="w-3 h-3 shrink-0" />
                  <span>{{ biz.address }}</span>
                </div>
                <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', biz.categoryStyle]">{{ biz.category }}</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <p class="text-brand-text text-sm leading-relaxed line-clamp-2">{{ biz.description }}</p>

          <!-- Rating + status -->
          <div class="flex items-center justify-between mt-auto">
            <div class="flex items-center gap-1">
              <div class="flex gap-0.5">
                <Star
                  v-for="i in 5"
                  :key="i"
                  :class="['w-3.5 h-3.5', i <= Math.floor(biz.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
                />
              </div>
              <span class="text-sm font-semibold text-brand-text ml-1">{{ biz.rating.toFixed(1) }}</span>
              <span class="text-xs text-brand-azulgris">({{ biz.reviews }} reseñas)</span>
            </div>
            <span :class="['text-xs font-semibold flex items-center gap-1.5', biz.open ? 'text-emerald-600' : 'text-red-500']">
              <span :class="['w-1.5 h-1.5 rounded-full', biz.open ? 'bg-emerald-500' : 'bg-red-500']" />
              {{ biz.open ? 'Abierto' : 'Cerrado' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-center gap-1 pb-4">
        <button class="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
          <ChevronLeft class="w-4 h-4 text-brand-text" />
        </button>
        <button class="w-9 h-9 rounded-lg bg-brand-bg-dark text-white text-sm font-semibold shadow-sm">1</button>
        <button class="w-9 h-9 rounded-lg border border-gray-200 bg-white text-sm text-brand-text hover:bg-gray-50 transition-colors shadow-sm">2</button>
        <button class="w-9 h-9 rounded-lg border border-gray-200 bg-white text-sm text-brand-text hover:bg-gray-50 transition-colors shadow-sm">3</button>
        <span class="w-9 h-9 flex items-center justify-center text-brand-azulgris text-sm select-none">···</span>
        <button class="w-9 h-9 rounded-lg border border-gray-200 bg-white text-sm text-brand-text hover:bg-gray-50 transition-colors shadow-sm">8</button>
        <button class="w-9 h-9 rounded-lg border border-gray-200 bg-white text-sm text-brand-text hover:bg-gray-50 transition-colors shadow-sm">9</button>
        <button class="w-9 h-9 rounded-lg border border-gray-200 bg-white text-sm text-brand-text hover:bg-gray-50 transition-colors shadow-sm">10</button>
        <button class="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
          <ChevronRight class="w-4 h-4 text-brand-text" />
        </button>
      </div>

    </div>
  </div>
</template>
