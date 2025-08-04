import type { Config } from "tailwindcss";

export default {
  darkMode: "class", // Certifique-se de que está configurado como 'class'
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        text: "var(--color-text)",
      },
    },
  },
  plugins: [],
} satisfies Config;
