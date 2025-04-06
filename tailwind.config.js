/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      },
      colors: {
        // Primary blue color - #3d5a80
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        // Secondary light blue - #98c1d9
        secondary: {
          300: 'var(--color-secondary-300)',
          500: 'var(--color-secondary-500)',
          700: 'var(--color-secondary-700)',
        },
        // Accent colors from the image
        accent: {
          light: 'var(--color-accent-light)', // #e0fbfc - Very light blue
          warm: 'var(--color-accent-warm)',   // #ee6c4d - Orange
          dark: 'var(--color-accent-dark)',   // #293241 - Very dark blue
        },
        // Direct hex colors from the image
        palette: {
          navy: '#3d5a80',
          blue: '#98c1d9',
          lightblue: '#e0fbfc',
          orange: '#ee6c4d',
          darknavy: '#293241',
        },
      },
    },
  },
  plugins: [],
} 