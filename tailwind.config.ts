import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'selector',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0d6cf2',
        'primary-accent': '#0d6cf2e6',
        'bg-dark': '#0f1115',
        'surface-dark': '#1a1d23',
        'border-dark': '#2d333d',
        testcolor: '#ff00ff',
      },
    },
  },
}

export default config

