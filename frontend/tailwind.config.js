/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Deep Navy Primary
        primary: {
          DEFAULT: '#002147',
          50: '#e6eaef',
          100: '#ccd6de',
          200: '#99adbd',
          300: '#66859d',
          400: '#335c7c',
          500: '#002147',
          600: '#001b39',
          700: '#00152b',
          800: '#000f1d',
          900: '#00090f',
        },
        // Slate Gray Secondary
        secondary: {
          DEFAULT: '#64748B',
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
        },
        // Gold Accent
        accent: {
          DEFAULT: '#D4AF37',
          50: '#fdf9eb',
          100: '#fbf3d7',
          200: '#f7e7af',
          300: '#f3db87',
          400: '#efcf5f',
          500: '#D4AF37',
          600: '#aa8c2c',
          700: '#806921',
          800: '#554616',
          900: '#2b230b',
        },
        // Background colors
        background: {
          DEFAULT: '#FFFFFF',
          light: '#F8FAFC',
          dark: '#1E293B',
        },
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
        'premium': '0 10px 40px rgba(0, 33, 71, 0.15)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'glass': '12px',
      },
      backdropBlur: {
        'glass': '10px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
