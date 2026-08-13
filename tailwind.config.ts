import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft rose / pink "Us" palette
        rose: {
          50: "#fff5f7",
          100: "#ffe4ec",
          200: "#ffc9d9",
          300: "#ffa3c0",
          400: "#ff6fa0",
          500: "#ff4d8d",
          600: "#f02d74",
          700: "#c81f5c",
          800: "#9c1948",
          900: "#7a1739",
        },
        cream: "#fff9fb",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.25rem",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(240, 45, 116, 0.12), inset 0 1px 0 rgba(255,255,255,0.5)",
        "glass-lg": "0 20px 60px rgba(240, 45, 116, 0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
        soft: "0 4px 20px rgba(0,0,0,0.06)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "pop-in": "pop-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
