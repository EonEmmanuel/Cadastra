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
        camgreen: {
          DEFAULT: "#007A3D",
          light: "#00A854",
          dark: "#005229",
        },
        camred: {
          DEFAULT: "#CE1126",
          light: "#E53E3E",
          dark: "#9B111E",
        },
        camyellow: {
          DEFAULT: "#FCD116",
          light: "#FFE066",
          dark: "#D4AF37",
        },
      },
    },
  },
  plugins: [],
};

export default config;
