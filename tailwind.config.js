/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        cg: {
          black: "#0a0705",
          "dark-brown": "#1a0f08",
          "brown": "#2d1810",
          "brown-light": "#3d2317",
          "orange": "#ff6b1a",
          "orange-bright": "#ff8c42",
          "yellow": "#ffb627",
          "yellow-soft": "#ffd166",
          white: "#f5f0eb",
          "white-dim": "#c4b8a8",
          "border": "#3d2317",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
        "slide-down": "slideDown 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255,107,26,0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(255,107,26,0.6)" },
        },
      },
    },
  },
  plugins: [],
};
