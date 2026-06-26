import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        // Deep-space backdrop
        void: {
          DEFAULT: "#05060f",
          800: "#080a18",
          700: "#0c0f22",
        },
        // Electric-cyan accent that glows
        accent: {
          DEFAULT: "#38e8ff",
          soft: "#7af3ff",
          deep: "#0fb6d6",
        },
        // Warm magenta secondary, used sparingly
        ember: {
          DEFAULT: "#ff5db1",
          soft: "#ff8fcb",
        },
      },
      boxShadow: {
        glass: "0 8px 40px -12px rgba(0, 0, 0, 0.55)",
        glow: "0 0 24px -2px rgba(56, 232, 255, 0.55)",
        "glow-lg": "0 0 60px -8px rgba(56, 232, 255, 0.6)",
        ember: "0 0 28px -4px rgba(255, 93, 177, 0.55)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        drift: {
          "0%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(2%, -1%, 0)" },
          "100%": { transform: "translate3d(0,0,0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease forwards",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        drift: "drift 24s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
