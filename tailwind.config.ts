import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Inter var",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif"
        ]
      },
      colors: {
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae3",
          300: "#b0bacd",
          400: "#8592b0",
          500: "#64749a",
          600: "#505d7e",
          700: "#414c66",
          800: "#2b3346",
          900: "#1a1f2e",
          950: "#0b0e16"
        },
        brand: {
          50: "#eef1ff",
          100: "#e0e5ff",
          200: "#c6cdff",
          300: "#a3aaff",
          400: "#837ffe",
          500: "#6c56f8",
          600: "#5c3bec",
          700: "#4f2ed4",
          800: "#4227ab",
          900: "#392887",
          950: "#221a4d"
        },
        success: {
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669"
        },
        gold: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b"
        }
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(108, 86, 248, 0.45)",
        "glow-success": "0 0 60px -12px rgba(16, 185, 129, 0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)"
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.06)", opacity: "1" }
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "pulse-slow": "pulse-slow 2.6s ease-in-out infinite",
        "float-y": "float-y 6s ease-in-out infinite",
        "fade-up": "fade-up 0.35s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
