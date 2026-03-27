/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink': {
          deep: '#06060d',
          900: '#08080f',
          800: '#0e0e1a',
          700: '#161625',
          600: '#222235',
          500: '#2e2e45',
        },
        'accent': {
          DEFAULT: '#8b7cf7',
          soft: '#7a6ce6',
          muted: '#6a5cd0',
        },
        'star': {
          blue: '#6cb4ee',
          soft: '#5aa0d8',
        },
        'space': {
          900: '#08080f',
          800: '#0e0e1a',
          700: '#161625',
          600: '#222235',
        },
        'bubble': {
          anxiety: '#e08080',
          anger: '#d06060',
          sadness: '#70a8c0',
          fear: '#b090d0',
          guilt: '#c0a070',
          shame: '#a89090',
          neutral: '#80b0c0',
          mixed: '#a090c0',
        }
      },
      fontFamily: {
        'display': ['"Ma Shan Zheng"', 'cursive'],
        'body': ['"LXGW WenKai"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'breathe': 'gentleBreathe 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', filter: 'blur(4px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gentleBreathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
