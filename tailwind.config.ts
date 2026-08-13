import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic iOS tokens (resolve via CSS vars, auto light/dark)
        tint: "var(--tint)",
        label: "var(--label)",
        "label-2": "var(--label-2)",
        "label-3": "var(--label-3)",
        card: "var(--card)",
        "card-2": "var(--card-2)",
        grouped: "var(--grouped)",
        separator: "var(--separator)",
        fill: "var(--fill)",
        "tint-bg": "var(--tint-bg)",
        red: "var(--red)",
        "red-bg": "var(--red-bg)",
      },
      fontFamily: {
        sans: [
          "var(--font-serif)",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        serif: [
          "var(--font-serif)",
          "ui-serif",
          "Georgia",
          "Cambria",
          "serif",
        ],
      },
      keyframes: {
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "sheet-up": "sheet-up 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
