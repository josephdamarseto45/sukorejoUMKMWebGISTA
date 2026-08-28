/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F1EEDF",       // rice-paper cream, greenish undertone
        ink: "#1E2A22",         // near-black forest ink
        forest: {
          DEFAULT: "#2F4A3C",
          light: "#3F614F",
          dark: "#1C2E24"
        },
        gold: {
          DEFAULT: "#C89B3C",
          light: "#E0BE6E",
          dark: "#9C7526"
        },
        clay: {
          DEFAULT: "#8B4A2B",
          light: "#A8613D"
        },
        river: {
          DEFAULT: "#3E6E64",
          light: "#5A8C81"
        }
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-worksans)", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"]
      },
      backgroundImage: {
        "contour": "repeating-linear-gradient(transparent, transparent 38px, rgba(47,74,60,0.05) 39px)"
      }
    }
  },
  plugins: []
};
