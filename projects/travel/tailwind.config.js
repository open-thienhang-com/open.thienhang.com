/** @type {import('tailwindcss').Config} */
export default {
  content: ['./projects/travel/src/**/*.{html,ts}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        neo: {
          bg: '#FFFDF5',
          fg: '#000000',
          accent: '#FF6B6B',
          secondary: '#FFD93D',
          muted: '#C4B5FD',
        },
      },
      boxShadow: {
        'neo-sm': '4px 4px 0px 0px #000',
        'neo-md': '8px 8px 0px 0px #000',
        'neo-lg': '12px 12px 0px 0px #000',
        'neo-xl': '16px 16px 0px 0px #000',
        'neo-sm-white': '4px 4px 0px 0px #fff',
        'neo-md-white': '8px 8px 0px 0px #fff',
        'neo-lg-white': '12px 12px 0px 0px #fff',
      },
      borderRadius: {
        none: '0px',
      },
      keyframes: {
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 10s linear infinite',
      },
    },
  },
  plugins: [],
};
