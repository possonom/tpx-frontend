// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      colors: {
        fluent: {
          primary: "#0078d4",
          secondary: "#2b88d8",
          success: "#107c10",
          warning: "#797673",
          error: "#d13438",
        },
      },
    },
  },
  plugins: [],
};

export default config;
