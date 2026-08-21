/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F5F2",
        concrete: "#E4E1DA",
        seam: "#B9B5AC",
        ash: "#6B675F",
        ink: "#302E2A",
        moss: {
          DEFAULT: "#4B5D45",
          deep: "#34402F",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "2px",
      },
    },
  },
  plugins: [],
};
