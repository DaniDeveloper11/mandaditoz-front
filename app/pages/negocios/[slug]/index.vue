<script setup>
import {
  ChevronLeft, Star, MapPin, Share2, Phone, Check, Clock, Image as ImageIcon, Map, X, FileText, Download,
  Mail, Globe, CreditCard, Banknote, ArrowLeftRight,
  Link as LinkIcon, MoreHorizontal,
} from '@lucide/vue'
import {
  Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild,
  Popover, PopoverButton, PopoverPanel,
} from '@headlessui/vue'

definePageMeta({ layout: 'landing' })

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug)
const { negocio, pending, error } = useNegocio(slug)

const activeTab = ref('informacion')

const hasMenu = computed(() => !!negocio.value?.menuPdf?.url || (negocio.value?.menuImages ?? []).length > 0)

const tabs = computed(() => {
  const base = [
    { id: 'informacion', label: 'Información' },
   // { id: 'resenas',     label: 'Reseñas' },
    { id: 'fotos',       label: 'Fotos' },
  ]
  if (hasMenu.value) base.splice(1, 0, { id: 'menu', label: 'Menú' })
  return base
})

const menuLightbox = ref({ open: false, index: 0 })
function openMenuLightbox(i) { menuLightbox.value = { open: true, index: i } }
function closeMenuLightbox()  { menuLightbox.value.open = false }
function menuPrev() {
  const total = negocio.value?.menuImages?.length ?? 0
  if (!total) return
  menuLightbox.value.index = (menuLightbox.value.index - 1 + total) % total
}
function menuNext() {
  const total = negocio.value?.menuImages?.length ?? 0
  if (!total) return
  menuLightbox.value.index = (menuLightbox.value.index + 1) % total
}

const DAY_LABELS = { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo' }
const DAY_ORDER  = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_KEYS   = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const todayKey   = DAY_KEYS[new Date().getDay()]

const sortedHours = computed(() =>
  [...(negocio.value?.hours ?? [])].sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
    if (dayDiff !== 0) return dayDiff
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  })
)

/**
 * Agrupa horarios por día para renderizar shifts partidos como una sola fila con múltiples franjas.
 */
const hoursByDay = computed(() => {
  const grouped = DAY_ORDER.map(day => ({
    dayOfWeek: day,
    label: DAY_LABELS[day],
    shifts: [],
    isClosed: false,
  }))
  const map = Object.fromEntries(grouped.map(g => [g.dayOfWeek, g]))
  for (const row of sortedHours.value) {
    const g = map[row.dayOfWeek]
    if (!g) continue
    if (row.isClosed) g.isClosed = true
    else g.shifts.push(row)
  }
  return grouped
})

function formatShift(row) {
  if (row.is24Hours) return '24 horas'
  const start = formatTime(row.openTime)
  const end = formatTime(row.closeTime)
  return row.crossesMidnight ? `${start} – ${end} (día sig.)` : `${start} – ${end}`
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'pm' : 'am'}`
}

const PAYMENT_METHOD_META = {
  cash:     { label: 'Efectivo',      icon: Banknote,       color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  transfer: { label: 'Transferencia', icon: ArrowLeftRight, color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100' },
  card:     { label: 'Tarjeta',       icon: CreditCard,     color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-100' },
}

const PRICE_LEVEL_MAP = { budget: 1, moderate: 2, expensive: 3, luxury: 4 }

const priceLabel = computed(() => {
  const p = negocio.value?.priceLevel
  if (p == null || p === '') return ''
  const n = typeof p === 'number' ? p : PRICE_LEVEL_MAP[String(p).toLowerCase()]
  if (!n || n < 1) return ''
  return '$'.repeat(Math.min(4, n))
})

const showMapModal = ref(false)
const shareCopied = ref(false)
const canNativeShare = ref(false)
const shareBtnEl = ref(null)
const sharePanelStyle = ref({ top: '0px', left: '0px' })

onMounted(() => { canNativeShare.value = typeof navigator !== 'undefined' && !!navigator.share })

function positionSharePanel() {
  const el = shareBtnEl.value?.$el ?? shareBtnEl.value
  const rect = el?.getBoundingClientRect?.()
  if (!rect) return
  const PANEL_W = 256
  const gap = 8
  let left = rect.right - PANEL_W
  if (left < 8) left = 8
  const maxLeft = window.innerWidth - PANEL_W - 8
  if (left > maxLeft) left = maxLeft
  sharePanelStyle.value = {
    top: `${rect.bottom + gap}px`,
    left: `${left}px`,
  }
}

const shareUrl = computed(() => (import.meta.client ? window.location.href : ''))

const shareOptions = computed(() => {
  const url = shareUrl.value
  const title = negocio.value?.name ?? ''
  const text = negocio.value?.shortDescription ?? negocio.value?.description ?? ''
  const encUrl = encodeURIComponent(url)
  const encText = encodeURIComponent(text)
  const encTitleUrl = encodeURIComponent(`${title} ${url}`.trim())
  return [
    { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encTitleUrl}`, iconColor: 'text-[#25D366]', bg: 'bg-[#25D366]/10' },
    { key: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`, iconColor: 'text-[#1877F2]', bg: 'bg-[#1877F2]/10' },
    { key: 'x',        label: 'X',        href: `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`, iconColor: 'text-black', bg: 'bg-black/5' },
    { key: 'telegram', label: 'Telegram', href: `https://t.me/share/url?url=${encUrl}&text=${encText}`, iconColor: 'text-[#0088cc]', bg: 'bg-[#0088cc]/10' },
    { key: 'email',    label: 'Email',    href: `mailto:?subject=${encodeURIComponent(title)}&body=${encTitleUrl}`, iconColor: 'text-brand-azulgris', bg: 'bg-slate-100' },
  ]
})

async function copyShareLink(closeFn) {
  if (!import.meta.client || !navigator.clipboard) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    shareCopied.value = true
    setTimeout(() => { shareCopied.value = false }, 2000)
  } catch {
    /* ignore */
  } finally {
    closeFn?.()
  }
}

async function nativeShare(closeFn) {
  if (!import.meta.client || !navigator.share || !negocio.value) return
  try {
    await navigator.share({
      title: negocio.value.name,
      text: negocio.value.shortDescription ?? negocio.value.description ?? '',
      url: shareUrl.value,
    })
  } catch (err) {
    if (err?.name !== 'AbortError') console.warn('Share failed', err)
  } finally {
    closeFn?.()
  }
}

const mapDirectionsUrl = computed(() => {
  if (!negocio.value) return ''
  const g = negocio.value.geo
  if (g?.lat != null && g?.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${g.lat},${g.lng}`
  }
  const q = encodeURIComponent(fullAddress.value || negocio.value.name || '')
  return `https://www.google.com/maps/search/?api=1&query=${q}`
})

const hasLocation = computed(() =>
  !!(negocio.value?.mapEmbedUrl || negocio.value?.geo || fullAddress.value)
)

function openMap() {
  if (negocio.value?.mapEmbedUrl) {
    showMapModal.value = true
  } else if (import.meta.client) {
    window.open(mapDirectionsUrl.value, '_blank', 'noopener')
  }
}

const fullAddress = computed(() => {
  if (!negocio.value) return ''
  const addrLower = (negocio.value.address ?? '').toLowerCase()
  const parts = [negocio.value.address]
  const nb = negocio.value.neighborhood?.name
  if (nb && !addrLower.includes(nb.toLowerCase())) parts.push(nb)
  const c = negocio.value.city?.name
  if (c && !addrLower.includes(c.toLowerCase())) parts.push(c)
  return parts.filter(Boolean).join(', ')
})

const cityStore = useCityStore()

useSeoMeta({
  title: () => {
    if (!negocio.value) return 'Cargando...'
    const cityLabel = negocio.value.city?.name
      ? `${negocio.value.city.name}, Jalisco`
      : cityStore.activeCityLabel
    return `${negocio.value.name} — ${cityLabel} | Mandaditoz`
  },
  description: () => negocio.value?.shortDescription ?? negocio.value?.description,
})

const { isLoggedIn, user } = useAuthStore()
const { submitClaim} = useClaim()

// Reclamar negocio
const showClaimModal = ref(false)
const claimForm = ref({ nombre: '', rol: 'owner', telefono: '', mensaje: '' })
const claimSending = ref(false)
const claimSent = ref(false)
const claimError = ref(null)

const ROLES = [
  { value: 'owner',    label: 'Dueño' },
  { value: 'manager',  label: 'Gerente' },
  { value: 'employee', label: 'Empleado' },
  { value: 'other',    label: 'Otro' },
]

function handleClaim() {
  if (!isLoggedIn) {
    router.push(`/login?redirect=${route.fullPath}`)
    return
  }
  claimForm.value = { nombre: user.value?.username ?? '', rol: 'owner', telefono: '', mensaje: '' }
  claimSent.value = false
  claimError.value = null
  showClaimModal.value = true
}

async function submitClaimForm() {
  claimSending.value = true
  claimError.value = null
  try {
    await submitClaim({
      businessDocumentId: negocio.value.documentId,
      claimantName: claimForm.value.nombre,
      claimantRole: claimForm.value.rol,
      claimantPhone: claimForm.value.telefono,
      notes: claimForm.value.mensaje,
    })
    claimSent.value = true
  } catch {
    claimError.value = 'Ocurrió un error al enviar la solicitud. Intenta de nuevo.'
  } finally {
    claimSending.value = false
  }
}

</script>

<template>
  <div>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center min-h-96">
      <div class="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Error -->
    <div v-else-if="error || !negocio" class="flex flex-col items-center justify-center min-h-96 gap-4 text-center px-6">
      <p class="font-display font-black text-2xl text-brand-text">Negocio no encontrado</p>
      <p class="text-brand-azulgris text-sm">No pudimos encontrar el negocio que buscas.</p>
      <a href="/list" class="btn-primary">Ver directorio</a>
    </div>

    <!-- Content -->
    <template v-else>

      <!-- Breadcrumb -->
      <div class="bg-white border-b border-gray-100 px-6 md:px-12 py-3">
        <div class="max-w-6xl mx-auto">
          <nav class="flex items-center gap-2 text-sm">
            <a href="/" class="text-brand-primary hover:underline">Inicio</a>
            <span class="text-gray-400">›</span>
            <a href="/list" class="text-brand-primary hover:underline">{{ negocio.category?.name ?? 'Directorio' }}</a>
            <span class="text-gray-400">›</span>
            <span class="text-brand-text font-medium">{{ negocio.name }}</span>
          </nav>
        </div>
      </div>

      <!-- Hero -->
      <div class="relative overflow-hidden bg-brand-bg-dark px-6 md:px-12 py-8">

        <!-- Cover photo background -->
        <img
          v-if="negocio.coverPhoto?.url"
          :src="negocio.coverPhoto.url"
          :alt="negocio.coverPhoto.alternativeText ?? negocio.name"
          class="absolute inset-0 w-full h-full object-cover opacity-20"
        />

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

        <div class="relative z-10 max-w-6xl mx-auto">

          <a href="/list" class="inline-flex items-center gap-1 text-white/60 text-sm hover:text-white transition-colors mb-6">
            <ChevronLeft class="w-4 h-4" />
            Volver a resultados
          </a>

          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

            <div class="flex items-start gap-5">
              <div class="w-20 h-20 rounded-2xl bg-slate-700 overflow-hidden flex items-center justify-center text-white font-bold text-3xl shrink-0">
                <img
                  v-if="negocio.logo?.url"
                  :src="negocio.logo.url"
                  :alt="negocio.logo.alternativeText ?? negocio.name"
                  class="w-full h-full object-cover"
                />
                <span v-else>{{ (negocio.name ?? '?').charAt(0) }}</span>
              </div>
              <div>
                <div class="flex items-center gap-3 flex-wrap">
                  <h1 class="font-display font-black text-3xl md:text-4xl text-white leading-tight">{{ negocio.name ?? 'Sin nombre' }}</h1>
                  <span v-if="negocio.isVerified" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white text-xs font-medium">
                    <Check class="w-3 h-3" />
                    Verificado
                  </span>
                </div>

                <p v-if="negocio.shortDescription" class="text-white/80 text-sm mt-2 leading-snug max-w-xl">
                  {{ negocio.shortDescription }}
                </p>

                <div class="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span
                    v-if="negocio.category"
                    class="text-xs font-medium px-2.5 py-0.5 rounded-full"
                    :class="negocio.category.color ? '' : 'bg-blue-900/70 text-blue-300'"
                    :style="negocio.category.color ? { backgroundColor: negocio.category.color + '40', color: negocio.category.color } : {}"
                  >
                    {{ negocio.category.name }}
                  </span>
                  <span
                    v-for="cat in negocio.secondaryCategories"
                    :key="cat.id ?? cat.slug"
                    class="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10"
                  >
                    {{ cat.name }}
                  </span>
                  <span
                    v-if="priceLabel"
                    class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300"
                    :title="`Nivel de precio: ${priceLabel}`"
                  >
                    {{ priceLabel }}
                  </span>
                  <span
                    v-if="negocio.isOpen !== null && negocio.isOpen !== undefined"
                    :class="[
                      'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full',
                      negocio.isOpen ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400',
                    ]"
                  >
                    <span :class="['w-1.5 h-1.5 rounded-full', negocio.isOpen ? 'bg-emerald-400' : 'bg-red-400']" />
                    {{ negocio.isOpen ? 'Abierto ahora' : 'Cerrado' }}
                  </span>
                </div>

                <div class="flex items-center gap-3 mt-3 flex-wrap">
                  <!-- <div class="flex items-center gap-1.5">
                    <div class="flex gap-0.5">
                      <Star
                        v-for="i in 5"
                        :key="i"
                        :class="['w-4 h-4', i <= Math.round(negocio.ratingAverage ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-600 fill-gray-600']"
                      />
                    </div>
                    <span class="text-amber-400 font-black text-2xl leading-none ml-1">{{ (negocio.ratingAverage ?? 0).toFixed(1) }}</span>

                    <span class="text-white/50 text-sm">{{ negocio.ratingCount ?? 0 }} reseñas</span>
                  </div> -->
                  <span class="text-white/20 select-none">|</span>
                  <div class="flex items-center gap-1.5 text-white/60 text-sm">
                    <MapPin class="w-4 h-4 shrink-0" />
                    <span>{{ fullAddress || 'Dirección no disponible' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <Popover class="relative">
                <PopoverButton
                  ref="shareBtnEl"
                  @click="positionSharePanel"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors focus:outline-none"
                >
                  <Check v-if="shareCopied" class="w-4 h-4" />
                  <Share2 v-else class="w-4 h-4" />
                  {{ shareCopied ? 'Copiado' : 'Compartir' }}
                </PopoverButton>
                <Teleport to="body">
                  <transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0"
                  >
                    <PopoverPanel
                      v-slot="{ close }"
                      :style="sharePanelStyle"
                      class="fixed w-64 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-[100] overflow-hidden"
                    >
                    <div class="p-2">
                      <a
                        v-for="opt in shareOptions"
                        :key="opt.key"
                        :href="opt.href"
                        target="_blank"
                        rel="noopener"
                        @click="close"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-brand-text text-sm font-medium"
                      >
                        <span :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', opt.bg]">
                          <svg v-if="opt.key === 'whatsapp'" class="w-4 h-4" :class="opt.iconColor" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <svg v-else-if="opt.key === 'facebook'" class="w-4 h-4" :class="opt.iconColor" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.02 4.388 11.01 10.125 11.927v-8.437H7.078v-3.49h3.047V9.412c0-3.017 1.792-4.687 4.533-4.687 1.313 0 2.686.235 2.686.235v2.97h-1.514c-1.49 0-1.955.93-1.955 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.083 24 18.092 24 12.073z"/>
                          </svg>
                          <svg v-else-if="opt.key === 'x'" class="w-4 h-4" :class="opt.iconColor" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          <svg v-else-if="opt.key === 'telegram'" class="w-4 h-4" :class="opt.iconColor" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                          <Mail v-else-if="opt.key === 'email'" class="w-4 h-4" :class="opt.iconColor" />
                        </span>
                        <span>Compartir en {{ opt.label }}</span>
                      </a>

                      <div class="my-1 border-t border-gray-100" />

                      <button
                        type="button"
                        @click="copyShareLink(close)"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-brand-text text-sm font-medium text-left"
                      >
                        <span class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <LinkIcon class="w-4 h-4 text-brand-azulgris" />
                        </span>
                        <span>Copiar link</span>
                      </button>

                      <button
                        v-if="canNativeShare"
                        type="button"
                        @click="nativeShare(close)"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-brand-text text-sm font-medium text-left"
                      >
                        <span class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <MoreHorizontal class="w-4 h-4 text-brand-azulgris" />
                        </span>
                        <span>Más opciones…</span>
                      </button>
                    </div>
                    </PopoverPanel>
                  </transition>
                </Teleport>
              </Popover>
              <a
                v-if="negocio.phones.length"
                :href="`tel:${negocio.phones[0].number}`"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
              >
                <Phone class="w-4 h-4" />
                Llamar
              </a>
            </div>

          </div>
        </div>
      </div>

      <!-- Tab bar -->
      <div class="bg-white border-b border-gray-200 px-6 md:px-12">
        <div class="max-w-6xl mx-auto flex gap-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 text-sm font-semibold border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-azulgris hover:text-brand-text',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab content -->
      <div class="bg-slate-100 px-6 md:px-12 py-8">
        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">

          <!-- Main column -->
          <div class="flex-1 min-w-0 space-y-5 w-full">

            <template v-if="activeTab === 'informacion'">

              <!-- Sobre el negocio -->
              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <h2 class="font-display font-black text-xl text-brand-text mb-3">Sobre el negocio</h2>
                <p class="text-brand-text text-sm leading-relaxed">{{ negocio.description ?? 'Sin descripción disponible.' }}</p>
                <div v-if="negocio.tags.length" class="flex flex-wrap gap-2 mt-4">
                  <span
                    v-for="tag in negocio.tags"
                    :key="tag.id ?? tag.slug"
                    class="text-xs font-medium px-3 py-1 rounded-full border border-gray-200 text-brand-text bg-gray-50"
                  >
                    {{ tag.name }}
                  </span>
                </div>

                <div v-if="negocio.amenities.length" class="mt-5">
                  <p class="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Servicios</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="a in negocio.amenities"
                      :key="a"
                      class="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      <Check class="w-3 h-3" />
                      {{ a }}
                    </span>
                  </div>
                </div>

                <div v-if="negocio.paymentMethods.length" class="mt-5">
                  <p class="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">Métodos de pago</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="pm in negocio.paymentMethods"
                      :key="pm"
                      :class="[
                        'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border',
                        PAYMENT_METHOD_META[pm]?.bg ?? 'bg-gray-50',
                        PAYMENT_METHOD_META[pm]?.color ?? 'text-brand-text',
                        PAYMENT_METHOD_META[pm]?.border ?? 'border-gray-200',
                      ]"
                    >
                      <component :is="PAYMENT_METHOD_META[pm]?.icon" v-if="PAYMENT_METHOD_META[pm]?.icon" class="w-3.5 h-3.5" />
                      {{ PAYMENT_METHOD_META[pm]?.label ?? pm }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Menú (preview) -->
              <div v-if="hasMenu" class="bg-white rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-4 gap-4">
                  <h2 class="font-display font-black text-xl text-brand-text">Menú</h2>
                  <button @click="activeTab = 'menu'" class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors">Ver menú →</button>
                </div>
                <div v-if="negocio.menuPdf?.url" class="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <div class="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <FileText class="w-6 h-6 text-red-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-brand-text text-sm truncate">{{ negocio.menuPdf.name || 'Menú' }}</p>
                    <p class="text-brand-azulgris text-xs">Documento PDF</p>
                  </div>
                  <a
                    :href="negocio.menuPdf.url"
                    target="_blank"
                    rel="noopener"
                    class="text-brand-primary text-sm font-semibold hover:underline shrink-0"
                  >Abrir</a>
                </div>
                <div v-else class="grid grid-cols-3 gap-2 h-40">
                  <button
                    v-for="(img, idx) in negocio.menuImages.slice(0, 3)"
                    :key="img.url"
                    type="button"
                    @click="activeTab = 'menu'"
                    class="rounded-xl overflow-hidden bg-brand-bg-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  >
                    <img :src="img.url" class="w-full h-full object-cover" :alt="`Menú ${idx + 1}`" />
                  </button>
                </div>
              </div>

              <!-- Fotos -->
              <div class="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="font-display font-black text-lg sm:text-xl text-brand-text">Fotos</h2>
                  <button @click="activeTab = 'fotos'" class="text-brand-azulgris text-sm font-medium hover:text-brand-text transition-colors">Ver todas →</button>
                </div>
                <div class="grid grid-cols-2 gap-2 h-48 sm:h-64 md:h-72">
                  <div class="bg-brand-bg-dark rounded-xl overflow-hidden">
                    <img v-if="negocio.photos[0]?.url" :src="negocio.photos[0].url" :alt="negocio.photos[0].alternativeText" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <ImageIcon class="w-8 h-8 text-white/20" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 grid-rows-2 gap-2">
                    <div v-for="idx in 3" :key="idx" class="bg-brand-bg-dark rounded-xl overflow-hidden">
                      <img v-if="negocio.photos[idx]?.url" :src="negocio.photos[idx].url" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <ImageIcon class="w-5 h-5 text-white/20" />
                      </div>
                    </div>
                    <div v-if="negocio.photos.length > 4" class="bg-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors" @click="activeTab = 'fotos'">
                      <span class="font-bold text-brand-text text-base sm:text-lg">+{{ negocio.photos.length - 4 }}</span>
                    </div>
                    <div v-else class="bg-brand-bg-dark rounded-xl flex items-center justify-center">
                      <ImageIcon class="w-5 h-5 text-white/20" />
                    </div>
                  </div>
                </div>
              </div>

            </template>

            <!-- Menú tab -->
            <template v-if="activeTab === 'menu'">
              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-4 gap-4 flex-wrap">
                  <h2 class="font-display font-black text-xl text-brand-text">Menú</h2>
                  <a
                    v-if="negocio.menuPdf?.url"
                    :href="negocio.menuPdf.url"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-bg-dark text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Download class="w-4 h-4" />
                    Descargar PDF
                  </a>
                </div>

                <!-- PDF embebido -->
                <div v-if="negocio.menuPdf?.url" class="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                  <iframe
                    :src="negocio.menuPdf.url"
                    class="w-full h-[720px] block border-0"
                    :title="`Menú de ${negocio.name}`"
                    loading="lazy"
                  />
                  <div class="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-white text-xs">
                    <p class="text-brand-azulgris truncate">
                      ¿No se muestra el menú?
                    </p>
                    <a
                      :href="negocio.menuPdf.url"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-1.5 text-brand-primary font-semibold hover:underline shrink-0"
                    >
                      <FileText class="w-3.5 h-3.5" />
                      Abrir en pestaña nueva
                    </a>
                  </div>
                </div>

                <!-- Galería de imágenes -->
                <div
                  v-else-if="negocio.menuImages.length"
                  class="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  <button
                    v-for="(img, idx) in negocio.menuImages"
                    :key="img.url"
                    type="button"
                    @click="openMenuLightbox(idx)"
                    class="aspect-[3/4] rounded-2xl overflow-hidden bg-brand-bg-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                  >
                    <img
                      :src="img.url"
                      :alt="img.alternativeText ?? `Menú ${idx + 1}`"
                      class="w-full h-full object-cover hover:scale-[1.02] transition-transform"
                    />
                  </button>
                </div>

                <div v-else class="text-center py-12 text-brand-azulgris text-sm">
                  Este negocio aún no ha subido su menú.
                </div>
              </div>
            </template>

            <!-- Reseñas tab -->
            <template v-if="activeTab === 'resenas'">
              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="font-display font-black text-xl text-brand-text">Reseñas</h2>
                  <button class="bg-brand-bg-dark hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-opacity">
                    Escribir reseña
                  </button>
                </div>

                <div v-if="negocio.reviews.length">
                  <!-- Rating summary -->
                  <div class="flex items-start gap-8 mb-8">
                    <div class="text-center shrink-0">
                      <div class="font-display font-black text-5xl text-brand-text leading-none">{{ (negocio.ratingAverage ?? 0).toFixed(1) }}</div>
                      <div class="flex gap-0.5 justify-center mt-2">
                        <Star v-for="i in 5" :key="i" :class="['w-4 h-4', i <= Math.round(negocio.ratingAverage ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']" />
                      </div>
                      <p class="text-brand-azulgris text-xs mt-1">{{ negocio.ratingCount ?? 0 }} reseñas</p>
                    </div>
                  </div>

                  <!-- Individual reviews -->
                  <div class="divide-y divide-gray-100">
                    <div v-for="review in negocio.reviews" :key="review.id" class="py-5 first:pt-0 last:pb-0">
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {{ review.title?.charAt(0) ?? '?' }}
                          </div>
                          <div>
                            <p class="font-semibold text-brand-text text-sm leading-tight">{{ review.title ?? 'Reseña' }}</p>
                            <p class="text-brand-azulgris text-xs mt-0.5">{{ review.visitDate }}</p>
                          </div>
                        </div>
                        <div class="flex gap-0.5 shrink-0">
                          <Star
                            v-for="i in 5"
                            :key="i"
                            :class="['w-3.5 h-3.5', i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300']"
                          />
                        </div>
                      </div>
                      <p class="text-brand-text text-sm leading-relaxed mt-3">{{ review.comment }}</p>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-12 text-brand-azulgris text-sm">
                  Aún no hay reseñas para este negocio.
                </div>
              </div>
            </template>

            <!-- Fotos tab -->
            <template v-if="activeTab === 'fotos'">
              <div class="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <h2 class="font-display font-black text-lg sm:text-xl text-brand-text mb-4">Fotos</h2>
                <div v-if="negocio.photos.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  <div v-for="foto in negocio.photos" :key="foto.url" class="aspect-square rounded-xl overflow-hidden bg-brand-bg-dark">
                    <img v-if="foto.url" :src="foto.url" :alt="foto.alternativeText" class="w-full h-full object-cover" />
                  </div>
                </div>
                <div v-else class="text-center py-12 text-brand-azulgris text-sm">
                  Aún no hay fotos para este negocio.
                </div>
              </div>
            </template>

          </div>

          <!-- Sidebar -->
          <div class="w-full lg:w-80 shrink-0 space-y-4">

            <!-- Contact card -->
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">

              <!-- Header oscuro -->
              <div class="bg-brand-bg-dark px-5 pt-5 pb-5">
                <p class="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">Información de contacto</p>
                <h3 class="font-display font-black text-2xl text-white leading-tight">{{ negocio.name }}</h3>
              </div>

              <!-- Cuerpo blanco -->
              <div class="divide-y divide-gray-100">

                <div v-if="negocio.phones.length" class="flex gap-3 px-5 py-4">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Phone class="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p class="text-gray-400 text-xs mb-0.5">Teléfono</p>
                    <p v-for="phone in negocio.phones" :key="phone.number" class="text-brand-text text-sm font-semibold leading-snug">{{ phone.number }}</p>
                  </div>
                </div>

                <div v-if="fullAddress" class="flex gap-3 px-5 py-4">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <MapPin class="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p class="text-gray-400 text-xs mb-0.5">Dirección</p>
                    <p class="text-brand-text text-sm font-semibold leading-snug">{{ fullAddress }}</p>
                  </div>
                </div>

                <div v-if="negocio.email" class="flex gap-3 px-5 py-4">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Mail class="w-4 h-4 text-slate-500" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-gray-400 text-xs mb-0.5">Email</p>
                    <a :href="`mailto:${negocio.email}`" class="text-brand-text text-sm font-semibold leading-snug hover:text-brand-primary break-all">
                      {{ negocio.email }}
                    </a>
                  </div>
                </div>

                <div v-if="negocio.website" class="flex gap-3 px-5 py-4">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Globe class="w-4 h-4 text-slate-500" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-gray-400 text-xs mb-0.5">Sitio web</p>
                    <a :href="negocio.website" target="_blank" rel="noopener" class="text-brand-primary text-sm font-semibold leading-snug hover:underline break-all">
                      {{ negocio.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') }}
                    </a>
                  </div>
                </div>

                <div v-if="negocio.socialLinks.length" class="flex gap-3 px-5 py-4">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Share2 class="w-4 h-4 text-slate-500" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-gray-400 text-xs mb-2">Redes sociales</p>
                    <div class="flex flex-wrap gap-2">
                      <a
                        v-for="link in negocio.socialLinks"
                        :key="link.id ?? link.url"
                        :href="link.url"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-brand-text hover:bg-gray-50 transition-colors capitalize"
                      >
                        <svg v-if="link.platform === 'facebook'" class="w-3.5 h-3.5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.02 4.388 11.01 10.125 11.927v-8.437H7.078v-3.49h3.047V9.412c0-3.017 1.792-4.687 4.533-4.687 1.313 0 2.686.235 2.686.235v2.97h-1.514c-1.49 0-1.955.93-1.955 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.083 24 18.092 24 12.073z"/>
                        </svg>
                        <svg v-else-if="link.platform === 'instagram'" class="w-3.5 h-3.5 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                        <svg v-else-if="link.platform === 'tiktok'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>
                        </svg>
                        <Share2 v-else class="w-3.5 h-3.5 text-brand-azulgris" />
                        {{ link.platform }}
                      </a>
                    </div>
                  </div>
                </div>

                <div v-if="hoursByDay.some(d => d.shifts.length || d.isClosed)" class="flex gap-3 px-5 py-4">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock class="w-4 h-4 text-slate-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-gray-400 text-xs mb-2">Horario</p>
                    <div class="space-y-1">
                      <div
                        v-for="day in hoursByDay"
                        :key="day.dayOfWeek"
                        class="flex justify-between items-start text-xs gap-2"
                      >
                        <span :class="day.dayOfWeek === todayKey ? 'text-brand-primary font-bold' : 'text-brand-text'">
                          {{ day.label }}
                        </span>
                        <span :class="['text-right', day.dayOfWeek === todayKey ? 'text-brand-primary font-bold' : 'text-gray-500']">
                          <template v-if="day.isClosed && !day.shifts.length">Cerrado</template>
                          <template v-else-if="!day.shifts.length">—</template>
                          <template v-else>
                            <span v-for="(shift, idx) in day.shifts" :key="idx" class="block">
                              {{ formatShift(shift) }}
                            </span>
                          </template>
                        </span>
                      </div>
                    </div>
                    <p v-if="negocio.hoursText" class="text-[11px] text-gray-400 mt-2 leading-snug">{{ negocio.hoursText }}</p>
                  </div>
                </div>

              </div>

              <!-- Botones de acción -->
              <div class="px-5 pb-5 pt-4 space-y-2.5">
                <a
                  v-for="phone in negocio.phones"
                  :key="phone.number"
                  :href="`tel:${phone.number}`"
                  class="w-full flex items-center justify-center gap-2 bg-brand-bg-dark hover:opacity-90 text-white text-sm font-semibold py-3.5 rounded-xl transition-opacity"
                >
                  <Phone class="w-4 h-4" />
                  Llamar ahora
                </a>
                <a
                  v-if="negocio.phones.some(p => p.hasWhatsapp)"
                  :href="`https://wa.me/${negocio.phones.find(p => p.hasWhatsapp)?.number.replace(/\D/g, '') ?? ''}`"
                  target="_blank"
                  rel="noopener"
                  class="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-3.5 rounded-xl transition-colors"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <button
                  v-if="hasLocation"
                  type="button"
                  @click="openMap"
                  class="w-full flex items-center justify-center gap-2 border border-gray-200 text-brand-text text-sm font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Map class="w-4 h-4" />
                  Ver en el mapa
                </button>
              </div>
            </div>

            <!-- Claim card -->
            <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <p class="font-semibold text-brand-text text-sm mb-1">¿Es tu negocio?</p>
              <p class="text-brand-azulgris text-xs leading-relaxed mb-3">
                Reclamarlo te permite actualizar los datos, responder reseñas y acceder a estadísticas.
              </p>
              <button @click="handleClaim" class="text-brand-primary text-sm font-semibold hover:underline">
                Reclamar este negocio →
              </button>
            </div>

          </div>
        </div>
      </div>

    </template>

    <!-- Modal: Mapa -->
    <TransitionRoot appear :show="showMapModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showMapModal = false">
        <TransitionChild
          as="template"
          enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div class="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
          <TransitionChild
            as="template"
            enter="ease-out duration-200" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-150" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="relative w-full max-w-4xl">
              <button
                type="button"
                @click="showMapModal = false"
                class="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white text-brand-text flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <X class="w-5 h-5" />
              </button>
              <div class="rounded-2xl overflow-hidden bg-white shadow-2xl">
                <iframe
                  v-if="negocio?.mapEmbedUrl"
                  :src="negocio.mapEmbedUrl"
                  class="w-full h-[70vh] block border-0"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  allowfullscreen
                  :title="`Mapa de ${negocio.name}`"
                />
                <div class="px-5 py-4 flex items-center justify-between gap-3 border-t border-gray-100">
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-brand-text text-sm truncate">{{ negocio?.name }}</p>
                    <p class="text-brand-azulgris text-xs truncate">{{ fullAddress || 'Sin dirección' }}</p>
                  </div>
                  <a
                    :href="mapDirectionsUrl"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap"
                  >
                    Cómo llegar →
                  </a>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Lightbox: Menú imágenes -->
    <TransitionRoot appear :show="menuLightbox.open" as="template">
      <Dialog as="div" class="relative z-50" @close="closeMenuLightbox">
        <TransitionChild
          as="template"
          enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div class="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
          <TransitionChild
            as="template"
            enter="ease-out duration-200" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-150" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="relative w-full max-w-4xl">
              <button
                type="button"
                @click="closeMenuLightbox"
                class="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white text-brand-text flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <X class="w-5 h-5" />
              </button>
              <img
                v-if="negocio?.menuImages?.[menuLightbox.index]?.url"
                :src="negocio.menuImages[menuLightbox.index].url"
                :alt="`Menú ${menuLightbox.index + 1}`"
                class="w-full max-h-[85vh] object-contain rounded-2xl bg-white"
              />
              <div v-if="(negocio?.menuImages?.length ?? 0) > 1" class="mt-4 flex items-center justify-center gap-3 text-white">
                <button
                  type="button"
                  @click="menuPrev"
                  class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors"
                >
                  ← Anterior
                </button>
                <span class="text-white/70 text-sm">{{ menuLightbox.index + 1 }} / {{ negocio.menuImages.length }}</span>
                <button
                  type="button"
                  @click="menuNext"
                  class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal: Reclamar negocio -->
    <TransitionRoot appear :show="showClaimModal" as="template">
      <Dialog as="div" class="relative z-50" @close="showClaimModal = false">

        <TransitionChild
          as="template"
          enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </TransitionChild>

        <div class="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-200" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
            leave="ease-in duration-150" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

              <!-- Header -->
              <div class="flex items-start justify-between px-6 pt-6 pb-4">
                <div>
                  <DialogTitle class="font-display font-black text-xl text-brand-text">Reclamar negocio</DialogTitle>
                  <p class="text-brand-azulgris text-xs mt-1">{{ negocio?.name }}</p>
                </div>
                <button @click="showClaimModal = false" class="text-brand-azulgris hover:text-brand-text transition-colors mt-0.5">
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- Éxito -->
              <div v-if="claimSent" class="px-6 pb-8 pt-2 text-center">
                <div class="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check class="w-7 h-7 text-emerald-600" />
                </div>
                <p class="font-semibold text-brand-text mb-1">¡Solicitud enviada!</p>
                <p class="text-brand-azulgris text-sm">Revisaremos tu solicitud y nos pondremos en contacto contigo en breve.</p>
                <button @click="showClaimModal = false" class="mt-6 btn-primary w-full">Cerrar</button>
              </div>

              <!-- Formulario -->
              <form v-else @submit.prevent="submitClaimForm" class="px-6 pb-6 space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Nombre completo</label>
                  <input
                    v-model="claimForm.nombre"
                    type="text"
                    required
                    placeholder="Tu nombre"
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Tu relación con el negocio</label>
                  <select
                    v-model="claimForm.rol"
                    required
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition bg-white"
                  >
                    <option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Teléfono de contacto</label>
                  <input
                    v-model="claimForm.telefono"
                    type="tel"
                    required
                    placeholder="+52 33 1234 5678"
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-brand-text mb-1.5">Notas <span class="text-brand-azulgris font-normal">(opcional)</span></label>
                  <textarea
                    v-model="claimForm.mensaje"
                    rows="3"
                    placeholder="Cuéntanos cómo podemos verificar que eres el propietario…"
                    class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition resize-none"
                  />
                </div>
                <p v-if="claimError" class="text-red-500 text-xs">{{ claimError }}</p>
                <button
                  type="submit"
                  :disabled="claimSending"
                  class="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span v-if="claimSending" class="inline-flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Enviando…
                  </span>
                  <span v-else>Enviar solicitud</span>
                </button>
              </form>

            </DialogPanel>
          </TransitionChild>
        </div>

      </Dialog>
    </TransitionRoot>

  </div>
</template>
