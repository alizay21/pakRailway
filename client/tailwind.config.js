/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0A1628',
        emerald: '#10B981',
        gold: '#F59E0B',
        primary: '#0A1628',
        secondary: '#10B981',
        accent: '#F59E0B',
        error: '#EF4444',
        surface: '#FFFFFF',
        background: '#F8FAFC',
        textPrimary: '#0F172A',
        textSecondary: '#64748B'
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
      },
    },
  },
  plugins: [],
}
