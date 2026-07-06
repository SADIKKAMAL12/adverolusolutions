/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Cairo"', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          DEFAULT: "#ff2d55",
          light: "#ff4f7a",
          soft: "#fff5f7",
          ring: "#ffd6e0"
        }
      }
    }
  },
  plugins: []
};
