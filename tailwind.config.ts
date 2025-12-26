import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Khmer Fonts
        'moul': ['"Moul"', '"Khmer OS Muol Light"', 'serif'],         // H1 - Display/Title
        'bokor': ['"Bokor"', '"Khmer OS Bokor"', 'cursive'],          // H2 - Subtitle
        'koulen': ['"Koulen"', 'sans-serif'],                         // Sidebar
        'battambang': ['"Battambang"', '"Khmer OS Battambang"', 'sans-serif'], // Body text
        // English Fonts
        'poppins': ['"Poppins"', 'sans-serif'],
        'inter': ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
