<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-brand-bg-dark px-4 py-12">

    <a href="/" class="mb-8">
      <img src="/logo-cielo-horizontal-dark.svg" alt="Mandaditoz" class="h-14 sm:h-20 w-auto" />
    </a>

    <div class="w-full max-w-md">

      <!-- Cargando -->
      <div v-if="pending" class="card px-8 py-12 text-center">
        <Loader2 class="mx-auto size-7 animate-spin text-brand-primary" />
        <p class="mt-4 text-sm text-brand-text-soft">Buscando tu negocio…</p>
      </div>

      <!-- Enlace que ya no sirve -->
      <div v-else-if="estado !== 'valid' && !enviado" class="card px-8 py-10 text-center">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-amber-100">
          <TriangleAlert class="size-7 text-amber-600" />
        </div>
        <h1 class="font-display text-2xl font-semibold text-brand-text mb-2">
          {{ mensajeInvalido.titulo }}
        </h1>
        <p class="text-sm text-brand-text-soft mb-6">{{ mensajeInvalido.texto }}</p>
        <a href="/contacto" class="btn-primary inline-flex">Escríbenos</a>
      </div>

      <!-- Reclamo enviado -->
      <div v-else-if="enviado" class="card px-8 py-10 text-center">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-success/10">
          <Check class="size-7 text-success" />
        </div>
        <h1 class="font-display text-2xl font-semibold text-brand-text mb-2">
          ¡Listo, {{ negocio.name }} ya es tuyo!
        </h1>
        <p class="text-sm text-brand-text-soft mb-5">
          Ahora completa tu ficha: sube tu logo, pon tus horarios y tu WhatsApp.
          Entre más completa, más te encuentran.
        </p>
        <a :href="editarUrl" class="btn-primary w-full justify-center">Completar mi ficha</a>
        <a :href="fichaUrl" class="mt-3 inline-block text-sm text-brand-primary hover:underline">
          Ver cómo se ve mi negocio
        </a>
        <p class="mt-5 text-xs text-brand-azulgris">
          Tu sesión quedó iniciada con {{ correoEnviado }}.
        </p>
      </div>

      <!-- Formulario -->
      <div v-else class="card px-8 py-10">
        <p class="text-center text-xs font-semibold uppercase tracking-wide text-brand-azulgris mb-2">
          ¿Es tu negocio?
        </p>
        <h1 class="font-display text-2xl font-semibold text-brand-text text-center leading-tight">
          {{ negocio.name }}
        </h1>
        <p class="text-center text-sm text-brand-text-soft mt-1">
          <span v-if="negocio.categoryName">{{ negocio.categoryName }}</span>
          <span v-if="negocio.categoryName && negocio.cityName"> · </span>
          <span v-if="negocio.cityName">{{ negocio.cityName }}</span>
        </p>
        <p v-if="negocio.phoneMasked" class="text-center text-xs text-brand-azulgris mt-2">
          Te mandamos este enlace al {{ negocio.phoneMasked }}
        </p>

        <form class="mt-7 space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label for="ci-email" class="block text-sm font-medium text-brand-text mb-1.5">
              Tu correo <span class="text-error">*</span>
            </label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
              <input
                id="ci-email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                placeholder="tu@correo.com"
                class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
              />
            </div>
          </div>

          <div>
            <label for="ci-password" class="block text-sm font-medium text-brand-text mb-1.5">
              Crea una contraseña <span class="text-error">*</span>
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-azulgris" />
              <input
                id="ci-password"
                v-model="form.password"
                :type="verPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                minlength="8"
                placeholder="Mínimo 8 caracteres"
                class="w-full pl-9 pr-10 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text text-sm placeholder:text-brand-azulgris/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-brand-azulgris hover:text-brand-text transition"
                @click="verPassword = !verPassword"
              >
                <component :is="verPassword ? EyeOff : Eye" class="size-4" />
              </button>
            </div>
            <p class="mt-1.5 text-xs text-brand-azulgris">
              Si ya tienes cuenta en Mandaditoz, usa ese mismo correo y contraseña.
            </p>
          </div>

          <p v-if="error" class="text-sm text-error">{{ error }}</p>

          <button type="submit" :disabled="enviando" class="btn-primary w-full justify-center">
            <span v-if="enviando" class="inline-flex items-center gap-2">
              <Loader2 class="size-4 animate-spin" /> Enviando…
            </span>
            <span v-else>Sí, es mi negocio</span>
          </button>
        </form>
      </div>

      <p class="mt-6 text-center text-xs text-white/30">
        Reclamar tu negocio es gratis. Al continuar aceptas los
        <a href="/terminos" class="underline hover:text-white/60 transition">Términos</a> y la
        <a href="/privacidad" class="underline hover:text-white/60 transition">Política de privacidad</a>.
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Mail, Lock, Eye, EyeOff, Check, TriangleAlert, Loader2 } from '@lucide/vue'
import { FALLBACK_CITY_SLUG } from '~/utils/urls'

definePageMeta({ layout: false })

const route = useRoute()
const token = computed(() => String(route.params.token ?? ''))
const { fetchInvite, redeem } = useClaimInvite(token)

// El enlace es privado y de un solo negocio: no tiene nada que hacer en Google.
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const { data, pending } = await useAsyncData(
  computed(() => `claim-invite|${token.value}`),
  () => fetchInvite().catch(() => ({ status: 'not_found' })),
)

const estado = computed(() => data.value?.status ?? 'not_found')
const negocio = computed(() => data.value?.business ?? {})

const mensajeInvalido = computed(() => ({
  expired: {
    titulo: 'Este enlace ya venció',
    texto: 'Los enlaces duran 30 días. Escríbenos y te mandamos uno nuevo en un momento.',
  },
  used: {
    titulo: 'Este negocio ya fue reclamado',
    texto: 'Alguien ya usó este enlace. Si fuiste tú, revisa tu correo; si no, avísanos y lo checamos.',
  },
  not_found: {
    titulo: 'No encontramos este enlace',
    texto: 'Puede que se haya cortado al copiarlo. Mándanos el mensaje que recibiste y lo revisamos.',
  },
}[estado.value] ?? {
  titulo: 'No encontramos este enlace',
  texto: 'Mándanos el mensaje que recibiste y lo revisamos.',
}))

const form = reactive({ email: '', password: '' })
const verPassword = ref(false)
const enviando = ref(false)
const enviado = ref(false)
const error = ref(null)
const correoEnviado = ref('')

const fichaUrl = computed(() =>
  `/${negocio.value.citySlug || FALLBACK_CITY_SLUG}/${negocio.value.slug ?? ''}`
)
// El negocio se entrega en el momento, sin aprobación de por medio, así que
// puede editar desde ya. Este enlace es el punto del embudo que de verdad
// importa: reclamar sin completar la ficha no sirve de nada.
const editarUrl = computed(() => `/negocios/${negocio.value.slug ?? ''}/edit`)

async function handleSubmit() {
  enviando.value = true
  error.value = null
  try {
    await redeem({
      email: form.email.trim(),
      password: form.password,
      displayName: negocio.value.name,
    })
    correoEnviado.value = form.email.trim()
    enviado.value = true
  } catch (e) {
    error.value = e?.data?.error?.message ?? 'No se pudo completar el reclamo. Intenta de nuevo.'
  } finally {
    enviando.value = false
  }
}
</script>
