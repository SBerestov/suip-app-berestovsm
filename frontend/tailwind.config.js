/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#F2F2F2',
        'black-hover': '#2f2f2f',
        'gray-custom': '#E8E8E8',
        'gray-text': '#515151',
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out",
        fadeOut: "fadeOut 0.5s ease-out 2.5s forwards",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}