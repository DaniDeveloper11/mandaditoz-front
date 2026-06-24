import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Actualiza estos nombres cuando definas la tipografía final
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        
        brand: {
          // Primario
          primary:    '#1D5A8A', 
          'primary-dark':  '#599ed4',
          'primary-light': '#1D5A8A',
          ocre:  '#D48B1A ', // mostaza/ocre
          terracota:     '#B85030', //Terracota
          azulgris:     '#8094A8', //Terracota
          cremajalisco:     '#8094A8', //Terracota

          // Fondos
          bg:         '#8094A8', //Bg light 
          'bg-dark':   '#1A2535 ', //bg-dark 
          // Texto
          text:       '#1C1410', // casi negro cálido
          'text-soft':'#6B5B4E', // texto secundario
          // Bordes
          border:     '#E2D5C3',
        },
        // Semánticos
        success:  '#2A7A5F',
        warning:  '#D48B1A',
        error:    '#C0392B',
        info:     '#2563EB',
      },
  
    },
  },
  plugins: [],
} satisfies Config
