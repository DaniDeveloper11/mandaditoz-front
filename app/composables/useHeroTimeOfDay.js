// Hero: el fondo simula la hora del día actual (calculado en cliente para
// usar la hora local del visitante, no la del servidor).
// El cielo cubre todo el hero; encima va un "scrim" que da contraste del
// lado del texto. De día el cielo es claro de verdad (no oscurecido), así
// que el texto cambia a tinta oscura en vez de blanco.
//
// Compartido entre el hero de index.vue y el hero del detalle de negocio
// (BusinessDetailPage.vue) para que ambos tengan exactamente el mismo
// efecto de amanecer/día/atardecer/noche.
const HERO_THEME = {
  night: {
    sky: 'linear-gradient(160deg, #22314a 0%, #16202f 55%, #0f1522 100%)',
    scrim: 'linear-gradient(100deg, rgba(15,21,34,0.90) 0%, rgba(15,21,34,0.55) 42%, rgba(15,21,34,0.1) 72%, rgba(15,21,34,0) 100%)',
    heading: 'text-white',
    accent: 'text-brand-primary-dark',
    tagline: 'text-brand-azulgris',
    hint: 'text-brand-azulgris/80',
    cityBorder: 'border-white/40 hover:border-white',
  },
  dawn: {
    sky: 'linear-gradient(160deg, #4a3a5e 0%, #a8654f 55%, #d68a52 100%)',
    scrim: 'linear-gradient(100deg, rgba(35,22,32,0.82) 0%, rgba(35,22,32,0.48) 42%, rgba(35,22,32,0.1) 72%, rgba(35,22,32,0) 100%)',
    heading: 'text-white',
    accent: 'text-amber-200',
    tagline: 'text-white/70',
    hint: 'text-white/60',
    cityBorder: 'border-white/40 hover:border-white',
  },
  day: {
    // Cielo claro de verdad — sin scrim oscuro encima, así que el texto
    // pasa a tinta oscura para mantener el contraste
    sky: 'linear-gradient(160deg, #eaf6ff 0%, #a9dcf7 45%, #4fa8dd 100%)',
    scrim: 'linear-gradient(100deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0) 75%)',
    heading: 'text-brand-text',
    accent: 'text-brand-primary',
    tagline: 'text-brand-text/70',
    hint: 'text-brand-text/60',
    cityBorder: 'border-brand-text/30 hover:border-brand-text',
  },
  dusk: {
    sky: 'linear-gradient(160deg, #4a3a5e 0%, #c96a3e 55%, #8a4a6b 100%)',
    scrim: 'linear-gradient(100deg, rgba(30,18,28,0.82) 0%, rgba(30,18,28,0.48) 42%, rgba(30,18,28,0.1) 72%, rgba(30,18,28,0) 100%)',
    heading: 'text-white',
    accent: 'text-amber-200',
    tagline: 'text-white/70',
    hint: 'text-white/60',
    cityBorder: 'border-white/40 hover:border-white',
  },
}

const HERO_CELESTIAL = {
  night: { top: '10%', right: '20%', size: '44px', background: 'radial-gradient(circle at 35% 35%, #fdfdf2, #d9dde8 70%)', boxShadow: '0 0 24px 6px rgba(255,255,255,0.25)' },
  dawn: { top: '58%', right: '22%', size: '62px', background: 'radial-gradient(circle at 35% 35%, #ffe3ab, #e8873f 70%)', boxShadow: '0 0 40px 14px rgba(232,135,63,0.35)' },
  day: { top: '12%', right: '24%', size: '50px', background: 'radial-gradient(circle at 35% 35%, #fff8d8, #ffd257 70%)', boxShadow: '0 0 36px 10px rgba(255,210,87,0.4)' },
  dusk: { top: '55%', right: '20%', size: '58px', background: 'radial-gradient(circle at 35% 35%, #ffcf9c, #d4552f 70%)', boxShadow: '0 0 40px 14px rgba(212,85,47,0.4)' },
}

const HERO_PERIODS = ['dawn', 'day', 'dusk', 'night']

/**
 * Franja horaria actual (o forzada vía ?hero=day|dawn|dusk|night, útil para
 * probar/demostrar el efecto sin esperar a que sea esa hora de verdad) y
 * todos los valores derivados que necesita el hero: fondo, celestial
 * (sol/luna), opacidad del cityscape y brillo de las lámparas.
 */
export function useHeroTimeOfDay() {
  const route = useRoute()

  const heroPeriod = ref('night')
  let heroInterval = null

  function updateHeroPeriod() {
    const forced = route.query.hero
    if (typeof forced === 'string' && HERO_PERIODS.includes(forced)) {
      heroPeriod.value = forced
      return
    }
    const h = new Date().getHours()
    heroPeriod.value = h >= 6 && h < 8 ? 'dawn'
      : h >= 8 && h < 18 ? 'day'
      : h >= 18 && h < 20 ? 'dusk'
      : 'night'
  }

  onMounted(() => {
    updateHeroPeriod()
    heroInterval = setInterval(updateHeroPeriod, 5 * 60 * 1000)
  })

  onBeforeUnmount(() => {
    if (heroInterval) clearInterval(heroInterval)
  })

  const heroTheme = computed(() => HERO_THEME[heroPeriod.value])
  const heroBackground = computed(() => `${heroTheme.value.scrim}, ${heroTheme.value.sky}`)
  // De día el cielo es claro, así que las siluetas de los edificios se
  // intensifican un poco para que no se laven contra el fondo
  const heroCityscapeOpacity = computed(() => {
    if (heroPeriod.value === 'day') return 0.32
    if (heroPeriod.value === 'night') return 0.2
    return 0.26
  })
  const heroCelestial = computed(() => HERO_CELESTIAL[heroPeriod.value])
  const heroCelestialStyle = computed(() => ({
    top: heroCelestial.value.top,
    right: heroCelestial.value.right,
    width: heroCelestial.value.size,
    height: heroCelestial.value.size,
    background: heroCelestial.value.background,
    boxShadow: heroCelestial.value.boxShadow,
  }))
  // De noche/atardecer/amanecer se ven encendidos; de día, apagados
  const heroLampGlow = computed(() => {
    if (heroPeriod.value === 'day') return 0
    if (heroPeriod.value === 'night') return 1
    return 0.6
  })

  return {
    heroPeriod,
    heroTheme,
    heroBackground,
    heroCityscapeOpacity,
    heroCelestialStyle,
    heroLampGlow,
    updateHeroPeriod,
  }
}
