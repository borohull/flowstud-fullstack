/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        arcadebright: {
          "primary":           "#0057e7",
          "primary-content":   "#ffffff",
          "secondary":         "#ff3355",
          "secondary-content": "#ffffff",
          "accent":            "#ffcc00",
          "accent-content":    "#1a1a1a",
          "neutral":           "#1a1a1a",
          "neutral-content":   "#ffffff",
          "base-100":          "#ffffff",
          "base-200":          "#f0f4ff",
          "base-300":          "#dde5ff",
          "base-content":      "#1a1a1a",
          "info":              "#00aaff",
          "success":           "#00bb55",
          "warning":           "#ffaa00",
          "error":             "#ff3355",
        },
      },
    ],
  },
}
