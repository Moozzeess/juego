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
        accion: '#3B82F6',
        peligro: '#EF4444',
        neutro: '#64748B',
        texto: '#F8FAFC',
        textoSecundario: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
