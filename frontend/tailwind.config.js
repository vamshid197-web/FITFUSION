/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#171717",      // Near-black luxury charcoal
          DEFAULT: "#1F2937",   // Deep charcoal
          accent: "#A67C1E",    // Bespoke tailor gold / bronze
          accentHover: "#8C6817",
          accentLight: "#FBF7EE", // Soft champagne/cream tint
          cream: "#FAF9F6",     // Off-white canvas
          surface: "#FFFFFF",   // Pure white for cards
          border: "#E5E7EB",    // Subtle light border
          muted: "#6B7280",     // Neutral secondary gray
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
