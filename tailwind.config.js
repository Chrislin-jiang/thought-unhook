/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色系 — 薰衣草紫
        'primary': {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8B7CF7',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // 辅助色 — 薄荷绿
        'mint': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#4ECDC4',
          500: '#14b8a6',
        },
        // 背景色系
        'surface': {
          50: '#faf9ff',    // 最浅背景
          100: '#f3f1fb',   // 卡片背景
          200: '#ece8f7',   // 次级区域
          300: '#e2dcf0',   // 分割线
        },
        // 情绪气泡色系 — 柔和马卡龙色
        'bubble': {
          anxiety: '#FFB5B5',
          anger: '#FF9B9B',
          sadness: '#9DC4E8',
          fear: '#C5A3D9',
          guilt: '#E8C99B',
          shame: '#D4B5B5',
          neutral: '#A8D8E8',
          mixed: '#C5B3D9',
        },
      },
      fontFamily: {
        'display': ['"Ma Shan Zheng"', 'cursive'],
        'body': ['"LXGW WenKai"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 20px rgba(139, 124, 247, 0.08)',
        'card': '0 4px 24px rgba(139, 124, 247, 0.06), 0 1px 4px rgba(0,0,0,0.04)',
        'float': '0 8px 32px rgba(139, 124, 247, 0.12)',
        'glow': '0 0 20px rgba(139, 124, 247, 0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'breathe': 'gentleBreathe 4s ease-in-out infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gentleBreathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
}
