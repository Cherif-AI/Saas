/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#0F2D52', light: '#1A4A7A', dark: '#081C35' },
        accent:   { DEFAULT: '#E8A020', light: '#F0B840', dark: '#C07010' },
        success:  { DEFAULT: '#1A7A4A', light: '#22C55E' },
        danger:   { DEFAULT: '#CC2200', light: '#F87171' },
        surface:  { DEFAULT: '#F4F2EE', dark: '#E8E4DC' },
        ink:      { DEFAULT: '#18181B', muted: '#6B6457', faint: '#A8A098' },
      },
      fontFamily: {
        sans:  ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card:     '0 1px 3px rgba(15,45,82,0.06), 0 4px 16px rgba(15,45,82,0.06)',
        elevated: '0 8px 30px rgba(15,45,82,0.12), 0 2px 8px rgba(15,45,82,0.06)',
        glow:     '0 0 20px rgba(15,45,82,0.15)',
      },
      borderRadius: {
        xl:   '12px',
        '2xl':'16px',
        '3xl':'24px',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease',
        'slide-up':   'slideUp 0.25s ease',
        'slide-in':   'fadeSlideIn 0.2s ease',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    }
  },
  plugins: []
}
