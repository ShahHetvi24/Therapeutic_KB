/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f1f8",
          100: "#c2e0f3",
          200: "#99c9e6",
          300: "#6fb2d9",
          400: "#4a9fd0",
          500: "#01609d", // main primary blue
          600: "#014f82",
          700: "#013e66",
          800: "#012d4a",
          900: "#001c2e",
        },
        navy: {
          50: "#f3f6fa",
          100: "#e1e8f3",
          200: "#b8c7e0",
          300: "#8ea6cd",
          400: "#5c7bb2",
          500: "#2a5097", // main navy
          600: "#23437e",
          700: "#1c3665",
          800: "#15294c",
          900: "#0e1c33",
        },
      },
    },
  },
  plugins: [],
};
