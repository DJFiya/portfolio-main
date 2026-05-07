/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette — neutral grayscale
        ink: {
          950: '#0a0a0b',
          900: '#111113',
          800: '#1c1c20',
          700: '#2a2a30',
          600: '#3d3d45',
          500: '#5a5a66',
          400: '#7a7a88',
          300: '#a0a0b0',
          200: '#c8c8d8',
          100: '#e8e8f0',
          50:  '#f4f4f8',
        },
        // Accent — blue scale only
        azure: {
          950: '#0d1b3e',
          900: '#0f2358',
          800: '#1a3a7a',
          700: '#1e4fa0',
          600: '#2563c2',
          500: '#3b82f6',
          400: '#60a5fa',
          300: '#93c5fd',
          200: '#bfdbfe',
          100: '#dbeafe',
          50:  '#eff6ff',
        },
        // Page / paper tones
        page: {
          dark: '#f0ede8',
          light: '#faf8f5',
          line: '#e2ddd8',
        },
      },
      fontFamily: {
        rowan:    ['"Rowan"', 'Georgia', 'serif'],
        rosaline: ['"Rosaline"', 'Georgia', 'serif'],
        author:   ['"Author"', 'system-ui', 'sans-serif'],
        mono:     ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
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
