/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',   // Primary blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card:    '#ffffff',
          border:  '#e2e8f0',
          muted:   '#f1f5f9',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted:   '#475569',
          faint:   '#64748b',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'slide-up':   'slideUp 0.4s ease forwards',
        'fade-in':    'fadeIn 0.3s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'bounce-in':  'bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
      },
      keyframes: {
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        bounceIn:  { '0%': { transform: 'scale(0.8)', opacity: 0 }, '70%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      boxShadow: {
        'glow-brand': '0 0 24px rgba(59,130,246,0.25)',
        'glow-sm':    '0 0 10px rgba(59,130,246,0.18)',
        'card':       '0 8px 30px rgba(15,23,42,0.08)',
        'card-hover': '0 12px 40px rgba(15,23,42,0.14)',
      },
    },
  },
  plugins: [],
}
