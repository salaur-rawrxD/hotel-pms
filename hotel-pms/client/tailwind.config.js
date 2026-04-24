/** @type {import('tailwindcss').Config} */
import forms from "@tailwindcss/forms";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0f1c2e",
          800: "#162336",
          700: "#1e3048",
        },
        teal: {
          DEFAULT: "#1a6b6b",
          light: "#2a9494",
          dark: "#0f4040",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e8d48a",
        },
        slate: {
          DEFAULT: "#3d4454",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [forms],
};
