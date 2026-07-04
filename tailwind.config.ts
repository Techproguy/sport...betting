import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#0F0F0F',
        card: '#151515',
        elevated: '#1C1C1C',
        border: '#2A2A2A',
        primary: {
          DEFAULT: '#00D66F',
          foreground: '#04150C',
          muted: 'rgba(0,214,111,0.12)',
        },
        success: '#00D66F',
        warning: '#FFC107',
        danger: '#FF4D4F',
        info: '#3B82F6',
        foreground: '#FFFFFF',
        secondary: '#A0A0A0',
        muted: '#6B6B6B',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        lg: '14px',
        md: '10px',
        sm: '8px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0,214,111,0.35), 0 8px 40px -12px rgba(0,214,111,0.45)',
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 40px -20px rgba(0,0,0,0.9)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-live': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'odds-up': {
          '0%': { color: '#00D66F', background: 'rgba(0,214,111,0.18)' },
          '100%': { color: 'inherit', background: 'transparent' },
        },
        'odds-down': {
          '0%': { color: '#FF4D4F', background: 'rgba(255,77,79,0.18)' },
          '100%': { color: 'inherit', background: 'transparent' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-live': 'pulse-live 1.4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        'odds-up': 'odds-up 1.2s ease-out',
        'odds-down': 'odds-down 1.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
