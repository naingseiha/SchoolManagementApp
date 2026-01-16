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
        'koulen': ['"Koulen"', 'sans-serif'],                         // H2, Sidebar - Bold/Headers
        'battambang': ['"Battambang"', '"Khmer OS Battambang"', 'sans-serif'], // Body text
        // English Fonts
        'poppins': ['"Poppins"', 'sans-serif'],
        'inter': ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in-down': 'slide-in-down 0.3s ease-out',
        'toast-progress': 'toast-progress linear forwards',
      },
      keyframes: {
        'slide-in-down': {
          '0%': { transform: 'translate(-50%, -100%)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
        'toast-progress': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
    },
  },
  plugins: [],
}
export default config
