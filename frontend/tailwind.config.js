/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          400: "#5c8bff",
          500: "#3366ff",
          600: "#254edb",
          700: "#1c3cad",
        },
      },
    },
  },
  plugins: [],
};
