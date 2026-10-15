/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fda: {
          navy: '#002B49',
          blue: '#005A9C',
          lightBlue: '#E6F0F8',
          teal: '#008779',
          gold: '#C5A059',
          dark: '#0A192F',
          surface: '#F8FAFC',
          border: '#E2E8F0',
        },
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc2fd',
          400: '#36a2fa',
          500: '#0c85eb',
          600: '#0067ca',
          700: '#0052a3',
          800: '#002B49', // FDA Deep Navy
          900: '#05294e',
          950: '#031b34',
        }
      },
      fontFamily: {
        sans: ['Sarabun', 'Prompt', 'Noto Sans Thai', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 43, 73, 0.05), 0 2px 4px -1px rgba(0, 43, 73, 0.03)',
        'elevated': '0 10px 15px -3px rgba(0, 43, 73, 0.08), 0 4px 6px -2px rgba(0, 43, 73, 0.04)',
      }
    },
  },
  plugins: [],
}
