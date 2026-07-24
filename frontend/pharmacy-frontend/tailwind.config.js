/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Segoe UI', 'sans-serif'],
        body: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0e5f5a',
          dark: '#0a4844',
          light: '#e2f0ee',
        },
        amber: {
          DEFAULT: '#d98e28',
          light: '#fbecd4',
        },
      },
    },
  },
  plugins: [],
};
