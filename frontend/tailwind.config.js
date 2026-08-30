/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0F19",
        glassCard: "rgba(18, 24, 38, 0.85)",
        brandCyan: "#00F0FF",
        brandPurple: "#7000FF",
        brandAmber: "#FFB800",
      }
    },
  },
  plugins: [],
}
