/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "railway-blue": "#1e40af",
        "railway-red": "#dc2626",
        "railway-gray": "#6b7280",
      },
      fontFamily: {
        korean: ["Noto Sans KR", "sans-serif"],
      },
    },
  },
  plugins: [],
};

