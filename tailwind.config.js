/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette — warm neutral grayscale
        ink: {
          950: '#111014',
          900: '#18181c',
          800: '#222226',
          700: '#2e2e34',
          600: '#42424a',
          500: '#5c5c66',
          400: '#787884',
          300: '#9c9ca8',
          200: '#c4c4ce',
          100: '#e6e6ec',
          50:  '#f3f3f6',
        },
        // Accent — desaturated slate-blue (calm on paper and on dark UI)
        azure: {
          950: '#14191d',
          900: '#1a2228',
          800: '#243038',
          700: '#2f3d47',
          600: '#3d4f5c',
          500: '#556b78',
          400: '#708290',
          300: '#8f9faa',
          200: '#b4c0c9',
          100: '#dbe3e8',
          50:  '#eef2f5',
        },
        // Page / paper tones
        page: {
          dark: '#efeae4',
          light: '#faf7f2',
          line: '#e0d9d2',
        },
      },
      fontFamily: {
        rowan:    ['"Rowan"', 'Georgia', 'serif'],
        rosaline: ['"Rosaline"', 'Georgia', 'serif'],
        author:   ['"Author"', 'system-ui', 'sans-serif'],
        // No separate mono file in /public/fonts — Author reads cleanly at small sizes
        mono:     ['"Author"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        book:  '8px 8px 24px rgba(0,0,0,0.55), 2px 2px 8px rgba(0,0,0,0.35)',
        page:  '4px 0 12px rgba(0,0,0,0.25)',
        prop:  '3px 3px 10px rgba(0,0,0,0.4)',
      },
      perspective: {
        book: '1200px',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-1.5deg)' },
          '50%':       { transform: 'rotate(1.5deg)'  },
        },
      },
      animation: {
        sway: 'sway 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
