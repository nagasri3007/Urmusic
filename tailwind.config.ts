import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        surface: {
          DEFAULT: "#1a1a2e",
          light: "#222240",
          hover: "#2a2a4a",
        },
        primary: {
          DEFAULT: "#e040fb",
          light: "#ea80fc",
          dark: "#aa00ff",
        },
        accent: {
          DEFAULT: "#7c4dff",
          light: "#b388ff",
          warm: "#ff6e40",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a0a0b8",
          muted: "#6b6b80",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        "hero-gradient":
          "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(26,26,46,0.8), rgba(34,34,64,0.6))",
        "player-gradient":
          "linear-gradient(180deg, rgba(15,15,15,0.95), rgba(26,26,46,0.98))",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.3)",
        glow: "0 0 30px rgba(224,64,251,0.15)",
        "glow-accent": "0 0 30px rgba(124,77,255,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(224,64,251,0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(224,64,251,0.3)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
