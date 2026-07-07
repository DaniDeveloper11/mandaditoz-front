<script setup>
import { LayoutGrid, MapPin, Phone, Clock, Star } from '@lucide/vue'
import { getLucideIcon } from '~/utils/categorias'

definePageMeta({ layout: 'landing' })

const router = useRouter()
const store = useSearchStore()
const cityStore = useCityStore()

const searchQuery = ref('')

function buscar() {
  store.setQuery(searchQuery.value)
  router.push('/list')
}

// Featured businesses
const { negocios: featured, pending: featuredPending } = useNegocios(ref({
  isFeatured: true,
  pagina: 1,
  porPagina: 3,
  orden: 'rating',
  categoria: null,
  soloVerificados: false,
  query: '',
}))

// 6 categorías para el grid "¿Qué estás buscando?"
const { categorias: categoriasGrid } = useCategorias(8)

// Todas las categorías para los carruseles y los pills de filtro
const { categorias: categoriasCarrusel } = useCategorias(30)
const { categorias: categoriaCatalog } = useCategorias(10)
</script>

<template>
  <main class="flex-1">

    <!-- Hero -->
    <section class="relative overflow-hidden bg-brand-bg-dark py-12 md:py-20 px-6 md:px-12">
      <!-- Background cityscape -->
      <div class="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 opacity-20 z-0">
        <svg viewBox="0 0 640 170" width="640" height="170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <!-- Ground -->
          <rect x="0" y="157" width="640" height="13" fill="#C8D5E0"/>

          <!-- Building 1: Farmacia (green) -->
          <rect x="6" y="70" width="74" height="87" fill="#2A7A5F"/>
          <path d="M2,70 L82,70 L78,84 L6,84 Z" fill="#1F5A45"/>
          <path d="M2,84 Q9,78 16,84 Q23,78 30,84 Q37,78 44,84 Q51,78 58,84 Q65,78 72,84 Q79,78 82,84" fill="none" stroke="#1F5A45" stroke-width="2.5"/>
          <rect x="13" y="80" width="22" height="18" rx="2" fill="#B8D8C8"/>
          <rect x="45" y="80" width="22" height="18" rx="2" fill="#B8D8C8"/>
          <rect x="8" y="100" width="74" height="14" rx="2" fill="#E4F0EA"/>
          <rect x="35" y="103" width="14" height="3" fill="#2A7A5F"/>
          <rect x="41" y="101" width="3" height="7" fill="#2A7A5F"/>
          <rect x="28" y="122" width="24" height="35" fill="#1F5A45"/>
          <path d="M28,127 A12,12 0 0,1 52,127" fill="#1F5A45"/>

          <!-- Street lamp 1 -->
          <rect x="85" y="102" width="3" height="55" fill="#8094A8"/>
          <path d="M88,102 Q100,102 100,113 L100,122" fill="none" stroke="#8094A8" stroke-width="2.5" stroke-linecap="round"/>
          <ellipse cx="100" cy="124" rx="7" ry="3.5" fill="#D48B1A"/>
          <ellipse cx="100" cy="123" rx="4" ry="2" fill="#F5D070"/>

          <!-- Building 2: Tall oficina (blue) -->
          <rect x="97" y="38" width="64" height="119" fill="#1D5A8A"/>
          <rect x="105" y="50" width="18" height="14" rx="1" fill="#A8CCEA"/>
          <rect x="134" y="50" width="18" height="14" rx="1" fill="#A8CCEA"/>
          <rect x="105" y="72" width="18" height="14" rx="1" fill="#D48B1A" opacity="0.85"/>
          <rect x="134" y="72" width="18" height="14" rx="1" fill="#A8CCEA"/>
          <rect x="105" y="94" width="18" height="14" rx="1" fill="#A8CCEA"/>
          <rect x="134" y="94" width="18" height="14" rx="1" fill="#D48B1A" opacity="0.85"/>
          <rect x="113" y="129" width="30" height="28" rx="1" fill="#174D7A"/>

          <!-- Building 3: Iglesia (cream/colonial) -->
          <rect x="170" y="24" width="50" height="133" fill="#E8DFD0"/>
          <path d="M176,26 L214,26 L214,54 A19,19 0 0,1 176,54 Z" fill="#C8B89A"/>
          <rect x="191" y="8" width="4" height="20" fill="#8094A8"/>
          <rect x="185" y="14" width="16" height="4" fill="#8094A8"/>
          <rect x="177" y="62" width="14" height="20" rx="7" fill="#A8CCEA"/>
          <rect x="199" y="62" width="14" height="20" rx="7" fill="#A8CCEA"/>
          <rect x="178" y="120" width="26" height="37" fill="#C8B89A"/>
          <path d="M178,126 A13,13 0 0,1 204,126" fill="#C8B89A"/>
          <rect x="166" y="154" width="58" height="4" rx="1" fill="#B8A890"/>

          <!-- Tree between church and taco -->
          <rect x="228" y="132" width="6" height="25" fill="#6B7A8A"/>
          <ellipse cx="231" cy="122" rx="16" ry="17" fill="#2A7A5F"/>
          <ellipse cx="225" cy="126" rx="10" ry="12" fill="#3AAA80"/>

          <!-- Building 4: Tacos (terracotta) -->
          <rect x="246" y="74" width="90" height="83" fill="#B85030"/>
          <path d="M242,74 L340,74 L336,90 L246,90 Z" fill="#D4693A"/>
          <path d="M244,90 Q250,84 256,90 Q262,84 268,90 Q274,84 280,90 Q286,84 292,90 Q298,84 304,90 Q310,84 316,90 Q322,84 328,90 Q334,84 336,90" fill="none" stroke="#D4693A" stroke-width="2.5"/>
          <rect x="254" y="93" width="74" height="16" rx="3" fill="#F5E6D8"/>
          <rect x="261" y="97" width="8" height="3" rx="1" fill="#B85030"/>
          <rect x="273" y="97" width="12" height="3" rx="1" fill="#B85030"/>
          <rect x="289" y="97" width="10" height="3" rx="1" fill="#B85030"/>
          <rect x="303" y="97" width="8" height="3" rx="1" fill="#B85030"/>
          <rect x="252" y="114" width="30" height="22" rx="2" fill="#F0D5C0"/>
          <rect x="290" y="114" width="30" height="22" rx="2" fill="#F0D5C0"/>
          <rect x="262" y="124" width="26" height="33" rx="2" fill="#8B3518"/>

          <!-- Street lamp 2 -->
          <rect x="342" y="112" width="3" height="45" fill="#8094A8"/>
          <path d="M345,112 Q357,112 357,123 L357,131" fill="none" stroke="#8094A8" stroke-width="2.5" stroke-linecap="round"/>
          <ellipse cx="357" cy="133" rx="7" ry="3.5" fill="#D48B1A"/>
          <ellipse cx="357" cy="132" rx="4" ry="2" fill="#F5D070"/>

          <!-- Building 5: Abarrotes (gold) -->
          <rect x="352" y="54" width="78" height="103" fill="#D48B1A"/>
          <rect x="360" y="66" width="24" height="20" rx="2" fill="#FBF0D4"/>
          <rect x="396" y="66" width="24" height="20" rx="2" fill="#FBF0D4"/>
          <rect x="352" y="90" width="78" height="15" fill="#B87510"/>
          <rect x="362" y="93" width="10" height="3" rx="1" fill="#D48B1A"/>
          <rect x="376" y="93" width="14" height="3" rx="1" fill="#D48B1A"/>
          <rect x="394" y="93" width="10" height="3" rx="1" fill="#D48B1A"/>
          <rect x="370" y="118" width="28" height="39" rx="2" fill="#96630C"/>

          <!-- Small plant outside abarrotes -->
          <rect x="354" y="143" width="5" height="14" fill="#5A3A08"/>
          <ellipse cx="357" cy="137" rx="10" ry="11" fill="#2A7A5F"/>

          <!-- Tree -->
          <rect x="440" y="135" width="6" height="22" fill="#6B7A8A"/>
          <ellipse cx="443" cy="124" rx="15" ry="16" fill="#3AAA80"/>

          <!-- Building 6: Casa colonialita (sky blue) -->
          <rect x="456" y="80" width="68" height="77" fill="#5B9FD4"/>
          <polygon points="451,80 528,80 480,50" fill="#3D7AA8"/>
          <rect x="463" y="94" width="20" height="16" rx="2" fill="#C8E4F8"/>
          <rect x="493" y="94" width="20" height="16" rx="2" fill="#C8E4F8"/>
          <rect x="469" y="123" width="22" height="34" rx="2" fill="#3D7AA8"/>
          <circle cx="489" cy="141" r="2.5" fill="#D48B1A"/>

          <!-- Building 7: Tall dark right edge -->
          <rect x="532" y="34" width="112" height="123" fill="#1A2535"/>
          <rect x="540" y="48" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="562" y="48" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="584" y="48" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="608" y="48" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="540" y="68" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="562" y="68" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="584" y="68" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="608" y="68" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="540" y="88" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="562" y="88" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="584" y="88" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="608" y="88" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="540" y="108" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="562" y="108" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="608" y="108" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="560" y="130" width="28" height="27" rx="1" fill="#0D1925"/>
        </svg>
      </div>

      <div class="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">

        <!-- Left: headline -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight text-white">
            Todo {{ cityStore.activeCityName }},<br>
            <span class="text-brand-primary-dark">en un lugar.</span>
          </h1>
          <p class="mt-4 text-brand-azulgris text-sm tracking-wide">
            Negocios locales · 100% gratis
          </p>
        </div>

        <!-- Right: search bar -->
        <div class="w-full md:flex-1">
          <form @submit.prevent="buscar" class="flex flex-col sm:flex-row items-stretch bg-white rounded-xl overflow-hidden shadow-lg">
            <div class="flex flex-1 border-b sm:border-b-0">
              <div class="flex items-center gap-2 px-4 py-3.5 border-r border-gray-200 text-brand-text font-medium text-sm whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-primary shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                {{ cityStore.activeCityName }}
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="¿Qué estás buscando?"
                class="flex-1 min-w-0 px-4 py-3.5 text-brand-text placeholder-gray-400 text-sm focus:outline-none"
              />
            </div>
            <button type="submit" class="hidden sm:block bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold px-6 py-3.5 text-sm transition-colors duration-150 w-full sm:w-auto">
              Buscar
            </button>
          </form>
        </div>

      </div>
    </section>

    <!-- Negocios destacados -->
    <section class="bg-white py-12 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <div class="flex items-center justify-between mb-8">
          <h2 class="font-display font-black text-3xl md:text-4xl text-brand-text">Negocios destacados</h2>
          <a href="/list" class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors whitespace-nowrap">Ver todos →</a>
        </div>

        <!-- Loading -->
        <div v-if="featuredPending" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col animate-pulse">
            <!-- accent bar -->
            <div class="h-1.5 w-full bg-gray-200" />
            <div class="p-5 flex flex-col flex-1">
              <!-- logo + name -->
              <div class="flex items-start gap-4 mb-4">
                <div class="w-14 h-14 rounded-xl bg-gray-200 shrink-0" />
                <div class="flex-1 pt-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4" />
                  <div class="flex gap-2">
                    <div class="h-5 bg-gray-200 rounded-full w-20" />
                    <div class="h-5 bg-gray-200 rounded-full w-16" />
                  </div>
                </div>
              </div>
              <!-- description -->
              <div class="space-y-2 mb-4">
                <div class="h-3 bg-gray-200 rounded w-full" />
                <div class="h-3 bg-gray-200 rounded w-5/6" />
                <div class="h-3 bg-gray-200 rounded w-4/6" />
              </div>
              <!-- stars -->
              <div class="flex items-center gap-1.5 mb-3">
                <div class="flex gap-0.5">
                  <div v-for="j in 5" :key="j" class="w-4 h-4 bg-gray-200 rounded" />
                </div>
                <div class="h-3 bg-gray-200 rounded w-8" />
                <div class="h-3 bg-gray-200 rounded w-16" />
              </div>
              <!-- address + phone -->
              <div class="space-y-2 mb-5">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-gray-200 rounded shrink-0" />
                  <div class="h-3 bg-gray-200 rounded w-2/3" />
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-gray-200 rounded shrink-0" />
                  <div class="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <!-- CTA -->
              <div class="mt-auto">
                <div class="h-12 bg-gray-200 rounded-xl w-full" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            v-for="biz in featured"
            :key="biz.id"
            :href="`/negocios/${biz.slug}`"
            class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <!-- Cover photo -->
            <div class="relative h-28 shrink-0">
              <img
                v-if="biz.coverPhoto?.url"
                :src="biz.coverPhoto.url"
                :alt="biz.coverPhoto.alternativeText ?? biz.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                :class="['w-full h-full opacity-20', biz.category?.color ? '' : getCategoriaConfig(biz.category?.slug).accentColor]"
                :style="biz.category?.color ? { backgroundColor: biz.category.color } : {}"
              />
              <div
                :class="['absolute bottom-0 left-0 w-full h-1.5', biz.category?.color ? '' : getCategoriaConfig(biz.category?.slug).accentColor]"
                :style="biz.category?.color ? { backgroundColor: biz.category.color } : {}"
              />
            </div>

            <div class="p-5 flex flex-col flex-1">
              <!-- Logo + name + badges -->
              <div class="flex items-start gap-4 mb-4">
                <div class="w-14 h-14 rounded-xl bg-brand-bg-dark overflow-hidden flex items-center justify-center text-white font-bold text-xl shrink-0">
                  <img
                    v-if="biz.logo?.url"
                    :src="biz.logo.url"
                    :alt="biz.logo.alternativeText ?? biz.name"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ (biz.name ?? '?').charAt(0) }}</span>
                </div>
                <div>
                  <h3 class="font-display font-bold text-lg text-brand-text leading-tight">{{ biz.name ?? 'Sin nombre' }}</h3>
                  <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span v-if="biz.category" :class="['text-xs font-medium px-2 py-0.5 rounded-full border', getCategoriaConfig(biz.category.slug).badgeStyle]">
                      {{ biz.category.name }}
                    </span>
                    <span
                      v-if="biz.isOpen !== null && biz.isOpen !== undefined"
                      :class="['text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1', biz.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600']"
                    >
                      <span :class="['w-1.5 h-1.5 rounded-full', biz.isOpen ? 'bg-emerald-500' : 'bg-red-500']" />
                      {{ biz.isOpen ? 'Abierto' : 'Cerrado' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="text-brand-text text-sm leading-relaxed mb-4">{{ biz.shortDescription ?? biz.description ?? 'Sin descripción disponible.' }}</p>

              <!-- Rating -->
              <div class="flex items-center gap-1.5 mb-3">
                <div class="flex gap-0.5">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :class="['w-4 h-4', i <= Math.round(biz.ratingAverage ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
                  />
                </div>
                <span class="text-sm font-semibold text-brand-text">{{ (biz.ratingAverage ?? 0).toFixed(1) }}</span>
                <span class="text-sm text-brand-azulgris">({{ biz.ratingCount ?? 0 }} reseñas)</span>
              </div>

              <!-- Details -->
              <div class="space-y-2 mb-5">
                <div class="flex items-center gap-2 text-sm text-brand-azulgris">
                  <MapPin class="w-4 h-4 shrink-0" />
                  <span>{{ biz.address || 'Dirección no disponible' }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-brand-azulgris">
                  <Phone class="w-4 h-4 shrink-0" />
                  <span>{{ biz.phones[0]?.number ?? 'Teléfono no disponible' }}</span>
                  <span v-if="biz.phones.length > 1" class="text-xs opacity-60">+{{ biz.phones.length - 1 }} más</span>
                </div>
              </div>

              <!-- CTA -->
              <div class="mt-auto">
                <span class="block w-full bg-brand-bg-dark hover:opacity-90 text-white text-sm font-semibold text-center py-3.5 rounded-xl transition-opacity">
                  Ver perfil completo →
                </span>
              </div>
            </div>
          </a>
        </div>

      </div>
    </section>

    <!-- Categories grid -->
    <section class="bg-slate-100 py-12 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <div class="flex items-center justify-between mb-8">
          <h2 class="font-display font-black text-3xl md:text-4xl text-brand-text">¿Qué estás buscando?</h2>
          <a href="/categorias" class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors whitespace-nowrap">Ver todas →</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <a
            v-for="cat in categoriasGrid"
            :key="cat.slug"
            :href="`/list`"
            @click.prevent="store.setCategoria(cat.slug); router.push('/list')"
            class="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div
              :class="['w-12 h-12 rounded-xl flex items-center justify-center shrink-0', cat.color ? '' : getCategoriaConfig(cat.slug).iconBg]"
              :style="cat.color ? { backgroundColor: cat.color + '33' } : {}"
            >
              <component :is="getLucideIcon(cat.icon)" :class="['w-6 h-6', getCategoriaConfig(cat.slug).iconColor]" />
            </div>
            <div>
              <p class="font-semibold text-brand-text text-sm leading-tight">{{ cat.name }}</p>
              <p v-if="cat.totalNegocios" class="text-brand-azulgris text-xs mt-0.5">{{ cat.totalNegocios }} negocios</p>
            </div>
          </a>

          <!-- Ver todas -->
          <a
            href="/categorias"
            class="bg-brand-bg-dark rounded-2xl p-5 flex items-center gap-4 hover:opacity-90 transition-opacity"
          >
            <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <LayoutGrid class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="font-semibold text-white text-sm leading-tight">Ver todas</p>
              <p class="text-gray-400 text-xs mt-0.5">{{ categoriasCarrusel.length }} categorías</p>
            </div>
          </a>
        </div>

      </div>
    </section>

    <!-- Explorar el directorio -->
    <section id="what-do-you-want" class="bg-brand-bg-dark py-12 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <!-- Section header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p class="text-brand-azulgris text-xs font-semibold tracking-widest uppercase mb-2">Directorio completo</p>
            <h2 class="font-display font-black text-4xl md:text-5xl text-white">Explorar el directorio</h2>
            <p class="text-brand-azulgris text-sm mt-2">{{ cityStore.activeCityLabel }}</p>
          </div>
          <!-- Category filter pills -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categoriasCarrusel"
              :key="cat.slug"
              @click="store.setCategoria(cat.slug); router.push('/list')"
              class="px-4 py-1.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 transition-colors"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Category carousels -->
        <div class="space-y-10">
          <CategoryCarousel
            v-for="cat in categoriaCatalog"
            :key="cat.slug"
            :slug="cat.slug"
            :name="cat.name"
            :icon="getLucideIcon(cat.icon)"
            :accent-color="getCategoriaConfig(cat.slug).accentColor"
            :color="cat.color"
            :count="cat.totalNegocios"
          />
        </div>

      </div>
    </section>

    <!-- CTA: ¿Tienes un negocio? -->
    <section class="relative overflow-hidden bg-brand-primary py-16 px-6 md:px-12">
   

      <!-- Background cityscape -->
      <div class="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 opacity-20 z-0">
        <svg viewBox="0 0 640 170" width="640" height="170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <!-- Ground -->
          <rect x="0" y="157" width="640" height="13" fill="#C8D5E0"/>

          <!-- Building 1: Farmacia (green) -->
          <rect x="6" y="70" width="74" height="87" fill="#2A7A5F"/>
          <path d="M2,70 L82,70 L78,84 L6,84 Z" fill="#1F5A45"/>
          <path d="M2,84 Q9,78 16,84 Q23,78 30,84 Q37,78 44,84 Q51,78 58,84 Q65,78 72,84 Q79,78 82,84" fill="none" stroke="#1F5A45" stroke-width="2.5"/>
          <rect x="13" y="80" width="22" height="18" rx="2" fill="#B8D8C8"/>
          <rect x="45" y="80" width="22" height="18" rx="2" fill="#B8D8C8"/>
          <rect x="8" y="100" width="74" height="14" rx="2" fill="#E4F0EA"/>
          <rect x="35" y="103" width="14" height="3" fill="#2A7A5F"/>
          <rect x="41" y="101" width="3" height="7" fill="#2A7A5F"/>
          <rect x="28" y="122" width="24" height="35" fill="#1F5A45"/>
          <path d="M28,127 A12,12 0 0,1 52,127" fill="#1F5A45"/>

          <!-- Street lamp 1 -->
          <rect x="85" y="102" width="3" height="55" fill="#8094A8"/>
          <path d="M88,102 Q100,102 100,113 L100,122" fill="none" stroke="#8094A8" stroke-width="2.5" stroke-linecap="round"/>
          <ellipse cx="100" cy="124" rx="7" ry="3.5" fill="#D48B1A"/>
          <ellipse cx="100" cy="123" rx="4" ry="2" fill="#F5D070"/>

          <!-- Building 2: Tall oficina (blue) -->
          <rect x="97" y="38" width="64" height="119" fill="#1D5A8A"/>
          <rect x="105" y="50" width="18" height="14" rx="1" fill="#A8CCEA"/>
          <rect x="134" y="50" width="18" height="14" rx="1" fill="#A8CCEA"/>
          <rect x="105" y="72" width="18" height="14" rx="1" fill="#D48B1A" opacity="0.85"/>
          <rect x="134" y="72" width="18" height="14" rx="1" fill="#A8CCEA"/>
          <rect x="105" y="94" width="18" height="14" rx="1" fill="#A8CCEA"/>
          <rect x="134" y="94" width="18" height="14" rx="1" fill="#D48B1A" opacity="0.85"/>
          <rect x="113" y="129" width="30" height="28" rx="1" fill="#174D7A"/>

          <!-- Building 3: Iglesia (cream/colonial) -->
          <rect x="170" y="24" width="50" height="133" fill="#E8DFD0"/>
          <path d="M176,26 L214,26 L214,54 A19,19 0 0,1 176,54 Z" fill="#C8B89A"/>
          <rect x="191" y="8" width="4" height="20" fill="#8094A8"/>
          <rect x="185" y="14" width="16" height="4" fill="#8094A8"/>
          <rect x="177" y="62" width="14" height="20" rx="7" fill="#A8CCEA"/>
          <rect x="199" y="62" width="14" height="20" rx="7" fill="#A8CCEA"/>
          <rect x="178" y="120" width="26" height="37" fill="#C8B89A"/>
          <path d="M178,126 A13,13 0 0,1 204,126" fill="#C8B89A"/>
          <rect x="166" y="154" width="58" height="4" rx="1" fill="#B8A890"/>

          <!-- Tree between church and taco -->
          <rect x="228" y="132" width="6" height="25" fill="#6B7A8A"/>
          <ellipse cx="231" cy="122" rx="16" ry="17" fill="#2A7A5F"/>
          <ellipse cx="225" cy="126" rx="10" ry="12" fill="#3AAA80"/>

          <!-- Building 4: Tacos (terracotta) -->
          <rect x="246" y="74" width="90" height="83" fill="#B85030"/>
          <path d="M242,74 L340,74 L336,90 L246,90 Z" fill="#D4693A"/>
          <path d="M244,90 Q250,84 256,90 Q262,84 268,90 Q274,84 280,90 Q286,84 292,90 Q298,84 304,90 Q310,84 316,90 Q322,84 328,90 Q334,84 336,90" fill="none" stroke="#D4693A" stroke-width="2.5"/>
          <rect x="254" y="93" width="74" height="16" rx="3" fill="#F5E6D8"/>
          <rect x="261" y="97" width="8" height="3" rx="1" fill="#B85030"/>
          <rect x="273" y="97" width="12" height="3" rx="1" fill="#B85030"/>
          <rect x="289" y="97" width="10" height="3" rx="1" fill="#B85030"/>
          <rect x="303" y="97" width="8" height="3" rx="1" fill="#B85030"/>
          <rect x="252" y="114" width="30" height="22" rx="2" fill="#F0D5C0"/>
          <rect x="290" y="114" width="30" height="22" rx="2" fill="#F0D5C0"/>
          <rect x="262" y="124" width="26" height="33" rx="2" fill="#8B3518"/>

          <!-- Street lamp 2 -->
          <rect x="342" y="112" width="3" height="45" fill="#8094A8"/>
          <path d="M345,112 Q357,112 357,123 L357,131" fill="none" stroke="#8094A8" stroke-width="2.5" stroke-linecap="round"/>
          <ellipse cx="357" cy="133" rx="7" ry="3.5" fill="#D48B1A"/>
          <ellipse cx="357" cy="132" rx="4" ry="2" fill="#F5D070"/>

          <!-- Building 5: Abarrotes (gold) -->
          <rect x="352" y="54" width="78" height="103" fill="#D48B1A"/>
          <rect x="360" y="66" width="24" height="20" rx="2" fill="#FBF0D4"/>
          <rect x="396" y="66" width="24" height="20" rx="2" fill="#FBF0D4"/>
          <rect x="352" y="90" width="78" height="15" fill="#B87510"/>
          <rect x="362" y="93" width="10" height="3" rx="1" fill="#D48B1A"/>
          <rect x="376" y="93" width="14" height="3" rx="1" fill="#D48B1A"/>
          <rect x="394" y="93" width="10" height="3" rx="1" fill="#D48B1A"/>
          <rect x="370" y="118" width="28" height="39" rx="2" fill="#96630C"/>

          <!-- Small plant outside abarrotes -->
          <rect x="354" y="143" width="5" height="14" fill="#5A3A08"/>
          <ellipse cx="357" cy="137" rx="10" ry="11" fill="#2A7A5F"/>

          <!-- Tree -->
          <rect x="440" y="135" width="6" height="22" fill="#6B7A8A"/>
          <ellipse cx="443" cy="124" rx="15" ry="16" fill="#3AAA80"/>

          <!-- Building 6: Casa colonialita (sky blue) -->
          <rect x="456" y="80" width="68" height="77" fill="#5B9FD4"/>
          <polygon points="451,80 528,80 480,50" fill="#3D7AA8"/>
          <rect x="463" y="94" width="20" height="16" rx="2" fill="#C8E4F8"/>
          <rect x="493" y="94" width="20" height="16" rx="2" fill="#C8E4F8"/>
          <rect x="469" y="123" width="22" height="34" rx="2" fill="#3D7AA8"/>
          <circle cx="489" cy="141" r="2.5" fill="#D48B1A"/>

          <!-- Building 7: Tall dark right edge -->
          <rect x="532" y="34" width="112" height="123" fill="#1A2535"/>
          <rect x="540" y="48" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="562" y="48" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="584" y="48" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="608" y="48" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="540" y="68" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="562" y="68" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="584" y="68" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="608" y="68" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="540" y="88" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="562" y="88" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="584" y="88" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="608" y="88" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="540" y="108" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="562" y="108" width="16" height="13" rx="1" fill="#D48B1A" opacity="0.8"/>
          <rect x="608" y="108" width="16" height="13" rx="1" fill="#A8CCEA"/>
          <rect x="560" y="130" width="28" height="27" rx="1" fill="#0D1925"/>
        </svg>
      </div>

      <div class="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        <div class="max-w-xl">
          <p class="text-white/60 text-xs font-semibold tracking-widest uppercase mb-3">Para dueños de negocio</p>
          <h2 class="font-display font-black text-4xl md:text-5xl text-white leading-tight mb-4">
            ¿Tienes un negocio<br>en {{ cityStore.activeCityName }}?
          </h2>
          <p class="text-white/75 text-sm leading-relaxed">
            Regístralo gratis en Mandaditoz y llega a más clientes del municipio.<br class="hidden md:block">
            Sin costos, sin contratos, sin complicaciones.
          </p>
        </div>
        <div class="flex flex-col items-center gap-3 shrink-0">
          <a href="#" class="bg-brand-bg-dark hover:opacity-90 text-white font-semibold text-sm px-8 py-4 rounded-xl transition-opacity whitespace-nowrap">
            Registra tu negocio gratis →
          </a>
          <p class="text-white/50 text-xs">Tarda menos de 5 minutos</p>
        </div>
      </div>
    </section>

  </main>
</template>
