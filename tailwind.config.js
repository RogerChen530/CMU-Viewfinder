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
      // 動畫一律只動 opacity / transform；退場比進場短，ease-in 退、ease-out 進。
      // fill-mode 用 both：進場前停在起始幀、退場後停在結束幀，避免 unmount 前閃回原狀。
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "lb-in": {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "lb-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.98)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
        "fade-out": "fade-out 150ms ease-in both",
        "lb-in": "lb-in 200ms ease-out both",
        "lb-out": "lb-out 150ms ease-in both",
      },
    },
  },
  plugins: [],
};
