/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fondo: '#0F172A',
        superficie: '#1E293B',
        activo: '#10B981',
        activoOscuro: '#059669',
        accion: '#3B82F6',
        accionOscuro: '#2563EB',
        peligro: '#EF4444',
        peligroOscuro: '#DC2626',
        neutro: '#64748B',
        texto: '#F8FAFC',
        textoSecundario: '#94A3B8',
        morado: '#7C3AED',
        tarjetaCuerpo: '#F8FAFC',
        tarjetaTexto: '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        condensada: ['Barlow Condensed', 'Roboto Condensed', 'Arial Narrow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
