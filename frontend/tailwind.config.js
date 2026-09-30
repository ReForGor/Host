/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0a192f',
        },
        galaxy: {
          dark: '#0B0518',
          surface: '#120826',
          card: '#1A0D36',
          border: 'rgba(139, 92, 246, 0.25)',
          purple: '#8B5CF6',
          purpleDeep: '#6D28D9',
          purpleVibrant: '#A855F7',
          purpleLight: '#D0BCFF',
          cyan: '#06B6D4',
          cyanLight: '#4CD7F6',
          blue: '#2563EB',
          emerald: '#10B981',
          orange: '#F97316',
          crimson: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Prompt', 'sans-serif'],
        cyber: ['Michroma', 'Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Grotesk', 'monospace'],
      }
    },
  },
  plugins: [],
}
