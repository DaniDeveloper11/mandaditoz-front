<script setup>
import {
  LayoutList, Phone, Clock, Star, ChevronDown, ChevronLeft, ChevronRight,
  Check, Info, Sparkles, AlertCircle,
} from '@lucide/vue'

definePageMeta({ layout: 'landing' })

const router = useRouter()
const { isLoggedIn } = useAuthStore()
const { categorias } = useCategorias({ limit: 100, allDepths: true })
const { createBusiness, loading, error, clearError } = useNegocioCreate()
const { publishedCount, publishedLimit, canPublishMore } = useMisNegocios()

onMounted(() => {
  if (!isLoggedIn) router.replace('/login?redirect=/negocios/nuevo')
})

watch(canPublishMore, (v) => {
  if (!v) form.isPublished = false
})

const DAY_ORDER  = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' }
const ESTADOS_MX = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas',
  'Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Guanajuato',
  'Guerrero','Hidalgo','Jalisco','México','Michoacán','Morelos','Nayarit',
  'Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí',
  'Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas',
]

const steps = [
  { id: 'info',     label: 'Información básica', icon: LayoutList },
  { id: 'contacto', label: 'Contacto',           icon: Phone },
  { id: 'horario',  label: 'Horario',            icon: Clock },
  { id: 'publicar', label: 'Publicar',           icon: Star },
]

const currentStep = ref(0)
const stepErrors = ref({})

const form = reactive({
  name: '',
  categoryId: null,
  shortDescription: '',
  description: '',

  phone: '',
  whatsapp: '',
  email: '',
  calle: '',
  numero: '',
  colonia: '',
  municipio: 'Etzatlán',
  estado: 'Jalisco',
  website: '',

  hours: DAY_ORDER.map(day => ({
    dayOfWeek: day,
    openTime: '09:00',
    closeTime: '19:00',
    isClosed: day === 'sun',
    is24Hours: false,
  })),

  isPublished: false,
})

const isFirstStep = computed(() => currentStep.value === 0)
const isLastStep  = computed(() => currentStep.value === steps.length - 1)
const currentStepMeta = computed(() => steps[currentStep.value])

function validateStep(idx) {
  const errors = {}
  if (idx === 0) {
    if (!form.name.trim())        errors.name = 'El nombre es obligatorio'
    else if (form.name.trim().length < 2) errors.name = 'Mínimo 2 caracteres'
    if (!form.categoryId)         errors.categoryId = 'Selecciona una categoría'
  }
  if (idx === 1) {
    if (!form.phone.replace(/\D/g, '')) errors.phone = 'Al menos un teléfono es obligatorio'
    if (!form.calle.trim())             errors.calle = 'La calle es obligatoria'
    if (form.email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errors.email = 'Email inválido'
    if (form.website && !/^https?:\/\/[^\s]+\.[^\s]+$/.test(form.website)) errors.website = 'URL inválida (debe iniciar con http:// o https://)'
  }
  return errors
}

function goNext() {
  const errors = validateStep(currentStep.value)
  stepErrors.value = errors
  if (Object.keys(errors).length) return
  if (!isLastStep.value) currentStep.value++
}

function goPrev() {
  stepErrors.value = {}
  if (!isFirstStep.value) currentStep.value--
}

function goTo(idx) {
  if (idx < currentStep.value) {
    stepErrors.value = {}
    currentStep.value = idx
    return
  }
  for (let i = currentStep.value; i < idx; i++) {
    const errors = validateStep(i)
    if (Object.keys(errors).length) {
      stepErrors.value = errors
      currentStep.value = i
      return
    }
  }
  stepErrors.value = {}
  currentStep.value = idx
}

function buildPayload() {
  const cleanPhone = form.phone.replace(/\D/g, '')
  const cleanWa    = form.whatsapp.replace(/\D/g, '')
  const samePhone  = cleanPhone && cleanWa && cleanPhone === cleanWa

  const phones = []
  if (cleanPhone) {
    phones.push({
      number: `+52${cleanPhone}`,
      label: 'mobile',
      hasWhatsapp: samePhone || !cleanWa,
      isPrimary: true,
    })
  }
  if (cleanWa && !samePhone) {
    phones.push({
      number: `+52${cleanWa}`,
      label: 'whatsapp',
      hasWhatsapp: true,
      isPrimary: !cleanPhone,
    })
  }

  const rawText = [
    [form.calle, form.numero].filter(Boolean).join(' '),
    form.colonia,
    form.municipio,
    form.estado,
  ].filter(Boolean).join(', ')

  return {
    name: form.name.trim(),
    shortDescription: form.shortDescription.trim() || null,
    description: form.description.trim() || null,
    email: form.email.trim() || null,
    website: form.website.trim() || null,
    category: form.categoryId,
    phones,
    address: {
      street: form.calle.trim(),
      exteriorNumber: form.numero.trim() || null,
      rawText,
    },
    businessStatus: form.isPublished ? 'published' : 'draft',
    hours: form.hours.map(h => ({
      dayOfWeek: h.dayOfWeek,
      openTime:  h.openTime,
      closeTime: h.closeTime,
      isClosed:  h.isClosed,
      is24Hours: h.is24Hours,
    })),
  }
}

async function handleSubmit() {
  const errors = validateStep(0)
  Object.assign(errors, validateStep(1))
  if (Object.keys(errors).length) {
    stepErrors.value = errors
    if (errors.name || errors.categoryId) currentStep.value = 0
    else currentStep.value = 1
    return
  }
  clearError()
  try {
    const { slug } = await createBusiness(buildPayload())
    if (slug) router.push(`/negocios/${slug}/edit`)
  } catch { /* error se muestra desde composable */ }
}

const selectedCategoryName = computed(() =>
  categorias.value?.find(c => c.documentId === form.categoryId)?.name ?? ''
)
</script>

<template>
  <div class="min-h-screen bg-slate-100 py-10 px-4 md:px-8">
    <div class="max-w-3xl mx-auto">

      <!-- Encabezado -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-3">
          <Sparkles class="w-3.5 h-3.5" />
          Nuevo negocio
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text">Registra tu negocio</h1>
        <p class="text-brand-azulgris text-sm mt-2 max-w-md mx-auto">
          En unos pasos tu negocio aparecerá en el directorio de Etzatlán.
        </p>
      </div>

      <!-- Stepper -->
      <div class="flex items-center justify-between mb-8">
        <template v-for="(step, idx) in steps" :key="step.id">
          <button
            type="button"
            @click="goTo(idx)"
            class="flex items-center gap-2 group"
            :disabled="loading"
          >
            <span
              :class="[
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors shrink-0',
                idx < currentStep
                  ? 'bg-brand-bg-dark text-white'
                  : idx === currentStep
                    ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20'
                    : 'bg-white border border-gray-200 text-gray-400',
              ]"
            >
              <Check v-if="idx < currentStep" class="w-4 h-4" />
              <span v-else>{{ idx + 1 }}</span>
            </span>
            <span
              :class="[
                'hidden md:inline text-sm font-semibold whitespace-nowrap transition-colors',
                idx === currentStep ? 'text-brand-text' : 'text-brand-azulgris',
              ]"
            >{{ step.label }}</span>
          </button>
          <div
            v-if="idx < steps.length - 1"
            :class="[
              'flex-1 h-0.5 mx-2 md:mx-3 transition-colors',
              idx < currentStep ? 'bg-brand-bg-dark' : 'bg-gray-200',
            ]"
          />
        </template>
      </div>

      <!-- Error global -->
      <div
        v-if="error"
        class="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
      >
        <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
        <span class="flex-1">{{ error }}</span>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-sm p-6 md:p-8">

        <!-- Encabezado sección -->
        <div class="flex items-center gap-3 pb-5 border-b border-gray-100 mb-7">
          <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <component :is="currentStepMeta.icon" class="w-4 h-4 text-brand-text" />
          </div>
          <div>
            <p class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Paso {{ currentStep + 1 }} de {{ steps.length }}</p>
            <h2 class="font-display font-black text-2xl text-brand-text">{{ currentStepMeta.label }}</h2>
          </div>
        </div>

        <!-- ══ Información básica ══ -->
        <template v-if="currentStep === 0">
          <div class="space-y-6">
            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Nombre del negocio *
              </label>
              <input
                v-model="form.name"
                type="text"
                maxlength="120"
                placeholder="Ej. Tacos El Güero"
                class="w-full border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                :class="stepErrors.name ? 'border-red-300' : 'border-gray-200'"
              />
              <p v-if="stepErrors.name" class="text-red-600 text-xs mt-1.5">{{ stepErrors.name }}</p>
            </div>

            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Categoría *
              </label>
              <div class="relative">
                <select
                  v-model="form.categoryId"
                  class="w-full appearance-none border rounded-xl px-4 py-2.5 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition pr-10"
                  :class="stepErrors.categoryId ? 'border-red-300' : 'border-gray-200'"
                >
                  <option :value="null" disabled>Selecciona una categoría</option>
                  <option v-for="cat in categorias" :key="cat.documentId" :value="cat.documentId">
                    {{ cat.name }}
                  </option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p v-if="stepErrors.categoryId" class="text-red-600 text-xs mt-1.5">{{ stepErrors.categoryId }}</p>
            </div>

            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Descripción corta <span class="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <input
                v-model="form.shortDescription"
                type="text"
                maxlength="200"
                placeholder="Una frase que describa tu negocio"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
              />
              <p class="text-gray-400 text-xs mt-1.5">Se muestra en las tarjetas del directorio.</p>
            </div>

            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Descripción <span class="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                maxlength="3000"
                placeholder="Cuéntanos qué ofreces, tu especialidad, tu historia…"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition resize-none"
              />
            </div>
          </div>
        </template>

        <!-- ══ Contacto ══ -->
        <template v-else-if="currentStep === 1">
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Teléfono *</label>
                <div
                  class="flex items-center border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/30 focus-within:border-brand-primary transition"
                  :class="stepErrors.phone ? 'border-red-300' : 'border-gray-200'"
                >
                  <span class="px-3 py-2.5 text-sm font-semibold text-brand-primary bg-gray-50 border-r border-gray-200 shrink-0">+52</span>
                  <input v-model="form.phone" type="tel" placeholder="374 742 1234" class="flex-1 px-3 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none bg-transparent" />
                </div>
                <p v-if="stepErrors.phone" class="text-red-600 text-xs mt-1.5">{{ stepErrors.phone }}</p>
              </div>
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">WhatsApp <span class="font-normal normal-case text-gray-400">(opcional)</span></label>
                <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/30 focus-within:border-brand-primary transition">
                  <span class="px-3 py-2.5 text-sm font-semibold text-brand-primary bg-gray-50 border-r border-gray-200 shrink-0">+52</span>
                  <input v-model="form.whatsapp" type="tel" placeholder="Si es diferente al teléfono" class="flex-1 px-3 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none bg-transparent" />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Email <span class="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="contacto@minegocio.com"
                class="w-full border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                :class="stepErrors.email ? 'border-red-300' : 'border-gray-200'"
              />
              <p v-if="stepErrors.email" class="text-red-600 text-xs mt-1.5">{{ stepErrors.email }}</p>
            </div>

            <div class="grid grid-cols-[1fr_140px] gap-5">
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Calle *</label>
                <input
                  v-model="form.calle"
                  type="text"
                  placeholder="Av. Independencia"
                  class="w-full border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                  :class="stepErrors.calle ? 'border-red-300' : 'border-gray-200'"
                />
                <p v-if="stepErrors.calle" class="text-red-600 text-xs mt-1.5">{{ stepErrors.calle }}</p>
              </div>
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Número</label>
                <input v-model="form.numero" type="text" placeholder="42" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Colonia <span class="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <input v-model="form.colonia" type="text" placeholder="Centro" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Municipio</label>
                <input v-model="form.municipio" type="text" placeholder="Etzatlán" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition" />
              </div>
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Estado</label>
                <div class="relative">
                  <select v-model="form.estado" class="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition pr-10">
                    <option v-for="est in ESTADOS_MX" :key="est" :value="est">{{ est }}</option>
                  </select>
                  <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Sitio web <span class="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <input
                v-model="form.website"
                type="url"
                placeholder="https://mipagina.com"
                class="w-full border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                :class="stepErrors.website ? 'border-red-300' : 'border-gray-200'"
              />
              <p v-if="stepErrors.website" class="text-red-600 text-xs mt-1.5">{{ stepErrors.website }}</p>
            </div>
          </div>
        </template>

        <!-- ══ Horario ══ -->
        <template v-else-if="currentStep === 2">
          <div class="grid grid-cols-[110px_1fr_20px_1fr_64px] gap-3 items-center pb-3 mb-1 border-b border-gray-100">
            <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Día</span>
            <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Apertura</span>
            <span />
            <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Cierre</span>
            <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400 text-right">Abierto</span>
          </div>

          <div
            v-for="row in form.hours"
            :key="row.dayOfWeek"
            class="grid grid-cols-[110px_1fr_20px_1fr_64px] gap-3 items-center py-3 border-b border-gray-50 last:border-0"
          >
            <span class="font-semibold text-sm text-brand-text">{{ DAY_LABELS[row.dayOfWeek] }}</span>
            <input v-model="row.openTime" type="time" :disabled="row.isClosed" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition disabled:opacity-40 disabled:bg-gray-50" />
            <span class="text-gray-400 text-center text-sm select-none">–</span>
            <input v-model="row.closeTime" type="time" :disabled="row.isClosed" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition disabled:opacity-40 disabled:bg-gray-50" />
            <div class="flex justify-end">
              <button
                type="button"
                @click="row.isClosed = !row.isClosed"
                :class="[
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none',
                  !row.isClosed ? 'bg-brand-bg-dark' : 'bg-gray-200',
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    !row.isClosed ? 'translate-x-6' : 'translate-x-1',
                  ]"
                />
              </button>
            </div>
          </div>

          <div class="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <Info class="w-4 h-4 text-brand-azulgris shrink-0 mt-0.5" />
            <p class="text-brand-azulgris text-xs leading-relaxed">
              Podrás ajustar el horario cuando quieras. "Abierto ahora" aparecerá automáticamente en tu perfil.
            </p>
          </div>
        </template>

        <!-- ══ Publicar (resumen) ══ -->
        <template v-else-if="currentStep === 3">
          <div class="space-y-5">

            <!-- Resumen -->
            <div class="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              <div class="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-sm">
                <span class="text-brand-azulgris">Nombre</span>
                <span class="font-semibold text-brand-text">{{ form.name || '—' }}</span>
              </div>
              <div class="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-sm">
                <span class="text-brand-azulgris">Categoría</span>
                <span class="font-semibold text-brand-text">{{ selectedCategoryName || '—' }}</span>
              </div>
              <div class="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-sm">
                <span class="text-brand-azulgris">Teléfono</span>
                <span class="font-semibold text-brand-text">{{ form.phone ? `+52 ${form.phone}` : '—' }}</span>
              </div>
              <div class="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-sm">
                <span class="text-brand-azulgris">Dirección</span>
                <span class="font-semibold text-brand-text">
                  {{ [form.calle, form.numero].filter(Boolean).join(' ') || '—' }}<span v-if="form.colonia">, {{ form.colonia }}</span>, {{ form.municipio }}, {{ form.estado }}
                </span>
              </div>
            </div>

            <!-- Publicación -->
            <div
              class="flex items-start justify-between gap-6 p-5 rounded-2xl border"
              :class="canPublishMore ? 'border-gray-200' : 'border-amber-200 bg-amber-50/40'"
            >
              <div class="min-w-0">
                <p class="font-semibold text-brand-text text-sm mb-1">Publicar inmediatamente</p>
                <p class="text-brand-azulgris text-xs leading-relaxed">
                  Si lo dejas como <strong>borrador</strong>, podrás terminar de configurarlo (logo, fotos, menú, redes) antes de publicarlo.
                </p>
                <p v-if="!canPublishMore" class="text-amber-700 text-xs mt-2 font-semibold">
                  Ya tienes {{ publishedCount }}/{{ publishedLimit }} negocios publicados. Este solo puede crearse como borrador.
                </p>
                <p v-else class="text-brand-azulgris text-xs mt-2">
                  Publicados actuales: {{ publishedCount }}/{{ publishedLimit }}
                </p>
              </div>
              <button
                type="button"
                :disabled="!canPublishMore"
                @click="canPublishMore && (form.isPublished = !form.isPublished)"
                :class="[
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none mt-0.5',
                  form.isPublished ? 'bg-brand-bg-dark' : 'bg-gray-200',
                  !canPublishMore && 'opacity-40 cursor-not-allowed',
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    form.isPublished ? 'translate-x-6' : 'translate-x-1',
                  ]"
                />
              </button>
            </div>

            <div class="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
              <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p class="text-blue-700 text-xs leading-relaxed">
                Al crear el negocio te llevaremos a la pantalla de edición para subir <strong>logo, fotos y menú</strong>.
              </p>
            </div>
          </div>
        </template>

      </div>

      <!-- Botonera -->
      <div class="mt-6 flex items-center justify-between gap-3">
        <button
          v-if="!isFirstStep"
          type="button"
          @click="goPrev"
          :disabled="loading"
          class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-brand-text hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <ChevronLeft class="w-4 h-4" />
          Atrás
        </button>
        <span v-else />

        <button
          v-if="!isLastStep"
          type="button"
          @click="goNext"
          class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-bg-dark text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Continuar
          <ChevronRight class="w-4 h-4" />
        </button>

        <button
          v-else
          type="button"
          @click="handleSubmit"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span
            v-if="loading"
            class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
          />
          <Check v-else class="w-4 h-4" />
          {{ loading ? 'Creando…' : 'Crear negocio' }}
        </button>
      </div>

    </div>
  </div>
</template>
