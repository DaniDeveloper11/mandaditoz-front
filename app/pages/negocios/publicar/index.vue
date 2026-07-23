<script setup>
import {
  LayoutList, Phone, Clock, User, ChevronDown, ChevronLeft, ChevronRight,
  Check, Info, Sparkles, AlertCircle, Send, Package, Utensils, LayoutGrid,
  MapPin, MapPinOff, Globe, Wallet, Banknote, ArrowLeftRight, CreditCard,
  Image as ImageIcon, BookOpen, Upload, FileText, X, Loader2,
} from '@lucide/vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

definePageMeta({ layout: 'publicar' })

const router = useRouter()
const { categorias } = useCategorias({ limit: 100, allDepths: true })
const { submit, loading, error, clearError } = useNegocioSubmit()
const cityStore = useCityStore()

onMounted(() => {
  cityStore.fetchCities()
})

const showCategoryModal = ref(true)
const showCityModal = ref(false)

const QUICK_CATEGORIES = [
  {
    id: 'mandaditos',
    slug: 'moto-servicio',
    label: 'Mandaditos',
    description: 'Entregas, mandados y recados a domicilio.',
    icon: Package,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'restaurantes',
    slug: 'restaurantes',
    label: 'Restaurantes',
    description: 'Comida, bebidas, tacos, mariscos y más.',
    icon: Utensils,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-700',
  },
  {
    id: 'otros',
    slug: null,
    label: 'Otros',
    description: 'Elegir categoría en el siguiente paso.',
    icon: LayoutGrid,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
  },
]

function pickQuickCategory(quick) {
  if (quick.slug) {
    const match = categorias.value?.find(c => c.slug === quick.slug)
    if (match) form.categoryId = match.documentId
  }
  showCategoryModal.value = false
  showCityModal.value = true
}

function pickCity(city) {
  form.cityDocumentId = city.documentId
  if (city.stateName) form.estado = city.stateName
  showCityModal.value = false
}

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
  { id: 'info',      label: 'Sobre el negocio',      icon: LayoutList },
  { id: 'logo',      label: 'Logo',                  icon: ImageIcon },
  { id: 'menu',      label: 'Menú',                  icon: BookOpen },
  { id: 'contacto',  label: 'Contacto y ubicación',  icon: Phone },
  { id: 'horario',   label: 'Horario',               icon: Clock },
  { id: 'pagos',     label: 'Métodos de pago',       icon: Wallet },
  { id: 'submitter', label: 'Sobre ti',              icon: User },
]

const PAYMENT_METHODS = [
  { value: 'cash',     label: 'Efectivo',       description: 'Pagos en efectivo al recibir.', icon: Banknote,        iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { value: 'transfer', label: 'Transferencia',  description: 'SPEI o transferencia bancaria.', icon: ArrowLeftRight, iconBg: 'bg-blue-50',    iconColor: 'text-blue-700' },
  { value: 'card',     label: 'Tarjeta',        description: 'Débito o crédito con terminal.', icon: CreditCard,     iconBg: 'bg-purple-50',  iconColor: 'text-purple-600' },
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
  isMobile: false,
  calle: '',
  numero: '',
  colonia: '',
  cityDocumentId: cityStore.activeCity?.documentId ?? null,
  estado: cityStore.activeCityState ?? 'Jalisco',
  visibleInAllCities: false,
  website: '',

  hours: DAY_ORDER.map(day => ({
    dayOfWeek: day,
    openTime: '09:00',
    closeTime: '19:00',
    isClosed: day === 'sun',
    is24Hours: false,
  })),

  paymentMethods: [],

  logo: null,          // { id, url, name }
  menuMode: 'pdf',     // 'pdf' | 'images'
  menuPdf: null,       // { id, url, name }
  menuImages: [],      // Array<{ id, url, name }>

  submitterName: '',
  submitterEmail: '',
  submitterPhone: '',

  termsAccepted: false,
})

function togglePaymentMethod(value) {
  const idx = form.paymentMethods.indexOf(value)
  if (idx >= 0) form.paymentMethods.splice(idx, 1)
  else form.paymentMethods.push(value)
}

const { uploadFile, uploading: uploadingFile, error: uploadError } = useUpload()

const MAX_LOGO_MB = 5
const MAX_PDF_MB = 15
const MAX_IMAGE_MB = 8

function fileTooBig(file, maxMb) {
  return file.size > maxMb * 1024 * 1024
}

async function onLogoChange(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (fileTooBig(file, MAX_LOGO_MB)) {
    uploadError.value = `El logo debe ser menor a ${MAX_LOGO_MB} MB.`
    return
  }
  const uploaded = await uploadFile(file)
  form.logo = uploaded
}

function removeLogo() {
  form.logo = null
}

async function onMenuPdfChange(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (file.type !== 'application/pdf') {
    uploadError.value = 'El archivo debe ser un PDF.'
    return
  }
  if (fileTooBig(file, MAX_PDF_MB)) {
    uploadError.value = `El PDF debe ser menor a ${MAX_PDF_MB} MB.`
    return
  }
  const uploaded = await uploadFile(file)
  form.menuPdf = uploaded
}

function removeMenuPdf() {
  form.menuPdf = null
}

async function onMenuImagesChange(e) {
  const files = Array.from(e.target.files ?? [])
  e.target.value = ''
  for (const file of files) {
    if (fileTooBig(file, MAX_IMAGE_MB)) {
      uploadError.value = `Cada imagen debe ser menor a ${MAX_IMAGE_MB} MB.`
      continue
    }
    const uploaded = await uploadFile(file)
    form.menuImages.push(uploaded)
  }
}

function removeMenuImage(idx) {
  form.menuImages.splice(idx, 1)
}

watch(() => cityStore.activeCity?.documentId, (id) => {
  if (id && !form.cityDocumentId) form.cityDocumentId = id
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
  // idx === 1 (Logo) → opcional
  // idx === 2 (Menú) → opcional
  if (idx === 3) {
    if (!form.phone.replace(/\D/g, '')) errors.phone = 'Al menos un teléfono es obligatorio'
    if (!form.cityDocumentId)           errors.cityDocumentId = 'Selecciona un municipio'
    if (form.email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errors.email = 'Email inválido'
    if (form.website && !/^https?:\/\/[^\s]+\.[^\s]+$/.test(form.website)) errors.website = 'URL inválida (debe iniciar con http:// o https://)'
  }
  if (idx === 5) {
    if (!form.paymentMethods.length) errors.paymentMethods = 'Selecciona al menos un método de pago'
  }
  if (idx === 6) {
    if (!form.submitterName.trim()) errors.submitterName = 'Tu nombre es obligatorio'
    if (!form.submitterEmail.trim()) errors.submitterEmail = 'Tu email es obligatorio'
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.submitterEmail)) errors.submitterEmail = 'Email inválido'
    if (!form.submitterPhone.replace(/\D/g, '')) errors.submitterPhone = 'Tu teléfono es obligatorio'
    if (!form.termsAccepted) errors.termsAccepted = 'Debes aceptar los Términos y la Política de privacidad'
  }
  return errors
}

const selectedCity = computed(() =>
  cityStore.cities.find(c => c.documentId === form.cityDocumentId) ?? null
)

const selectedCityName = computed(() =>
  selectedCity.value?.name ?? cityStore.activeCityName
)

const selectedCategoryName = computed(() =>
  categorias.value?.find(c => c.documentId === form.categoryId)?.name ?? ''
)

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
    selectedCityName.value,
    form.estado,
  ].filter(Boolean).join(', ')

  const hasAddress = !form.isMobile && (form.calle.trim() || form.colonia.trim())
  const address = hasAddress
    ? {
        street: form.calle.trim() || null,
        exteriorNumber: form.numero.trim() || null,
        rawText,
      }
    : null

  const cleanSubmitterPhone = form.submitterPhone.replace(/\D/g, '')

  return {
    name: form.name.trim(),
    shortDescription: form.shortDescription.trim() || null,
    description: form.description.trim() || null,
    email: form.email.trim() || null,
    website: form.website.trim() || null,
    category: form.categoryId,
    city: form.cityDocumentId,
    phones,
    isMobile: form.isMobile,
    visibleInAllCities: form.visibleInAllCities,
    address,
    paymentMethods: form.paymentMethods.length ? form.paymentMethods : null,
    logo: form.logo?.id ?? null,
    menuPdf: form.menuMode === 'pdf' ? (form.menuPdf?.id ?? null) : null,
    menuImages: form.menuMode === 'images' && form.menuImages.length
      ? form.menuImages.map(f => f.id)
      : null,
    submitterName: form.submitterName.trim(),
    submitterEmail: form.submitterEmail.trim().toLowerCase(),
    submitterPhone: cleanSubmitterPhone ? `+52${cleanSubmitterPhone}` : null,
    termsAccepted: form.termsAccepted,
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
  const errors = { ...validateStep(0), ...validateStep(3), ...validateStep(5), ...validateStep(6) }
  if (Object.keys(errors).length) {
    stepErrors.value = errors
    if (errors.name || errors.categoryId) currentStep.value = 0
    else if (errors.phone || errors.cityDocumentId || errors.email || errors.website) currentStep.value = 3
    else if (errors.paymentMethods) currentStep.value = 5
    else currentStep.value = 6
    return
  }
  clearError()
  try {
    await submit(buildPayload())
    router.push('/negocios/publicar/gracias')
  } catch { /* error se muestra desde composable */ }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 py-10 px-4 md:px-8">
    <div class="max-w-3xl mx-auto">

      <!-- Encabezado -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-3">
          <Sparkles class="w-3.5 h-3.5" />
          Solicitar publicación
        </div>
        <h1 class="font-display font-black text-3xl md:text-4xl text-brand-text">Publica tu negocio</h1>
        <p class="text-brand-azulgris text-sm mt-2 max-w-md mx-auto">
          Llena estos pasos y un administrador revisará tu solicitud para publicarla en el directorio de {{ cityStore.activeCityName }}.
        </p>
      </div>

      <!-- Stepper: dots minimalistas sin numeración -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <button
          v-for="(step, idx) in steps"
          :key="step.id"
          type="button"
          @click="goTo(idx)"
          :disabled="loading"
          :aria-label="step.label"
          :aria-current="idx === currentStep ? 'step' : undefined"
          :class="[
            'rounded-full transition-all shrink-0',
            idx === currentStep
              ? 'w-8 h-2.5 bg-brand-primary'
              : idx < currentStep
                ? 'w-2.5 h-2.5 bg-brand-bg-dark'
                : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300',
          ]"
        />
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
          <h2 class="font-display font-black text-2xl text-brand-text">{{ currentStepMeta.label }}</h2>
        </div>

        <!-- ══ Sobre el negocio ══ -->
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

        <!-- ══ Logo ══ -->
        <template v-else-if="currentStep === 1">
          <div class="space-y-5">
            <p class="text-brand-azulgris text-sm">
              Sube el logo del negocio para que sea reconocible en el directorio.
              <span class="text-gray-400">Formato: imagen (JPG, PNG, WebP). Máximo {{ MAX_LOGO_MB }} MB.</span>
            </p>

            <!-- Zona de subida / preview -->
            <div v-if="!form.logo" class="relative">
              <label
                class="flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-2xl border-2 border-dashed border-gray-300 bg-slate-50 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  class="sr-only"
                  :disabled="uploadingFile"
                  @change="onLogoChange"
                />
                <div class="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Loader2 v-if="uploadingFile" class="w-6 h-6 text-brand-primary animate-spin" />
                  <Upload v-else class="w-6 h-6 text-brand-primary" />
                </div>
                <div class="text-center">
                  <p class="font-semibold text-sm text-brand-text">
                    {{ uploadingFile ? 'Subiendo…' : 'Toca aquí para elegir imagen' }}
                  </p>
                  <p class="text-brand-azulgris text-xs mt-1">o arrástrala desde tu galería</p>
                </div>
              </label>
            </div>

            <div v-else class="flex items-center gap-4 p-4 rounded-2xl border-2 border-brand-primary bg-brand-primary/5">
              <div class="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0">
                <img :src="form.logo.url" alt="Logo" class="w-full h-full object-contain" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-brand-text truncate">{{ form.logo.name }}</p>
                <p class="text-brand-azulgris text-xs mt-0.5">Logo cargado correctamente</p>
              </div>
              <button
                type="button"
                @click="removeLogo"
                class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shrink-0"
                aria-label="Quitar logo"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div v-if="uploadError" class="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
              <span>{{ uploadError }}</span>
            </div>

            <div class="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
              <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p class="text-blue-700 text-xs leading-relaxed">
                Este paso es opcional. Si no tienes un logo ahora, el administrador lo puede agregar más adelante.
              </p>
            </div>
          </div>
        </template>

        <!-- ══ Menú ══ -->
        <template v-else-if="currentStep === 2">
          <div class="space-y-5">
            <p class="text-brand-azulgris text-sm">
              Comparte el menú de tu negocio. Puedes subir un PDF o varias imágenes.
            </p>

            <!-- Selector PDF / Imágenes -->
            <div class="inline-flex bg-slate-100 rounded-xl p-1">
              <button
                type="button"
                @click="form.menuMode = 'pdf'"
                :class="[
                  'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors',
                  form.menuMode === 'pdf' ? 'bg-white text-brand-text shadow-sm' : 'text-brand-azulgris',
                ]"
              >PDF</button>
              <button
                type="button"
                @click="form.menuMode = 'images'"
                :class="[
                  'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors',
                  form.menuMode === 'images' ? 'bg-white text-brand-text shadow-sm' : 'text-brand-azulgris',
                ]"
              >Imágenes</button>
            </div>

            <!-- Modo PDF -->
            <template v-if="form.menuMode === 'pdf'">
              <div v-if="!form.menuPdf" class="relative">
                <label
                  class="flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-2xl border-2 border-dashed border-gray-300 bg-slate-50 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    class="sr-only"
                    :disabled="uploadingFile"
                    @change="onMenuPdfChange"
                  />
                  <div class="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <Loader2 v-if="uploadingFile" class="w-6 h-6 text-brand-primary animate-spin" />
                    <FileText v-else class="w-6 h-6 text-brand-primary" />
                  </div>
                  <div class="text-center">
                    <p class="font-semibold text-sm text-brand-text">
                      {{ uploadingFile ? 'Subiendo…' : 'Toca aquí para elegir PDF' }}
                    </p>
                    <p class="text-brand-azulgris text-xs mt-1">Máximo {{ MAX_PDF_MB }} MB.</p>
                  </div>
                </label>
              </div>

              <div v-else class="flex items-center gap-4 p-4 rounded-2xl border-2 border-brand-primary bg-brand-primary/5">
                <div class="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FileText class="w-6 h-6 text-red-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm text-brand-text truncate">{{ form.menuPdf.name }}</p>
                  <p class="text-brand-azulgris text-xs mt-0.5">PDF cargado correctamente</p>
                </div>
                <button
                  type="button"
                  @click="removeMenuPdf"
                  class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shrink-0"
                  aria-label="Quitar PDF"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </template>

            <!-- Modo Imágenes -->
            <template v-else>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="(img, idx) in form.menuImages"
                  :key="img.id"
                  class="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-slate-50"
                >
                  <img :src="img.url" :alt="img.name" class="w-full h-full object-cover" />
                  <button
                    type="button"
                    @click="removeMenuImage(idx)"
                    class="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-white/95 flex items-center justify-center text-gray-600 hover:text-red-500 shadow-sm"
                    aria-label="Quitar imagen"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>

                <label
                  class="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-slate-50 hover:border-brand-primary hover:bg-brand-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    class="sr-only"
                    :disabled="uploadingFile"
                    @change="onMenuImagesChange"
                  />
                  <Loader2 v-if="uploadingFile" class="w-6 h-6 text-brand-primary animate-spin" />
                  <Upload v-else class="w-6 h-6 text-brand-primary" />
                  <span class="text-xs font-semibold text-brand-text">Agregar</span>
                </label>
              </div>
              <p class="text-brand-azulgris text-xs">Máximo {{ MAX_IMAGE_MB }} MB por imagen.</p>
            </template>

            <div v-if="uploadError" class="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
              <span>{{ uploadError }}</span>
            </div>

            <div class="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
              <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p class="text-blue-700 text-xs leading-relaxed">
                Este paso es opcional. Puedes dejarlo en blanco si tu negocio no maneja menú.
              </p>
            </div>
          </div>
        </template>

        <!-- ══ Contacto y ubicación ══ -->
        <template v-else-if="currentStep === 3">
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

            <!-- Checkbox: negocio ambulante -->
            <button
              type="button"
              @click="form.isMobile = !form.isMobile"
              :class="[
                'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                form.isMobile ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-gray-300 bg-white',
              ]"
            >
              <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-slate-100">
                <component :is="form.isMobile ? MapPinOff : MapPin" class="w-5 h-5 text-slate-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-brand-text">Negocio ambulante o sin ubicación fija</p>
                <p class="text-brand-azulgris text-xs mt-0.5">Marca esta opción si es un puesto móvil, servicio a domicilio, etc.</p>
              </div>
              <div
                :class="[
                  'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
                  form.isMobile ? 'bg-brand-primary border-brand-primary' : 'border-gray-300',
                ]"
              >
                <Check v-if="form.isMobile" class="w-3.5 h-3.5 text-white" />
              </div>
            </button>

            <!-- Campos de dirección (solo si no es ambulante) -->
            <template v-if="!form.isMobile">
              <div class="grid grid-cols-[1fr_140px] gap-5">
                <div>
                  <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                    Calle <span class="font-normal normal-case text-gray-400">(opcional)</span>
                  </label>
                  <input
                    v-model="form.calle"
                    type="text"
                    placeholder="Av. Independencia"
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                  />
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
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Municipio *</label>
                <div class="relative">
                  <select
                    v-model="form.cityDocumentId"
                    class="w-full appearance-none border rounded-xl px-4 py-2.5 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition pr-10"
                    :class="stepErrors.cityDocumentId ? 'border-red-300' : 'border-gray-200'"
                  >
                    <option :value="null" disabled>
                      {{ cityStore.citiesPending ? 'Cargando municipios…' : 'Selecciona un municipio' }}
                    </option>
                    <option v-for="c in cityStore.cities" :key="c.documentId" :value="c.documentId">
                      {{ c.name }}<span v-if="c.stateName">, {{ c.stateName }}</span>
                    </option>
                  </select>
                  <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <p v-if="stepErrors.cityDocumentId" class="text-red-600 text-xs mt-1.5">{{ stepErrors.cityDocumentId }}</p>
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

            <button
              type="button"
              @click="form.visibleInAllCities = !form.visibleInAllCities"
              :class="[
                'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                form.visibleInAllCities ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-gray-300 bg-white',
              ]"
            >
              <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-slate-100">
                <Globe class="w-5 h-5 text-slate-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-brand-text">Visible en todos los municipios</p>
                <p class="text-brand-azulgris text-xs mt-0.5">Tu negocio también aparecerá en búsquedas de otros municipios, además de tu municipio base.</p>
              </div>
              <div
                :class="[
                  'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
                  form.visibleInAllCities ? 'bg-brand-primary border-brand-primary' : 'border-gray-300',
                ]"
              >
                <Check v-if="form.visibleInAllCities" class="w-3.5 h-3.5 text-white" />
              </div>
            </button>

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
        <template v-else-if="currentStep === 4">

          <!-- ── Móvil: card por día ── -->
          <div class="md:hidden space-y-3">
            <div
              v-for="row in form.hours"
              :key="`m-${row.dayOfWeek}`"
              :class="[
                'p-4 rounded-2xl border transition-colors',
                row.isClosed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200',
              ]"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="min-w-0">
                  <p class="font-semibold text-sm text-brand-text">{{ DAY_LABELS[row.dayOfWeek] }}</p>
                  <p class="text-[11px] mt-0.5" :class="row.isClosed ? 'text-gray-400' : 'text-emerald-600 font-semibold'">
                    {{ row.isClosed ? 'Cerrado' : 'Abierto' }}
                  </p>
                </div>
                <button
                  type="button"
                  @click="row.isClosed = !row.isClosed"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none',
                    !row.isClosed ? 'bg-brand-bg-dark' : 'bg-gray-300',
                  ]"
                  :aria-label="row.isClosed ? 'Marcar como abierto' : 'Marcar como cerrado'"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      !row.isClosed ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
              </div>

              <div v-if="!row.isClosed" class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input
                  v-model="row.openTime"
                  type="time"
                  class="w-full min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                />
                <span class="text-gray-400 text-sm select-none">–</span>
                <input
                  v-model="row.closeTime"
                  type="time"
                  class="w-full min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                />
              </div>
            </div>
          </div>

          <!-- ── Desktop: fila por día ── -->
          <div class="hidden md:block">
            <div class="grid grid-cols-[110px_1fr_20px_1fr_64px] gap-3 items-center pb-3 mb-1 border-b border-gray-100">
              <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Día</span>
              <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Apertura</span>
              <span />
              <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Cierre</span>
              <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400 text-right">Abierto</span>
            </div>

            <div
              v-for="row in form.hours"
              :key="`d-${row.dayOfWeek}`"
              class="grid grid-cols-[110px_1fr_20px_1fr_64px] gap-3 items-center py-3 border-b border-gray-50 last:border-0"
            >
              <span class="font-semibold text-sm text-brand-text">{{ DAY_LABELS[row.dayOfWeek] }}</span>
              <input
                v-model="row.openTime"
                type="time"
                :disabled="row.isClosed"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition disabled:opacity-40 disabled:bg-gray-50"
              />
              <span class="text-gray-400 text-center text-sm select-none">–</span>
              <input
                v-model="row.closeTime"
                type="time"
                :disabled="row.isClosed"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition disabled:opacity-40 disabled:bg-gray-50"
              />
              <div class="flex justify-end">
                <button
                  type="button"
                  @click="row.isClosed = !row.isClosed"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none',
                    !row.isClosed ? 'bg-brand-bg-dark' : 'bg-gray-300',
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
          </div>

          <div class="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
            <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p class="text-blue-700 text-xs leading-relaxed">
              Si no conoces todos los días con exactitud, deja los valores por defecto: el administrador los ajustará al revisar la solicitud.
            </p>
          </div>
        </template>

        <!-- ══ Métodos de pago ══ -->
        <template v-else-if="currentStep === 5">
          <div class="space-y-3">
            <button
              v-for="pm in PAYMENT_METHODS"
              :key="pm.value"
              type="button"
              @click="togglePaymentMethod(pm.value)"
              :class="[
                'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                form.paymentMethods.includes(pm.value)
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white',
              ]"
            >
              <div :class="['w-12 h-12 rounded-xl flex items-center justify-center shrink-0', pm.iconBg]">
                <component :is="pm.icon" :class="['w-6 h-6', pm.iconColor]" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-brand-text">{{ pm.label }}</p>
                <p class="text-brand-azulgris text-xs mt-0.5">{{ pm.description }}</p>
              </div>
              <div
                :class="[
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  form.paymentMethods.includes(pm.value)
                    ? 'bg-brand-primary border-brand-primary'
                    : 'border-gray-300',
                ]"
              >
                <Check v-if="form.paymentMethods.includes(pm.value)" class="w-3.5 h-3.5 text-white" />
              </div>
            </button>
          </div>

          <p v-if="stepErrors.paymentMethods" class="text-red-600 text-xs mt-3">{{ stepErrors.paymentMethods }}</p>

          <div class="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
            <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p class="text-blue-700 text-xs leading-relaxed">
              Puedes seleccionar más de uno. Aparecerán como distintivos en el perfil del negocio.
            </p>
          </div>
        </template>

        <!-- ══ Sobre ti (submitter) ══ -->
        <template v-else-if="currentStep === 6">
          <div class="space-y-6">
            <div class="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
              <Info class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p class="text-blue-700 text-xs leading-relaxed">
                Un administrador revisará tu solicitud y publicará el negocio. Usaremos estos datos únicamente para contactarte si necesitamos aclarar algo.
              </p>
            </div>

            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Tu nombre *
              </label>
              <input
                v-model="form.submitterName"
                type="text"
                maxlength="120"
                placeholder="Nombre completo"
                class="w-full border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                :class="stepErrors.submitterName ? 'border-red-300' : 'border-gray-200'"
              />
              <p v-if="stepErrors.submitterName" class="text-red-600 text-xs mt-1.5">{{ stepErrors.submitterName }}</p>
            </div>

            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Tu email *
              </label>
              <input
                v-model="form.submitterEmail"
                type="email"
                placeholder="tu@correo.com"
                class="w-full border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                :class="stepErrors.submitterEmail ? 'border-red-300' : 'border-gray-200'"
              />
              <p v-if="stepErrors.submitterEmail" class="text-red-600 text-xs mt-1.5">{{ stepErrors.submitterEmail }}</p>
            </div>

            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Tu teléfono *</label>
              <div
                class="flex items-center border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/30 focus-within:border-brand-primary transition"
                :class="stepErrors.submitterPhone ? 'border-red-300' : 'border-gray-200'"
              >
                <span class="px-3 py-2.5 text-sm font-semibold text-brand-primary bg-gray-50 border-r border-gray-200 shrink-0">+52</span>
                <input v-model="form.submitterPhone" type="tel" placeholder="374 742 1234" class="flex-1 px-3 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none bg-transparent" />
              </div>
              <p v-if="stepErrors.submitterPhone" class="text-red-600 text-xs mt-1.5">{{ stepErrors.submitterPhone }}</p>
            </div>

            <!-- Resumen breve -->
            <div class="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              <div class="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-sm">
                <span class="text-brand-azulgris">Negocio</span>
                <span class="font-semibold text-brand-text">{{ form.name || '—' }}</span>
              </div>
              <div class="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-sm">
                <span class="text-brand-azulgris">Categoría</span>
                <span class="font-semibold text-brand-text">{{ selectedCategoryName || '—' }}</span>
              </div>
              <div class="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-sm">
                <span class="text-brand-azulgris">Municipio</span>
                <span class="font-semibold text-brand-text">{{ selectedCityName || '—' }}</span>
              </div>
              <div class="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-sm">
                <span class="text-brand-azulgris">Pagos</span>
                <span class="font-semibold text-brand-text">
                  {{ form.paymentMethods.length
                    ? PAYMENT_METHODS.filter(p => form.paymentMethods.includes(p.value)).map(p => p.label).join(', ')
                    : '—' }}
                </span>
              </div>
            </div>

            <!-- Aceptación de T&C -->
            <div>
              <button
                type="button"
                @click="form.termsAccepted = !form.termsAccepted"
                :class="[
                  'w-full flex items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left',
                  form.termsAccepted
                    ? 'border-brand-primary bg-brand-primary/5'
                    : stepErrors.termsAccepted
                      ? 'border-red-300 bg-red-50/40'
                      : 'border-gray-200 hover:border-gray-300 bg-white',
                ]"
              >
                <div
                  :class="[
                    'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors mt-0.5',
                    form.termsAccepted ? 'bg-brand-primary border-brand-primary' : 'border-gray-300',
                  ]"
                >
                  <Check v-if="form.termsAccepted" class="w-3.5 h-3.5 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-brand-text leading-relaxed">
                    Acepto los
                    <NuxtLink to="/terminos" target="_blank" class="font-semibold text-brand-primary underline hover:opacity-80" @click.stop>Términos de uso</NuxtLink>
                    y la
                    <NuxtLink to="/privacidad" target="_blank" class="font-semibold text-brand-primary underline hover:opacity-80" @click.stop>Política de privacidad</NuxtLink>
                    de Mandaditoz.
                  </p>
                </div>
              </button>
              <p v-if="stepErrors.termsAccepted" class="text-red-600 text-xs mt-1.5">{{ stepErrors.termsAccepted }}</p>
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
          <Send v-else class="w-4 h-4" />
          {{ loading ? 'Enviando…' : 'Enviar solicitud' }}
        </button>
      </div>

    </div>

    <!-- Modal: selección rápida de categoría -->
    <TransitionRoot as="template" :show="showCategoryModal">
      <Dialog as="div" class="relative z-50" @close="() => {}">
        <TransitionChild
          as="template"
          enter="ease-out duration-200"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-150"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-brand-bg-dark/70 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <TransitionChild
            as="template"
            enter="ease-out duration-200"
            enter-from="opacity-0 translate-y-4 scale-95"
            enter-to="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-150"
            leave-from="opacity-100 translate-y-0 scale-100"
            leave-to="opacity-0 translate-y-2 scale-95"
          >
            <DialogPanel class="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 md:p-10">

              <div class="text-center mb-8">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold tracking-widest uppercase mb-3">
                  <Sparkles class="w-3.5 h-3.5" />
                  Comencemos
                </div>
                <DialogTitle class="font-display font-black text-2xl md:text-3xl text-brand-text">
                  ¿Qué tipo de negocio quieres publicar?
                </DialogTitle>
                <p class="text-brand-azulgris text-sm mt-2">
                  Elige la opción que mejor describa tu negocio.
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  v-for="quick in QUICK_CATEGORIES"
                  :key="quick.id"
                  type="button"
                  @click="pickQuickCategory(quick)"
                  class="group flex md:flex-col items-center md:text-center gap-4 md:gap-3 p-5 md:p-6 rounded-2xl border-2 border-gray-100 hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left md:text-center"
                >
                  <div :class="['w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105', quick.iconBg]">
                    <component :is="quick.icon" :class="['w-7 h-7 md:w-8 md:h-8', quick.iconColor]" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-display font-black text-lg text-brand-text mb-1">{{ quick.label }}</p>
                    <p class="text-brand-azulgris text-xs leading-relaxed">{{ quick.description }}</p>
                  </div>
                </button>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <CityPickerModal
      v-model:open="showCityModal"
      title="¿En qué municipio se encuentra?"
      subtitle="Elige el municipio al que pertenece el negocio."
      :dismissible="false"
      :update-store-on-select="false"
      @select="pickCity"
    />

  </div>
</template>
