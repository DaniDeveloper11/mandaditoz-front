import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC = resolve(ROOT, 'public')
const OUT = resolve(ROOT, 'resources')

mkdirSync(OUT, { recursive: true })

const BRAND_PRIMARY = '#1D5A8A'
const WHITE = '#FFFFFF'

// ─── 1. icon.png (1024×1024) ─────────────────────────────────────
// Fondo blanco + ícono cielo-jalisco (SVG) escalado a 70% del canvas
const iconSvg = readFileSync(resolve(PUBLIC, 'icono-cielo-jalisco.svg'))
const ICON_SIZE = 1024
const ICON_INNER = Math.round(ICON_SIZE * 0.7)

const iconInner = await sharp(iconSvg, { density: 900 })
  .resize(ICON_INNER, ICON_INNER, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toBuffer()

await sharp({
  create: { width: ICON_SIZE, height: ICON_SIZE, channels: 4, background: WHITE },
})
  .composite([{ input: iconInner, gravity: 'center' }])
  .png()
  .toFile(resolve(OUT, 'icon.png'))
console.log('✓ icon.png (1024×1024) generado')

// ─── 2. splash.png (2732×2732) ───────────────────────────────────
// Fondo blanco + logo horizontal mandaditoz escalado a 45% del ancho
const SPLASH_SIZE = 2732
const LOGO_WIDTH = Math.round(SPLASH_SIZE * 0.45)

const logoLight = await sharp(resolve(PUBLIC, 'logo-mandaditoz.jpg'))
  .resize(LOGO_WIDTH, LOGO_WIDTH, { fit: 'contain', background: WHITE })
  .png()
  .toBuffer()

await sharp({
  create: { width: SPLASH_SIZE, height: SPLASH_SIZE, channels: 4, background: WHITE },
})
  .composite([{ input: logoLight, gravity: 'center' }])
  .png()
  .toFile(resolve(OUT, 'splash.png'))
console.log('✓ splash.png (2732×2732) generado')

// ─── 3. splash-dark.png (2732×2732) ──────────────────────────────
// Fondo brand primary + ícono cielo (blanco/color) centrado, mismo tamaño que ícono horizontal
const iconWhiteBg = await sharp(iconSvg, { density: 900 })
  .resize(LOGO_WIDTH, LOGO_WIDTH, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toBuffer()

await sharp({
  create: { width: SPLASH_SIZE, height: SPLASH_SIZE, channels: 4, background: BRAND_PRIMARY },
})
  .composite([{ input: iconWhiteBg, gravity: 'center' }])
  .png()
  .toFile(resolve(OUT, 'splash-dark.png'))
console.log('✓ splash-dark.png (2732×2732) generado')

console.log('\n✓ Todos los assets base están en', OUT)
