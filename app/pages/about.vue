<script setup>
import { ArrowDown, Store, Search, Star } from '@lucide/vue'

definePageMeta({ layout: 'landing' })

const pasos = [
  {
    num: 1,
    icon: Store,
    title: 'El dueño registra su negocio',
    body: 'En menos de 5 minutos captura nombre, dirección, horario y categoría. Sin costo, sin tarjeta.',
    ringClass: 'bg-blue-50 text-brand-primary ring-blue-100',
  },
  {
    num: 2,
    icon: Search,
    title: 'El cliente encuentra y contacta',
    body: 'Busca por categoría o nombre, ve horarios en tiempo real y llama o manda WhatsApp con un clic.',
    ringClass: 'bg-amber-50 text-brand-ocre ring-amber-100',
  },
  {
    num: 3,
    icon: Star,
    title: 'El negocio crece con reseñas',
    body: 'Las reseñas auténticas construyen reputación y atraen más clientes cada mes.',
    ringClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
]

const promesas = [
  {
    num: '01',
    title: 'Gratuito para siempre',
    body: 'Nunca le cobraremos a un negocio local por existir en el directorio. El listado básico es y será sin costo — punto.',
    numColor: 'text-brand-primary',
  },
  {
    num: '02',
    title: 'Información verificada',
    body: 'Revisamos que los datos sean reales antes de publicar cada perfil. Un directorio sólo sirve si se puede confiar en él.',
    numColor: 'text-brand-ocre',
  },
  {
    num: '03',
    title: 'Hecho para el municipio',
    body: 'Pensado para la realidad de Etzatlán, Ameca o Ahualulco — no una plataforma de ciudad forzada a caber en el pueblo.',
    numColor: 'text-brand-terracota',
  },
]
</script>

<template>
  <main class="flex-1">

    <!-- Hero: Nuestra historia -->
    <section class="relative overflow-hidden bg-slate-50 py-16 md:py-24 px-6 md:px-12">
      <div class="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

        <!-- Left: eyebrow + headline + copy + CTAs -->
        <div>
          <!-- Eyebrow -->
          <div class="flex items-center gap-3 mb-8">
            <span class="h-px w-10 bg-brand-ocre" />
            <span class="text-brand-ocre text-xs font-semibold tracking-[0.25em] uppercase">
              Nuestra historia
            </span>
          </div>

          <!-- Headline -->
          <h1 class="font-display font-black text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight text-brand-bg-dark">
            Hacemos visible
            <span class="block text-brand-primary-dark">lo que ya era indispensable.</span>
          </h1>

          <!-- Body copy -->
          <p class="mt-8 max-w-lg text-brand-text-soft text-base md:text-lg leading-relaxed">
            El comercio local de Jalisco sostiene a miles de familias.
            Mandaditoz existe para que cualquier vecino lo encuentre, lo
            contacte y lo elija — en segundos, sin costo.
          </p>

          <!-- CTAs -->
          <div class="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <NuxtLink
              to="/list"
              class="inline-flex items-center justify-center bg-brand-primary hover:bg-brand-bg-dark text-white font-semibold text-sm px-7 py-4 rounded-xl transition-colors shadow-sm"
            >
              Explorar el directorio
            </NuxtLink>
            <a
              href="#nuestra-mision"
              class="inline-flex items-center gap-2 text-brand-primary font-semibold text-sm hover:text-brand-bg-dark transition-colors"
            >
              Nuestra misión
              <ArrowDown class="w-4 h-4" />
            </a>
          </div>
        </div>

        <!-- Right: illustrated card -->
        <div class="relative">
          <div class="relative rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200/70 aspect-square max-w-[520px] mx-auto p-8 md:p-10 flex flex-col overflow-hidden shadow-sm">
            <!-- Label -->
            <p class="text-brand-azulgris text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-right">
              Etzatlán · San juanito
            </p>

            <!-- Illustration: cityscape (from index.vue) -->
            <div class="mt-auto">
              <svg viewBox="0 0 640 170" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
          </div>
        </div>

      </div>
    </section>

    <!-- Stats bar -->
    <section class="bg-slate-50 px-6 md:px-12 pb-8 md:pb-12">
      <div class="max-w-6xl mx-auto">
        <div class="rounded-3xl bg-brand-bg-dark px-6 md:px-10 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          <div class="text-center">
            <p class="font-display font-black text-4xl md:text-5xl text-brand-primary-dark leading-none tracking-tight">1,240+</p>
            <p class="mt-3 text-brand-azulgris text-xs md:text-sm">Negocios registrados</p>
          </div>
          <div class="text-center">
            <p class="font-display font-black text-4xl md:text-5xl text-brand-ocre leading-none tracking-tight">2</p>
            <p class="mt-3 text-brand-azulgris text-xs md:text-sm">Municipios de Jalisco</p>
          </div>
          <div class="text-center">
            <p class="font-display font-black text-4xl md:text-5xl text-emerald-400 leading-none tracking-tight">9,800+</p>
            <p class="mt-3 text-brand-azulgris text-xs md:text-sm">Búsquedas mensuales</p>
          </div>
          <div class="text-center">
            <p class="font-display font-black text-4xl md:text-5xl text-white leading-none tracking-tight">2026</p>
            <p class="mt-3 text-brand-azulgris text-xs md:text-sm">Año de fundación</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Nuestra misión -->
    <section id="nuestra-mision" class="bg-white py-16 md:py-24 px-6 md:px-12">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
        <div class="md:col-span-4">
          <div class="flex items-center gap-3 mb-6">
            <span class="h-px w-10 bg-brand-primary" />
            <span class="text-brand-primary text-xs font-semibold tracking-[0.25em] uppercase">
              Nuestra misión
            </span>
          </div>
          <h2 class="font-display font-black text-4xl md:text-5xl leading-[0.95] tracking-tight text-brand-bg-dark">
            Un buscador<br>del municipio,<br>para el municipio.
          </h2>
        </div>
        <div class="md:col-span-8 md:pt-4">
          <p class="text-brand-text text-lg md:text-xl leading-relaxed max-w-2xl">
            Que ningún negocio local se quede fuera del mapa por no tener redes,
            página o presupuesto. Que cualquier vecino pueda resolver un pendiente
            <span class="text-brand-primary font-semibold">en segundos</span> — no
            entre 40 pestañas y grupos de WhatsApp.
          </p>
          <p class="mt-6 text-brand-text-soft text-base md:text-lg leading-relaxed max-w-2xl">
            Somos un directorio hecho por gente del pueblo, con la información
            verificada y siempre gratis para quien lo consulta y para quien lo
            publica.
          </p>
        </div>
      </div>
    </section>

    <!-- Del registro al cliente, en 3 pasos -->
    <section class="bg-slate-50 py-16 md:py-24 px-6 md:px-12">
      <div class="max-w-6xl mx-auto">

        <div class="max-w-3xl mb-14 md:mb-20">
          <div class="flex items-center gap-3 mb-6">
            <span class="h-px w-10 bg-brand-primary" />
            <span class="text-brand-primary text-xs font-semibold tracking-[0.25em] uppercase">
              Simple y rápido
            </span>
          </div>
          <h2 class="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight text-brand-bg-dark">
            Del registro al cliente, en 3 pasos
          </h2>
          <p class="mt-6 text-brand-azulgris text-base md:text-lg leading-relaxed max-w-md">
            Sin comisiones, sin intermediarios, sin apps que instalar.
          </p>
        </div>

        <div class="relative">
          <!-- Dashed connector (desktop only) -->
          <div class="hidden md:block absolute left-0 right-0 top-8 border-t border-dashed border-slate-300 mx-24" aria-hidden="true" />

          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            <div
              v-for="paso in pasos"
              :key="paso.num"
              class="relative flex flex-col"
            >
              <!-- Numbered circle -->
              <div
                :class="['relative z-10 w-16 h-16 rounded-full flex items-center justify-center font-display font-black text-2xl ring-8', paso.ringClass]"
              >
                {{ paso.num }}
              </div>

              <!-- Content -->
              <div class="mt-8">
                <h3 class="font-display font-black text-xl md:text-2xl text-brand-bg-dark leading-tight">
                  {{ paso.title }}
                </h3>
                <p class="mt-4 text-brand-text-soft text-sm md:text-base leading-relaxed max-w-xs">
                  {{ paso.body }}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Tres promesas -->
    <section class="bg-white py-16 md:py-24 px-6 md:px-12">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">

        <!-- Left: heading -->
        <div class="md:col-span-5">
          <div class="flex items-center gap-3 mb-6">
            <span class="h-px w-10 bg-brand-primary" />
            <span class="text-brand-primary text-xs font-semibold tracking-[0.25em] uppercase">
              Por qué existimos
            </span>
          </div>
          <h2 class="font-display font-black text-5xl md:text-6xl leading-[0.95] tracking-tight text-brand-bg-dark">
            Tres promesas que no vamos a romper.
          </h2>
          <p class="mt-8 text-brand-azulgris text-base md:text-lg leading-relaxed max-w-sm">
            Nacimos en un municipio, para los municipios. Todo lo que construimos parte de estos principios.
          </p>
        </div>

        <!-- Right: promises list -->
        <div class="md:col-span-7">
          <div class="border-t border-slate-200">
            <div
              v-for="promesa in promesas"
              :key="promesa.num"
              class="py-8 md:py-10 border-b border-slate-200 flex flex-col sm:flex-row gap-5 sm:gap-8"
            >
              <span
                :class="['font-display font-black text-5xl md:text-6xl leading-none tracking-tight shrink-0', promesa.numColor]"
              >
                {{ promesa.num }}
              </span>
              <div class="flex-1 pt-1">
                <h3 class="font-display font-black text-2xl md:text-3xl text-brand-bg-dark leading-tight">
                  {{ promesa.title }}
                </h3>
                <p class="mt-3 text-brand-text-soft text-sm md:text-base leading-relaxed max-w-lg">
                  {{ promesa.body }}
                </p>
              </div>
            </div>
          </div>
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
