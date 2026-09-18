/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: "#10B981",       // 0-50 Emerald
          satisfactory: "#84CC16", // 51-100 Lime
          moderate: "#F59E0B",   // 101-200 Amber
          poor: "#F97316",       // 201-300 Orange
          verypoor: "#EF4444",   // 301-400 Red
          severe: "#7F1D1D"      // 401-500 Maroon
        },
        moes: {
          primary: "#0F3F7A",   // Deep Navy / Scientific Blue
          secondary: "#0284C7", // Bright Ocean Blue
          teal: "#0D9488",      // Environmental Teal
          slate: "#0F172A",
          surface: "#F8FAFC"
        }
      }
    },
  },
  plugins: [],
}
