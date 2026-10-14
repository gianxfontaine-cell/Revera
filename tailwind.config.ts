import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        primary: "hsl(var(--primary))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        teal: {
          50: "#effaf8",
          100: "#d7f2ed",
          500: "#1c9b88",
          600: "#167d70",
          700: "#14665c",
          900: "#123f3b",
        },
      },
      boxShadow: {
        soft: "0 16px 48px rgba(20, 45, 43, 0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
