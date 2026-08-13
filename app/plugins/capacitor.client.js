export default defineNuxtPlugin(async () => {
  if (typeof window === 'undefined') return

  const { Capacitor } = await import('@capacitor/core')
  if (!Capacitor.isNativePlatform()) return

  const { App } = await import('@capacitor/app')
  const { SplashScreen } = await import('@capacitor/splash-screen')
  const router = useRouter()

  App.addListener('appUrlOpen', (event) => {
    try {
      const url = new URL(event.url)
      if (url.pathname) router.push(url.pathname + url.search)
    } catch (_) {}
  })

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) router.back()
    else App.exitApp()
  })

  await SplashScreen.hide()
})
