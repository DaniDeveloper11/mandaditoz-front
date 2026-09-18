import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'mx.mandaditoz.app',
  appName: 'Mandaditoz',
  webDir: '.output/public',
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    // Solo se compila el proveedor de Google: los demás SDK del plugin (Facebook,
    // Twitter…) engordan el APK y disparan falsos positivos en los escáneres de
    // privacidad de Play Store por clases que nunca se usan.
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#FFFFFF',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
}

export default config
