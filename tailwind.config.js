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
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0a',
          700: '#c2560a',
          800: '#9a3b09',
          900: '#7c2d12',
        },
        cream: {
          50:  '#fefdf9',
          100: '#fdf8f0',
          200: '#fbf0e0',
          300: '#f7e4c8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(.25,.46,.45,.94) forwards',
        'slide-out-left': 'slideOutLeft 0.4s cubic-bezier(.25,.46,.45,.94) forwards',
        'slide-in-left':  'slideInLeft 0.4s cubic-bezier(.25,.46,.45,.94) forwards',
        'slide-out-right':'slideOutRight 0.4s cubic-bezier(.25,.46,.45,.94) forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutLeft: {
          '0%':   { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-60px)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%':   { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(60px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
        'brand': '0 4px 24px rgba(249,115,22,0.35)',
      }
    },
  },
  plugins: [],
}
