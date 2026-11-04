/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#b8d8ff',
          500: '#2b7fff',
          600: '#1d68e4', // The exact electric blue from screenshot
          700: '#1552b8',
          800: '#103a6c', // The exact deep royal navy for table headers
          900: '#0c2445',
          950: '#0a1626', // The exact midnight navy for sidebar
        },
        navy: {
          950: '#060d17',
          900: '#0a192f',
          850: '#0e203c',
          800: '#132849',
          700: '#1b355e',
          600: '#26487e',
        },
        charcoal: {
          950: '#0b0d10',
          900: '#12151a',
          850: '#181c22',
          800: '#1e232a',
          700: '#282f39',
          600: '#343c49',
          500: '#434c5b',
        },
        gold: {
          50: '#faf7ed',
          100: '#f4ecd0',
          200: '#ead9a1',
          300: '#dec26e',
          400: '#d4af37', // Champagne Gold
          500: '#b89224',
          600: '#94721a',
          700: '#715517',
        },
        copper: {
          50: '#fdf6f2',
          100: '#faebd5',
          200: '#f3d2b7',
          300: '#e7b18e',
          400: '#b87333', // Copper Accent
          500: '#a35f24',
          600: '#844b1b',
        },
        warm: {
          50: '#fdfdfc',
          100: '#f8f8f6',
          200: '#efefe9',
          300: '#e3e3dc',
        },
        brandRed: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['Consolas', 'SFMono-Regular', 'Menlo', 'Monaco', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
