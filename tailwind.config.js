/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './Navigation.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        black: {
          0: '#000000',
          10: '#262626',
          20: '#333333',
          30: '#3d3d3d',
        },
        grey: {
          10: '#d4d2d2',
          20: '#828282',
          30: '#7a7a7a',
        },
      },
    },
  },
  plugins: [],
};
