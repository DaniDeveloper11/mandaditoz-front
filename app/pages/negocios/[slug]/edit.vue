<script setup>
import {
  LayoutList, Phone, Clock, Image as ImageIcon,
  Share2, Star, X, Pencil, ChevronDown, MapPin, Info, Plus, PlusCircle, Check,
  FileText, UploadCloud, Menu as MenuIcon,
} from '@lucide/vue'
import {
  Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption,
} from '@headlessui/vue'

definePageMeta({ layout: 'editor' })

const route = useRoute()
const slug = computed(() => route.params.slug)
const { negocio, pending, error, refresh: refreshNegocio } = useNegocio(slug, { includeDrafts: true })
const { categorias } = useCategorias({ limit: 100, allDepths: true })
const { updateBusiness, loading, error: saveError, clearError } = useNegocioEdit()

const editorMeta = useState('editorMeta', () => ({
  name: '',
  slug: '',
  isPublished: false,
  lastUpdated: null,
  saving: false,
  onSave: null,
}))

const activeSection = ref('informacion')

const sections = [
  { id: 'informacion', label: 'Información básica', icon: LayoutList },
  { id: 'contacto',    label: 'Contacto',            icon: Phone },
  { id: 'horario',     label: 'Horario',             icon: Clock },
  { id: 'fotos',       label: 'Fotos',               icon: ImageIcon },
  { id: 'menu',        label: 'Menú',                icon: MenuIcon },
  { id: 'redes',       label: 'Redes sociales',      icon: Share2 },
  { id: 'estado',      label: 'Estado y visibilidad', icon: Star },
]

const currentSection = computed(() => sections.find(s => s.id === activeSection.value))

const DAY_ORDER  = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' }

const ESTADOS_MX = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas',
  'Chihuahua','Ciudad de México','Coahuila','Colima','Durango','Guanajuato',
  'Guerrero','Hidalgo','Jalisco','México','Michoacán','Morelos','Nayarit',
  'Nuevo León','Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí',
  'Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas',
]

function stripCountryCode(num) {
  return (num ?? '').replace(/^\+?52\s*/, '').trim()
}

const form = reactive({
  // Información básica
  name: '',
  categoryId: null,
  description: '',
  shortDescription: '',
  tags: [],
  // Contacto
  phone: '',
  whatsapp: '',
  email: '',
  calle: '',
  numero: '',
  colonia: '',
  municipio: '',
  estado: 'Jalisco',
  website: '',
  // Horario
  hours: DAY_ORDER.map(day => ({
    dayOfWeek: day,
    openTime: '07:00',
    closeTime: '14:00',
    isClosed: false,
    is24Hours: false,
  })),
  // Fotos
  photos: [],
  // Menú
  menu: {
    mode: 'pdf',
    pdf: null,
    pdfFile: null,
    pdfRemoved: false,
    images: [],
  },
  // Redes sociales
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
  },
  // Estado y visibilidad
  visibility: {
    isPublished: true,
    isFeatured: false,
  },
})

const newTag = ref('')
const deletedPhotoIds = ref([])
const photoError = ref('')
const menuError = ref('')

watch(negocio, (val) => {
  if (!val) return

  const primaryPhone = val.phones?.[0]
  const waPhone = val.phones?.find(p => p.hasWhatsapp) ?? primaryPhone

  form.name             = val.name ?? ''
  form.categoryId       = val.category?.documentId ?? null
  form.description      = val.description ?? ''
  form.shortDescription = val.shortDescription ?? ''
  form.tags             = (val.tags ?? []).map(t => ({ documentId: t.documentId, name: t.name, slug: t.slug }))
  form.phone            = stripCountryCode(primaryPhone?.number)
  form.whatsapp         = stripCountryCode(waPhone?.number)
  form.email            = val.email ?? ''
  form.calle            = val.addressRaw?.street ?? ''
  form.numero           = val.addressRaw?.exteriorNumber ?? ''
  form.colonia          = val.neighborhood?.name ?? ''
  form.municipio        = val.city?.name ?? 'Etzatlán'
  form.estado           = 'Jalisco'
  form.website          = val.website ?? ''

  const existingHours = Object.fromEntries((val.hours ?? []).map(h => [h.dayOfWeek, h]))
  form.hours = DAY_ORDER.map(day => ({
    documentId: existingHours[day]?.documentId ?? null,
    dayOfWeek:  day,
    openTime:   existingHours[day]?.openTime  ?? '07:00',
    closeTime:  existingHours[day]?.closeTime ?? '14:00',
    isClosed:   existingHours[day]?.isClosed  ?? false,
    is24Hours:  existingHours[day]?.is24Hours ?? false,
  }))

  const socialMap = Object.fromEntries(
    (val.socialLinks ?? []).map(s => [s.platform?.toLowerCase(), s.url ?? s.handle ?? ''])
  )
  form.social.facebook  = extractSocialHandle(socialMap.facebook,  'facebook.com/')
  form.social.instagram = extractSocialHandle(socialMap.instagram, 'instagram.com/')
  form.social.tiktok    = extractSocialHandle(socialMap.tiktok,    'tiktok.com/@')

  form.visibility.isPublished = val.businessStatus !== 'draft'
  form.visibility.isFeatured  = val.isFeatured ?? false

  form.photos = (val.photos ?? []).map((p, i) => ({
    id: p.id ?? null,
    documentId: p.documentId ?? null,
    url: p.url,
    alternativeText: p.alternativeText ?? '',
    order: i,
    file: null,
    isNew: false,
  }))
  deletedPhotoIds.value = []

  // Menú
  const hasPdf = !!val.menuPdf?.url
  const hasImages = (val.menuImages ?? []).length > 0
  form.menu.mode = hasImages && !hasPdf ? 'images' : 'pdf'
  form.menu.pdf = hasPdf
    ? { url: val.menuPdf.url, name: val.menuPdf.name ?? 'Menú.pdf' }
    : null
  form.menu.pdfFile = null
  form.menu.pdfRemoved = false
  form.menu.images = (val.menuImages ?? []).map((m) => ({
    id: m.id,
    url: m.url,
    name: m.name ?? '',
    file: null,
    isNew: false,
  }))
  menuError.value = ''

  editorMeta.value.name        = val.name ?? ''
  editorMeta.value.slug        = slug.value
  editorMeta.value.isPublished = true
}, { immediate: true })

// ── Información básica helpers ──
const { tags: availableTags } = useTags()

const availableTagOptions = computed(() => {
  const usedIds = new Set(form.tags.map(t => t.documentId))
  const q = newTag.value.trim().toLowerCase()
  return availableTags.value
    .filter(t => !usedIds.has(t.documentId))
    .filter(t => !q || t.name.toLowerCase().includes(q))
})

function addTag(tag) {
  if (!tag) return
  if (!form.tags.some(t => t.documentId === tag.documentId)) {
    form.tags.push({ documentId: tag.documentId, name: tag.name, slug: tag.slug })
  }
  newTag.value = ''
}

function removeTag(tag) {
  form.tags = form.tags.filter(t => t.documentId !== tag.documentId)
}

// ── Contacto helpers ──
const mapAddressLabel = computed(() => {
  const linea = [form.calle, form.numero].filter(Boolean).join(' ')
  return [linea, form.colonia, form.municipio, form.estado].filter(Boolean).join(' — ')
})

// ── Redes sociales helpers ──
function extractSocialHandle(raw, domainPrefix) {
  if (!raw) return ''
  const clean = raw.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
  if (clean.toLowerCase().startsWith(domainPrefix)) {
    return clean.slice(domainPrefix.length).replace(/^@/, '')
  }
  return raw
}

// ── Fotos helpers ──
const MAX_PHOTOS = 10
const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const fileInputRef = ref(null)

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFilesSelected(e) {
  const files = Array.from(e.target.files ?? [])
  const remaining = MAX_PHOTOS - form.photos.length
  photoError.value = ''
  files.slice(0, remaining).forEach((file) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      photoError.value = `Formato no soportado: ${file.name}`
      return
    }
    if (file.size > MAX_PHOTO_SIZE) {
      photoError.value = `${file.name} supera los 5 MB`
      return
    }
    form.photos.push({
      id: null,
      documentId: null,
      url: URL.createObjectURL(file),
      alternativeText: '',
      order: form.photos.length,
      file,
      isNew: true,
    })
  })
  e.target.value = ''
}

function removePhoto(index) {
  const photo = form.photos[index]
  if (photo.isNew && photo.url.startsWith('blob:')) URL.revokeObjectURL(photo.url)
  if (!photo.isNew && photo.documentId) deletedPhotoIds.value.push(photo.documentId)
  form.photos.splice(index, 1)
}

// ── Menú helpers ──
const MAX_MENU_IMAGES = 12
const MAX_MENU_PDF_SIZE  = 15 * 1024 * 1024
const MAX_MENU_IMAGE_SIZE = 5 * 1024 * 1024
const menuPdfInputRef = ref(null)
const menuImagesInputRef = ref(null)

function triggerMenuPdfInput()    { menuPdfInputRef.value?.click() }
function triggerMenuImagesInput() { menuImagesInputRef.value?.click() }

function onMenuPdfSelected(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  menuError.value = ''
  if (!file) return
  if (file.type !== 'application/pdf') {
    menuError.value = 'El archivo debe ser un PDF'
    return
  }
  if (file.size > MAX_MENU_PDF_SIZE) {
    menuError.value = 'El PDF supera los 15 MB'
    return
  }
  if (form.menu.pdf?.url?.startsWith('blob:')) URL.revokeObjectURL(form.menu.pdf.url)
  form.menu.pdf = { url: URL.createObjectURL(file), name: file.name }
  form.menu.pdfFile = file
  form.menu.pdfRemoved = false
}

function removeMenuPdf() {
  if (form.menu.pdf?.url?.startsWith('blob:')) URL.revokeObjectURL(form.menu.pdf.url)
  form.menu.pdf = null
  form.menu.pdfFile = null
  form.menu.pdfRemoved = true
  menuError.value = ''
}

function onMenuImagesSelected(e) {
  const files = Array.from(e.target.files ?? [])
  e.target.value = ''
  menuError.value = ''
  const remaining = MAX_MENU_IMAGES - form.menu.images.length
  files.slice(0, remaining).forEach((file) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      menuError.value = `Formato no soportado: ${file.name}`
      return
    }
    if (file.size > MAX_MENU_IMAGE_SIZE) {
      menuError.value = `${file.name} supera los 5 MB`
      return
    }
    form.menu.images.push({
      id: null,
      url: URL.createObjectURL(file),
      name: file.name,
      file,
      isNew: true,
    })
  })
}

function removeMenuImage(index) {
  const img = form.menu.images[index]
  if (img.isNew && img.url?.startsWith('blob:')) URL.revokeObjectURL(img.url)
  form.menu.images.splice(index, 1)
}

function setMenuMode(mode) {
  form.menu.mode = mode
  menuError.value = ''
}

// ── Guardar ──
watch(loading, (val) => {
  editorMeta.value.saving = val
})

function buildPayload() {
  const socialLinks = [
    form.social.facebook  && { platform: 'facebook',  url: `https://facebook.com/${form.social.facebook}` },
    form.social.instagram && { platform: 'instagram', url: `https://instagram.com/${form.social.instagram}` },
    form.social.tiktok    && { platform: 'tiktok',    url: `https://tiktok.com/@${form.social.tiktok}` },
  ].filter(Boolean)

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

  const address = form.calle
    ? {
        street: form.calle,
        exteriorNumber: form.numero || null,
        rawText,
      }
    : null

  return {
    name: form.name,
    description: form.description,
    shortDescription: form.shortDescription || null,
    email: form.email || null,
    website: form.website || null,
    tags: form.tags.map(t => t.documentId),
    category: form.categoryId ?? null,
    address,
    phones,
    hours: form.hours.map(h => ({
      documentId: h.documentId,
      dayOfWeek:  h.dayOfWeek,
      openTime:   h.openTime,
      closeTime:  h.closeTime,
      isClosed:   h.isClosed,
      is24Hours:  h.is24Hours,
    })),
    socialLinks,
    isFeatured:     form.visibility.isFeatured,
    businessStatus: form.visibility.isPublished ? 'published' : 'draft',
    photos: {
      current: form.photos.map((p, i) => ({
        isNew: p.isNew,
        file: p.file,
        documentId: p.documentId,
        order: i,
        alternativeText: p.alternativeText,
      })),
      toDelete: deletedPhotoIds.value,
    },
    menu: {
      pdf: form.menu.mode === 'pdf'
        ? {
            file: form.menu.pdfFile,
            remove: form.menu.pdfRemoved && !form.menu.pdfFile,
          }
        : { remove: true },
      images: form.menu.mode === 'images'
        ? form.menu.images.map(img => ({
            id: img.id,
            isNew: img.isNew,
            file: img.file,
          }))
        : [],
    },
  }
}

async function handleSave() {
  if (!negocio.value?.documentId) return
  clearError()
  photoError.value = ''
  try {
    await updateBusiness(negocio.value.documentId, buildPayload())
    editorMeta.value.lastUpdated  = new Date().toISOString()
    editorMeta.value.isPublished  = form.visibility.isPublished
    editorMeta.value.name         = form.name
    await refreshNegocio()
  } catch {
    // saveError y editorMeta.saving son gestionados por useNegocioEdit
  }
}

onMounted(() => {
  editorMeta.value.onSave = handleSave
})

const stats = [
  { value: 247, label: 'Vistas al perfil',  color: 'text-brand-text' },
  { value: 38,  label: 'Clics en teléfono', color: 'text-amber-500' },
  { value: 12,  label: 'Clics en WhatsApp', color: 'text-brand-text' },
]
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-8">

    <div v-if="pending" class="flex items-center justify-center min-h-60">
      <div class="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="error || !negocio" class="text-center py-20 text-brand-azulgris">
      Negocio no encontrado.
    </div>

    <template v-else>
    <!-- Banner de error de guardado -->
    <div
      v-if="saveError"
      class="mb-4 flex items-center justify-between gap-4 px-5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
    >
      <span>{{ saveError }}</span>
      <button type="button" @click="clearError" class="shrink-0 hover:text-red-900 transition-colors">
        <X class="w-4 h-4" />
      </button>
    </div>

    <div class="flex gap-8 items-start">

      <!-- ── Sidebar ── -->
      <aside class="w-52 shrink-0 sticky top-20">

        <p class="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3 px-3">Secciones</p>

        <nav class="space-y-0.5">
          <button
            v-for="section in sections"
            :key="section.id"
            @click="activeSection = section.id"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left',
              activeSection === section.id
                ? 'bg-brand-bg-dark text-white'
                : 'text-brand-text hover:bg-gray-200/70',
            ]"
          >
            <component :is="section.icon" class="w-4 h-4 shrink-0" />
            {{ section.label }}
          </button>
        </nav>

        <!-- Stats card -->
        <div class="mt-5 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <p class="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">Este mes</p>
          <div class="divide-y divide-gray-100">
            <div v-for="stat in stats" :key="stat.label" class="py-3 first:pt-0 last:pb-0">
              <p :class="['font-display font-black text-3xl leading-none', stat.color]">{{ stat.value }}</p>
              <p class="text-brand-azulgris text-xs mt-1">{{ stat.label }}</p>
            </div>
          </div>
        </div>

      </aside>

      <!-- ── Contenido de sección ── -->
      <div class="flex-1 min-w-0">
        <div class="bg-white rounded-2xl shadow-sm p-8">

          <!-- Encabezado de sección -->
          <div class="flex items-center gap-3 pb-5 border-b border-gray-100 mb-7">
            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <component :is="currentSection.icon" class="w-4 h-4 text-brand-text" />
            </div>
            <h2 class="font-display font-black text-2xl text-brand-text flex-1">{{ currentSection.label }}</h2>
            <span v-if="activeSection === 'fotos'" class="text-sm text-brand-azulgris">
              {{ form.photos.length }} / {{ MAX_PHOTOS }} fotos
            </span>
          </div>

          <!-- ══ Información básica ══ -->
          <template v-if="activeSection === 'informacion'">

            <!-- Logo + nombre -->
            <div class="flex items-start gap-5 mb-7">
              <div class="relative shrink-0">
                <div class="w-16 h-16 rounded-xl bg-brand-bg-dark flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                  <img v-if="negocio.logo?.url" :src="negocio.logo.url" :alt="negocio.name" class="w-full h-full object-cover" />
                  <span v-else>{{ (form.name || '?').charAt(0).toUpperCase() }}</span>
                </div>
                <button type="button" class="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center shadow transition-colors" title="Cambiar logo">
                  <Pencil class="w-3 h-3 text-white" />
                </button>
              </div>
              <div class="flex-1">
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Nombre del negocio</label>
                <input v-model="form.name" type="text" placeholder="Nombre del negocio" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition" />
              </div>
            </div>

            <!-- Categoría -->
            <div class="mb-7">
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Categoría</label>
              <div class="relative">
                <select v-model="form.categoryId" class="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition pr-10">
                  <option :value="null" disabled>Selecciona una categoría</option>
                  <option v-for="cat in categorias" :key="cat.documentId" :value="cat.documentId">{{ cat.name }}</option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <!-- Descripción corta -->
            <div class="mb-7">
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Descripción corta <span class="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <input v-model="form.shortDescription" type="text" maxlength="140" placeholder="Una frase que describa tu negocio" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition" />
              <p class="text-gray-400 text-xs mt-1.5">Se muestra en los listados y tarjetas. Máx. 140 caracteres.</p>
            </div>

            <!-- Descripción -->
            <div class="mb-7">
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Descripción del negocio</label>
              <textarea v-model="form.description" rows="5" maxlength="400" placeholder="Describe tu negocio para que los clientes te conozcan mejor…" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition resize-none" />
              <p class="text-gray-400 text-xs mt-1.5">Escribe una descripción que ayude a los clientes a conocer tu negocio. Máx. 400 caracteres.</p>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Especialidades o servicios</label>
              <div v-if="form.tags.length" class="flex flex-wrap gap-2 mb-3">
                <span v-for="tag in form.tags" :key="tag.documentId" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-brand-text text-sm font-medium">
                  {{ tag.name }}
                  <button type="button" @click="removeTag(tag)" class="text-gray-400 hover:text-brand-text transition-colors">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>

              <Combobox
                :model-value="null"
                @update:model-value="addTag"
                nullable
                as="div"
                class="relative w-full max-w-md"
              >
                <div class="relative border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-brand-primary/30 focus-within:border-brand-primary transition">
                  <ComboboxInput
                    :display-value="() => newTag"
                    @change="newTag = $event.target.value"
                    placeholder="Selecciona o busca una etiqueta…"
                    class="w-full bg-transparent px-4 py-2.5 pr-10 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none"
                  />
                  <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown class="w-4 h-4 text-gray-400" />
                  </ComboboxButton>
                </div>

                <ComboboxOptions class="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto focus:outline-none">
                  <div v-if="!availableTagOptions.length" class="px-4 py-3 text-sm text-gray-400 text-center">
                    {{ newTag ? 'Sin coincidencias' : 'No hay más etiquetas disponibles' }}
                  </div>
                  <ComboboxOption
                    v-for="tag in availableTagOptions"
                    :key="tag.documentId"
                    :value="tag"
                    v-slot="{ active }"
                    as="template"
                  >
                    <li
                      :class="[
                        'cursor-pointer px-4 py-2 text-sm flex items-center justify-between gap-3',
                        active ? 'bg-gray-50 text-brand-text' : 'text-brand-text',
                      ]"
                    >
                      <span class="flex items-center gap-2 min-w-0">
                        <Check :class="['w-3.5 h-3.5 shrink-0', active ? 'text-brand-primary' : 'text-transparent']" />
                        <span class="truncate">{{ tag.name }}</span>
                      </span>
                      <span class="text-xs text-gray-400 shrink-0">{{ tag.businessCount }}</span>
                    </li>
                  </ComboboxOption>
                </ComboboxOptions>
              </Combobox>

              <p class="text-gray-400 text-xs mt-2">Haz clic para desplegar todas las etiquetas disponibles o escribe para filtrar.</p>
            </div>

          </template>

          <!-- ══ Contacto ══ -->
          <template v-else-if="activeSection === 'contacto'">

            <!-- Teléfono + WhatsApp -->
            <div class="grid grid-cols-2 gap-5 mb-7">
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Teléfono</label>
                <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/30 focus-within:border-brand-primary transition">
                  <span class="px-3 py-2.5 text-sm font-semibold text-brand-primary bg-gray-50 border-r border-gray-200 shrink-0">+52</span>
                  <input v-model="form.phone" type="tel" placeholder="374 742 1234" class="flex-1 px-3 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none bg-transparent" />
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">WhatsApp</label>
                <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/30 focus-within:border-brand-primary transition">
                  <span class="px-3 py-2.5 text-sm font-semibold text-brand-primary bg-gray-50 border-r border-gray-200 shrink-0">+52</span>
                  <input v-model="form.whatsapp" type="tel" placeholder="374 742 1234" class="flex-1 px-3 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none bg-transparent" />
                </div>
                <p class="text-brand-azulgris text-xs mt-1.5">Puedes usar un número diferente al teléfono</p>
              </div>
            </div>

            <!-- Email -->
            <div class="mb-7">
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Email <span class="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <input v-model="form.email" type="email" placeholder="contacto@minegocio.com" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition" />
            </div>

            <!-- Calle + Número -->
            <div class="grid grid-cols-[1fr_140px] gap-5 mb-7">
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Calle</label>
                <input v-model="form.calle" type="text" placeholder="Av. Independencia" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition" />
              </div>
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Número</label>
                <input v-model="form.numero" type="text" placeholder="42" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition" />
              </div>
            </div>

            <!-- Colonia -->
            <div class="mb-7">
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Colonia <span class="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <input v-model="form.colonia" type="text" placeholder="Centro" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition" />
            </div>

            <!-- Municipio + Estado -->
            <div class="grid grid-cols-2 gap-5 mb-7">
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

            <!-- Sitio web -->
            <div class="mb-7">
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                Sitio web <span class="font-normal normal-case text-gray-400">(opcional)</span>
              </label>
              <input v-model="form.website" type="url" placeholder="https://mipagina.com" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition" />
            </div>

            <!-- Mapa placeholder -->
            <div>
              <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Ubicación en el mapa</label>
              <div class="rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center py-10 gap-2">
                <MapPin class="w-7 h-7 text-slate-400" />
                <p class="font-semibold text-brand-text text-sm">{{ mapAddressLabel || 'Sin dirección' }}</p>
                <button type="button" class="text-brand-primary text-sm font-semibold hover:underline mt-1">
                  Mover marcador en el mapa →
                </button>
              </div>
            </div>

          </template>

          <!-- ══ Horario ══ -->
          <template v-else-if="activeSection === 'horario'">

            <!-- Cabecera de columnas -->
            <div class="grid grid-cols-[120px_1fr_24px_1fr_64px] gap-4 items-center pb-3 mb-1 border-b border-gray-100">
              <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Día</span>
              <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Apertura</span>
              <span />
              <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400">Cierre</span>
              <span class="text-[10px] font-bold tracking-widest uppercase text-gray-400 text-right">Abierto</span>
            </div>

            <!-- Filas por día -->
            <div
              v-for="row in form.hours"
              :key="row.dayOfWeek"
              class="grid grid-cols-[120px_1fr_24px_1fr_64px] gap-4 items-center py-3.5 border-b border-gray-50 last:border-0"
            >
              <span class="font-semibold text-sm text-brand-text">{{ DAY_LABELS[row.dayOfWeek] }}</span>

              <!-- Apertura -->
              <input
                v-model="row.openTime"
                type="time"
                :disabled="row.isClosed"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <span class="text-gray-400 text-center text-sm select-none">–</span>

              <!-- Cierre -->
              <input
                v-model="row.closeTime"
                type="time"
                :disabled="row.isClosed"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <!-- Toggle abierto/cerrado -->
              <div class="flex justify-end">
                <button
                  type="button"
                  @click="row.isClosed = !row.isClosed"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none',
                    !row.isClosed ? 'bg-brand-bg-dark' : 'bg-gray-200',
                  ]"
                  :aria-label="DAY_LABELS[row.dayOfWeek]"
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

            <!-- Nota informativa -->
            <div class="mt-6 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
              <Info class="w-4 h-4 text-brand-azulgris shrink-0 mt-0.5" />
              <p class="text-brand-azulgris text-xs leading-relaxed">
                El horario se muestra a los clientes en tiempo real. "Abierto ahora" aparece automáticamente.
              </p>
            </div>

          </template>

          <!-- ══ Fotos ══ -->
          <template v-else-if="activeSection === 'fotos'">

            <!-- Grid de fotos -->
            <div class="grid gap-3" style="grid-template-columns: 2fr 1fr 1fr 1fr; grid-auto-rows: 200px;">

              <!-- Foto principal (row-span-2) -->
              <div class="row-span-2 relative rounded-2xl overflow-hidden bg-brand-bg-dark group">
                <img
                  v-if="form.photos[0]?.url"
                  :src="form.photos[0].url"
                  class="w-full h-full object-cover"
                  alt="Foto principal"
                />
                <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2">
                  <ImageIcon class="w-8 h-8 text-white/30" />
                  <span class="text-white/40 text-sm">Foto principal</span>
                </div>

                <!-- Controles -->
                <div class="absolute top-3 right-3 flex gap-1.5">
                  <button
                    type="button"
                    @click="triggerFileInput"
                    class="w-8 h-8 rounded-lg bg-brand-bg-dark/90 hover:bg-brand-bg-dark flex items-center justify-center text-white shadow transition-colors"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button
                    v-if="form.photos[0]"
                    type="button"
                    @click="removePhoto(0)"
                    class="w-8 h-8 rounded-lg bg-amber-600/90 hover:bg-amber-600 flex items-center justify-center text-white shadow transition-colors"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Badge principal -->
                <div class="absolute bottom-3 left-3">
                  <span class="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold">Principal</span>
                </div>
              </div>

              <!-- Fotos secundarias (índices 1..N) -->
              <template v-for="(photo, idx) in form.photos.slice(1, MAX_PHOTOS)" :key="photo.url">
                <div class="relative rounded-2xl overflow-hidden bg-brand-bg-dark group">
                  <img
                    v-if="photo.url"
                    :src="photo.url"
                    class="w-full h-full object-cover"
                    :alt="`Foto ${idx + 2}`"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <ImageIcon class="w-6 h-6 text-white/30" />
                  </div>
                  <button
                    type="button"
                    @click="removePhoto(idx + 1)"
                    class="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-brand-bg-dark/90 hover:bg-brand-bg-dark flex items-center justify-center text-white shadow transition-colors"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
              </template>

              <!-- Tile Agregar -->
              <button
                v-if="form.photos.length < MAX_PHOTOS"
                type="button"
                @click="triggerFileInput"
                class="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-500 transition-colors"
              >
                <Plus class="w-6 h-6" />
                <span class="text-sm">Agregar</span>
              </button>

            </div>

            <!-- Input file oculto -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              class="hidden"
              @change="onFilesSelected"
            />

            <!-- Botón subir + nota -->
            <div class="mt-6 space-y-3">
              <button
                type="button"
                @click="triggerFileInput"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-brand-text hover:bg-gray-50 transition-colors"
              >
                <PlusCircle class="w-4 h-4" />
                Subir fotos nuevas
              </button>
              <p v-if="photoError" class="text-red-600 text-xs">{{ photoError }}</p>
              <p class="text-gray-400 text-xs">
                Sube hasta {{ MAX_PHOTOS }} fotos. Formatos: JPG, PNG, WebP. Máximo 5 MB por foto.
              </p>
            </div>

          </template>

          <!-- ══ Menú ══ -->
          <template v-else-if="activeSection === 'menu'">

            <!-- Selector de formato -->
            <div class="mb-6">
              <p class="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Formato del menú</p>
              <div class="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50">
                <button
                  type="button"
                  @click="setMenuMode('pdf')"
                  :class="[
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                    form.menu.mode === 'pdf' ? 'bg-white text-brand-text shadow-sm' : 'text-gray-500 hover:text-brand-text',
                  ]"
                >
                  <FileText class="w-4 h-4" />
                  PDF
                </button>
                <button
                  type="button"
                  @click="setMenuMode('images')"
                  :class="[
                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                    form.menu.mode === 'images' ? 'bg-white text-brand-text shadow-sm' : 'text-gray-500 hover:text-brand-text',
                  ]"
                >
                  <ImageIcon class="w-4 h-4" />
                  Imágenes
                </button>
              </div>
              <p class="text-gray-400 text-xs mt-2">Elige uno de los dos formatos. Al guardar, solo se conservará el formato seleccionado.</p>
            </div>

            <!-- Modo PDF -->
            <template v-if="form.menu.mode === 'pdf'">
              <div v-if="form.menu.pdf" class="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-white">
                <div class="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FileText class="w-6 h-6 text-red-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-brand-text text-sm truncate">{{ form.menu.pdf.name || 'Menú.pdf' }}</p>
                  <a
                    v-if="!form.menu.pdf.url?.startsWith('blob:')"
                    :href="form.menu.pdf.url"
                    target="_blank"
                    rel="noopener"
                    class="text-brand-primary text-xs font-semibold hover:underline"
                  >Ver PDF actual →</a>
                  <p v-else class="text-gray-400 text-xs">Se subirá al guardar</p>
                </div>
                <button
                  type="button"
                  @click="triggerMenuPdfInput"
                  class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-brand-text hover:bg-gray-50 transition-colors"
                >
                  <Pencil class="w-3.5 h-3.5" />
                  Reemplazar
                </button>
                <button
                  type="button"
                  @click="removeMenuPdf"
                  class="w-9 h-9 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                  title="Quitar PDF"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <button
                v-else
                type="button"
                @click="triggerMenuPdfInput"
                class="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-500 transition-colors py-14"
              >
                <UploadCloud class="w-7 h-7" />
                <span class="text-sm font-semibold">Subir menú en PDF</span>
                <span class="text-xs">Máx. 15 MB</span>
              </button>

              <input
                ref="menuPdfInputRef"
                type="file"
                accept="application/pdf"
                class="hidden"
                @change="onMenuPdfSelected"
              />
            </template>

            <!-- Modo Imágenes -->
            <template v-else>
              <div v-if="form.menu.images.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <div
                  v-for="(img, idx) in form.menu.images"
                  :key="img.url"
                  class="relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-bg-dark group"
                >
                  <img :src="img.url" class="w-full h-full object-cover" :alt="`Menú ${idx + 1}`" />
                  <button
                    type="button"
                    @click="removeMenuImage(idx)"
                    class="absolute top-2 right-2 w-7 h-7 rounded-lg bg-brand-bg-dark/90 hover:bg-brand-bg-dark flex items-center justify-center text-white shadow transition-colors"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                  <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-semibold">
                    {{ idx + 1 }} / {{ form.menu.images.length }}
                  </span>
                </div>

                <button
                  v-if="form.menu.images.length < MAX_MENU_IMAGES"
                  type="button"
                  @click="triggerMenuImagesInput"
                  class="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <Plus class="w-6 h-6" />
                  <span class="text-sm">Agregar</span>
                </button>
              </div>

              <button
                v-else
                type="button"
                @click="triggerMenuImagesInput"
                class="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-500 transition-colors py-14"
              >
                <UploadCloud class="w-7 h-7" />
                <span class="text-sm font-semibold">Subir imágenes del menú</span>
                <span class="text-xs">JPG, PNG o WebP · Máx. 5 MB por imagen</span>
              </button>

              <input
                ref="menuImagesInputRef"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                class="hidden"
                @change="onMenuImagesSelected"
              />

              <p class="text-gray-400 text-xs mt-3">
                {{ form.menu.images.length }} / {{ MAX_MENU_IMAGES }} imágenes
              </p>
            </template>

            <p v-if="menuError" class="text-red-600 text-xs mt-3">{{ menuError }}</p>

          </template>

          <!-- ══ Redes sociales ══ -->
          <template v-else-if="activeSection === 'redes'">

            <div class="space-y-7">

              <!-- Facebook -->
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Facebook</label>
                <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/30 focus-within:border-brand-primary transition">
                  <span class="px-4 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 shrink-0 select-none">facebook.com/</span>
                  <input
                    v-model="form.social.facebook"
                    type="text"
                    placeholder="TuPagina"
                    class="flex-1 px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-300 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <!-- Instagram -->
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Instagram</label>
                <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/30 focus-within:border-brand-primary transition">
                  <span class="px-4 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 shrink-0 select-none">instagram.com/</span>
                  <input
                    v-model="form.social.instagram"
                    type="text"
                    placeholder="mi_negocio"
                    class="flex-1 px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-300 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <!-- TikTok -->
              <div>
                <label class="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">TikTok</label>
                <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/30 focus-within:border-brand-primary transition">
                  <span class="px-4 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 shrink-0 select-none">tiktok.com/@</span>
                  <input
                    v-model="form.social.tiktok"
                    type="text"
                    placeholder="minegocio"
                    class="flex-1 px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-300 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

            </div>

          </template>

          <!-- ══ Estado y visibilidad ══ -->
          <template v-else-if="activeSection === 'estado'">
            <div class="space-y-4">

              <!-- Publicación -->
              <div class="flex items-start justify-between gap-6 p-5 rounded-2xl border border-gray-200">
                <div class="min-w-0">
                  <p class="font-semibold text-brand-text text-sm mb-1">Estado de publicación</p>
                  <p class="text-brand-azulgris text-xs leading-relaxed">
                    Controla si tu negocio aparece en el directorio público. Ponlo en borrador si necesitas hacer cambios antes de publicar.
                  </p>
                  <div class="mt-3 flex items-center gap-2">
                    <span
                      :class="[
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                        form.visibility.isPublished
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500',
                      ]"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        :class="form.visibility.isPublished ? 'bg-emerald-500' : 'bg-gray-400'"
                      />
                      {{ form.visibility.isPublished ? 'Publicado' : 'Borrador' }}
                    </span>
                    <span class="text-gray-400 text-xs">
                      {{ form.visibility.isPublished ? 'Visible en el directorio' : 'Solo tú puedes verlo' }}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  @click="form.visibility.isPublished = !form.visibility.isPublished"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none mt-0.5',
                    form.visibility.isPublished ? 'bg-brand-bg-dark' : 'bg-gray-200',
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      form.visibility.isPublished ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
              </div>

              <!-- Destacado -->
              <div class="flex items-start justify-between gap-6 p-5 rounded-2xl border border-gray-200">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <Star class="w-4 h-4 text-amber-500 fill-amber-500" />
                    <p class="font-semibold text-brand-text text-sm">Negocio destacado</p>
                  </div>
                  <p class="text-brand-azulgris text-xs leading-relaxed">
                    Los negocios destacados aparecen en la portada del directorio y en los primeros resultados de búsqueda.
                  </p>
                </div>
                <button
                  type="button"
                  @click="form.visibility.isFeatured = !form.visibility.isFeatured"
                  :class="[
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none mt-0.5',
                    form.visibility.isFeatured ? 'bg-brand-bg-dark' : 'bg-gray-200',
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                      form.visibility.isFeatured ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
              </div>

              <!-- Nota informativa -->
              <div class="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                <Info class="w-4 h-4 text-brand-azulgris shrink-0 mt-0.5" />
                <p class="text-brand-azulgris text-xs leading-relaxed">
                  Los cambios de visibilidad se aplican de inmediato al guardar. El estado "Destacado" puede requerir aprobación del administrador.
                </p>
              </div>

            </div>
          </template>

        </div>
      </div>

    </div>
    </template>
  </div>
</template>
