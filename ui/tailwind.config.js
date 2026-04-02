/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          50:  '#f0f0ff',
          100: '#e4e4ff',
          200: '#ccccff',
          300: '#a8a8ff',
          400: '#7c7cfc',
          500: '#5656f5',
          600: '#3e3ee8',
          700: '#2f2fd0',
          800: '#2828aa',
          900: '#1e1e7e',
          950: '#0d0d3f',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-midnight':
          'linear-gradient(135deg, #0d0d3f 0%, #1e1e7e 50%, #0d0d3f 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
