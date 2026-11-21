/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        forest: {
          900: '#063322',
          800: '#09462f',
          700: '#0c5338',
          600: '#0e6245',
          500: '#107452',
        },
        surface: {
          light: '#edf6f0',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857'
        }
      },
      boxShadow: {
        'emerald-card': '0 20px 50px rgba(14, 90, 60, 0.12)',
        'brutal': '3px 3px 0px 0px rgba(15, 23, 42, 0.9)',
      }
    },
  },
  plugins: [],
}
