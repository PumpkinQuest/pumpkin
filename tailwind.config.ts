import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pumpkin: {
          bg:      "#09090b", // zinc-950
          surface: "#18181b", // zinc-900
          border:  "#27272a", // zinc-800
          orange:  "#fb923c", // orange-400 — основной акцент
          "orange-dim": "#ea580c", // orange-600 — hover/active
          text:    "#fafafa", // zinc-50
          muted:   "#71717a", // zinc-500
        },
      },
    },
  },
  plugins: [],
};

export default config;
