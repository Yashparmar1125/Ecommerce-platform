/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        background: '#FFFFFF',
        soft: '#EDEDED',
        neutral: {
          50: '#FAFAFA',
          100: '#EDEDED',
          200: '#E0E0E0',
          300: '#D1D1D1',
          400: '#B8B8B8',
          500: '#9E9E9E',
          600: '#808080',
          700: '#666666',
          800: '#4A4A4A',
          900: '#333333',
        },
        accent: {
          warm: '#D4C5B9',
          muted: '#E8E3DF',
        },
        error: '#8B4513',
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Neue Montreal', 'Satoshi', 'system-ui', 'sans-serif'],
        // This fixes "The font-brand class does not exist"
        brand: ['Neue Montreal', 'Satoshi', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        // This allows you to use "tracking-brand"
        brand: '0.15em',
      },
      borderRadius: {
        DEFAULT: '0px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(10, 10, 10, 0.05)',
        medium: '0 2px 8px rgba(10, 10, 10, 0.08)',
      },
    },
  },
  plugins: [],
}