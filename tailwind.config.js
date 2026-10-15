/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#002B49',
          navyHover: '#001E33',
          subtleNavy: '#F0F5FA',
          border: '#E2E8F0',
          muted: '#64748B',
          dark: '#0F172A',
        },
        fda: {
          navy: '#002B49',
          blue: '#004B87',
          lightBlue: '#F0F5FA',
          gold: '#C5A059',
          dark: '#0F172A',
          surface: '#F8FAFC',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Sarabun', 'Prompt', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
