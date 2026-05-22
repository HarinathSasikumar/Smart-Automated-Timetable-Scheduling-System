/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        indigo: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        cyan: {
          50:  '#ecfeff',
          100: '#cffafe',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        emerald: {
          50:  '#ecfdf5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
      },
      backgroundImage: {
        'gradient-indigo-cyan': 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
        'gradient-card':        'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      },
      boxShadow: {
        'card':      '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover':'0 8px 30px rgba(79,70,229,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        'glow':      '0 0 24px rgba(79,70,229,0.35)',
        'glow-cyan': '0 0 24px rgba(6,182,212,0.35)',
        'sidebar':   '4px 0 24px rgba(79,70,229,0.15)',
      },
      animation: {
        'fade-up':     'fadeUp 0.5s ease-out forwards',
        'fade-in':     'fadeIn 0.4s ease-out forwards',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'slide-right': 'slideRight 0.4s ease-out forwards',
        'shimmer':     'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeUp:     { '0%':{ opacity:0, transform:'translateY(20px)' }, '100%':{ opacity:1, transform:'translateY(0)' } },
        fadeIn:     { '0%':{ opacity:0 }, '100%':{ opacity:1 } },
        slideRight: { '0%':{ opacity:0, transform:'translateX(-12px)' }, '100%':{ opacity:1, transform:'translateX(0)' } },
        shimmer:    { '0%':{ backgroundPosition:'-1000px 0' }, '100%':{ backgroundPosition:'1000px 0' } },
      },
    },
  },
  plugins: [],
}
