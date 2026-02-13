import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1f4d7a",
          light: "#2d6da8",
          muted: "#eaf3fb"
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
