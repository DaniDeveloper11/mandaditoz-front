/**
 * Detecta si el viewport actual es de móvil/tablet vs. desktop, usando el
 * mismo corte que ya usa el resto del sitio para su nav responsive (ver
 * `lg:hidden` / `hidden lg:flex` en layouts/landing.vue). Se usa para
 * features que solo tienen sentido en un dispositivo con cámara a mano,
 * como tomar la foto de un platillo.
 *
 * Solo viewport (sin exigir "pointer: coarse"): así también funciona al
 * probar en el device toolbar de DevTools sin emulación táctil activada,
 * y en tablets/laptops híbridas que reportan el puntero como "fine".
 */
export function useDeviceType() {
  const isMobileOrTablet = ref(false)

  function update() {
    if (typeof window === 'undefined') return
    isMobileOrTablet.value = window.matchMedia('(max-width: 1024px)').matches
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') window.removeEventListener('resize', update)
  })

  return { isMobileOrTablet }
}
