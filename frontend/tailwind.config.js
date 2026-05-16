/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        filaha: {
          green: "#2d8a4f",
          earth: "#a87d4a",
          sky: "#3b82f6",
          dry: "#dc2626",
          wet: "#0284c7",
          wait: "#f59e0b",
        },
      },
      fontFamily: {
        arabic: ['"Noto Sans Arabic"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
