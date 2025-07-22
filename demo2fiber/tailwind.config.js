import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors from Figma
        base: {
          primary: '#171717',
          'primary-foreground': '#fafafa',
          muted: '#f5f5f5',
          'muted-foreground': '#737373',
          background: '#ffffff',
          foreground: '#0a0a0a',
          border: '#e5e5e5',
          accent: '#171717',
          'accent-foreground': '#171717',
          card: '#ffffff',
          ring: '#a3a3a3',
          input: '#e5e5e5',
          popover: '#ffffff',
        },
        // Chart colors
        chart: {
          1: '#ea580c', // Orange
          2: '#0d9488', // Teal
        },
        // Neutral palette
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      fontFamily: {
        sans: ['Geist', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
      },
      fontWeight: {
        normal: 400,
        medium: 500,
      },
      spacing: {
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '8px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
        md: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}