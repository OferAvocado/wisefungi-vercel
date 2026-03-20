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
        nature: {
          50: '#f4f7f4',
          100: '#e5eee5',
          200: '#cadaea',
          300: '#a3c0a4',
          400: '#76a079',
          500: '#538356',
          600: '#3e6840',
          700: '#335335',
          800: '#2b422d',
          900: '#243725',
          950: '#121e13',
        },
      },
    },
  },
  plugins: [],
}
