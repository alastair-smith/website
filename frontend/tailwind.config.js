/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
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
    },
  },
  plugins: [],
};
