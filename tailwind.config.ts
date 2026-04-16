import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "var(--surface-0)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)"
        },
        accent: {
          cyan: "var(--accent-cyan)",
          blue: "var(--accent-blue)",
          pink: "var(--accent-pink)",
          lime: "var(--accent-lime)",
          gold: "var(--accent-gold)"
        },
        ink: {
          primary: "var(--ink-primary)",
          muted: "var(--ink-muted)"
        }
      },
      boxShadow: {
        glow: "0 12px 32px rgba(18, 27, 38, 0.08), 0 2px 8px rgba(18, 27, 38, 0.04)",
        neon: "0 8px 20px rgba(31, 52, 74, 0.16)"
      },
      backgroundImage: {
        hero:
          "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(244,246,242,0.96))"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseLine: "pulseLine 2.4s ease-in-out infinite"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      }
    }
  },
  plugins: []
};

export default config;
