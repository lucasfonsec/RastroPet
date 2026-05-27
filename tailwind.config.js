/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a3a3a3',
          600: '#d97757', // primary brand color
          700: '#c55f40',
          800: '#a84c31',
          900: '#8b3d26',
        }
      }
    },
  },
  plugins: [],
}
