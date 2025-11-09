import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CLB Brand Colors
        primary: "#1a73e8",
        secondary: "#5f6368",
        success: "#34a853",
        danger: "#ea4335",
        warning: "#fbbc04",
      },
    },
  },
  plugins: [],
};
export default config;
