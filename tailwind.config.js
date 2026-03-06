/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['"Cinzel"', 'serif'],
      },
      colors: {
        gold: '#c9a84c',
        'gold-light': '#e8c96a',
        'tavern-bg': '#0d0700',
        'tavern-dark': '#1a0f00',
        'tavern-mid': '#2a1505',
        'die-ivory': '#f5f0e0',
        'die-pip': '#3d1c00',
      },
    },
  },
  plugins: [],
}

