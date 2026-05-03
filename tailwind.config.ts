import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'trusty-blue': '#1d65a6',
        'blossom-yellow': '#fcda24',
        'oak-brown': '#51321f',
        'brand-brown': '#281a0c',
        'brand-gold': '#b08a4f',
        'brand-beige': '#fcfbf9',
        'warm-white': '#ffe7b3',
      },
    },
  },
  plugins: [],
} satisfies Config;