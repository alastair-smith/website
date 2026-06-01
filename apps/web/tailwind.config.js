/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        day: '#F8F4EF',
        night: '#0F0F0F',
        grey: '#BFBFBF',
        jet: '#2D2E2E',
        'royal-blue': '#243C5A',
        orange: '#E98C3F',
        red: '#FF1C1C',
        crimson: '#b22222',
      },
      fontFamily: {
        mulish: ['Mulish', 'sans-serif'],
      },
      spacing: {
        tiny: '0.125rem',
        small: '0.5rem',
        medium: '1rem',
        large: '1.5rem',
        huge: '3rem',
        gigantic: '6rem',
      },
      maxWidth: {
        thin: '16rem',
        form: '80ch',
        reading: '120ch',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'reverse-spin-slow': 'reverse-spin 3s linear infinite',
      },
      keyframes: {
        'reverse-spin': {
          from: {
            transform: 'rotate(360deg)',
          },
        },
      },
    },
  },
  plugins: [],
};
