import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
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
        'background-light': '#f5f7f8',
        'background-dark': {
          DEFAULT: '#0f1115',
          light: '#f5f7f8',
          dark: '#0f1115',
        },
        'surface-dark': '#1a1d23',
        'border-dark': '#2d333d',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      backgroundColor: {
        'dark-mode': '#0f1115',
      },
    },
  },
  plugins: [],
}
export default config

