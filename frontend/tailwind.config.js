/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        day: '#F8F4EF',
        night: '#0F0F0F',
        jet: '#2D2E2E',
        'royal-blue': '#243C5A',
        orange: '#E98C3F',
        red: '#FF1C1C',
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
