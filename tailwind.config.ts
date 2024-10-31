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
        background: "var(--background)",
        foreground: "var(--foreground)",
        "atmos-primary-green": "#0bd790",
        "atmos-secondary-teal": "#0dbbac",
        "atmos-accent-blue": "#0ea7bf",
        "atmos-bg-black": "#0e1111",
        "atmos-modal-bg": "#0d1010",
        "atmos-grey-text": "#7b818a",
        "atmos-navbar-bg": "#040404",
      },
      boxShadow: {
        even: "0 0 15px 5px rgba(13, 187, 172, 0.7)",
      },
    },
  },
  plugins: [],
};
export default config;
