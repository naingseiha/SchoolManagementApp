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
      colors: {
        // Stunity Brand Colors
        stunity: {
          primary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          accent: {
            50: '#fff1f2',
            100: '#ffe4e6',
            200: '#fecdd3',
            300: '#fda4af',
            400: '#fb7185',
            500: '#ff6b6b',
            600: '#f43f5e',
            700: '#e11d48',
            800: '#be123c',
            900: '#9f1239',
          },
          knowledge: '#4A90E2',
          practice: '#7ED321',
          theory: '#9013FE',
          collaboration: '#FF9500',
          achievement: '#FFD700',
        },
      },
      backgroundImage: {
        'gradient-stunity': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-knowledge': 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
        'gradient-practice': 'linear-gradient(135deg, #7ED321 0%, #5FA016 100%)',
        'gradient-achievement': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'gradient-card': 'linear-gradient(to bottom right, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
        'gradient-feed': 'linear-gradient(180deg, #F8F9FE 0%, #FFFFFF 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px rgba(102, 126, 234, 0.05), 0 10px 20px rgba(118, 75, 162, 0.08)',
        'card-hover': '0 8px 12px rgba(102, 126, 234, 0.08), 0 16px 32px rgba(118, 75, 162, 0.12)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-blue': '0 0 20px rgba(74, 144, 226, 0.3)',
        'glow-green': '0 0 20px rgba(126, 211, 33, 0.3)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'slide-in-down': 'slide-in-down 0.3s ease-out',
        'toast-progress': 'toast-progress linear forwards',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'bounce-soft': 'bounce-soft 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'heart-beat': 'heart-beat 0.5s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
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
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.7' },
          '100%': { transform: 'scale(1.2)', opacity: '0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.3)' },
          '50%': { transform: 'scale(1.1)' },
          '75%': { transform: 'scale(1.2)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
