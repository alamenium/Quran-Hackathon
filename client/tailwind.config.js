/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Duolingo-inspired palette, tuned for a Quran-learning context.
        brand: {
          // Primary green (encouraging, growth)
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#58CC02', // Duolingo green
          600: '#46a302',
          700: '#358000',
          800: '#205500',
          900: '#0f3300',
        },
        accent: {
          blue: '#1CB0F6',
          orange: '#FF9600',
          purple: '#CE82FF',
          gold: '#FFC800',
          pink: '#FF4B4B',
        },
        ink: {
          DEFAULT: '#3C3C3C',
          soft: '#777777',
          faint: '#AFAFAF',
        },
        cream: '#FFF9EE',
        paper: '#FAFAFA',
      },
      fontFamily: {
        display: ['"Nunito"', '"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri Quran"', '"Noto Naskh Arabic"', '"Scheherazade New"', 'serif'],
      },
      boxShadow: {
        'duo': '0 4px 0 0 rgba(0,0,0,0.12)',
        'duo-press': '0 2px 0 0 rgba(0,0,0,0.12)',
        'card': '0 2px 12px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pop-in': 'popIn 240ms ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '50%': { transform: 'translateX(6px)' },
          '75%': { transform: 'translateX(-3px)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.92' },
        },
      },
    },
  },
  plugins: [],
};
