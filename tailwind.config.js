/**
 * 🎨 COLOUR PALETTE — edit these to re-theme the whole site.
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#FFFCF6', 100: '#FAF4EA', 200: '#F2E6D3', 300: '#E8D5B8' },
        // 'blush' is the soft accent: now hardwood-court tans and basketball orange (was pink).
        blush: { 50: '#FDF6EE', 100: '#F9EBDA', 200: '#F1D8BA', 300: '#E7BE90', 400: '#E0995C', 500: '#D2732F' },
        berry: { 300: '#C25B7A', 400: '#A8395A', 500: '#8E2A4A', 600: '#7A1F3D', 700: '#5E1630', 800: '#45101F' },
        honey: { 200: '#FBE3A6', 300: '#F5CD6E', 400: '#E9B44C' },
        sage: { 200: '#CFE6CC', 300: '#A9D2A6', 400: '#7FB685', 500: '#5E9A66' },
        ball: { 300: '#F6B57A', 400: '#EE8A3C', 500: '#D96E22', seam: '#5A2A12' },
        cocoa: { 300: '#C8B6B0', 400: '#A8948E', 500: '#7D6964' },
      },
      fontFamily: {
        display: ['"Barlow Semi Condensed"', 'system-ui', 'sans-serif'],
        body: ['"Barlow Semi Condensed"', 'system-ui', 'sans-serif'],
        sport: ['"Bebas Neue"', 'Impact', '"Arial Narrow"', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(122, 31, 61, 0.25)',
        card: '0 2px 0 rgba(122,31,61,0.08), 0 18px 40px -18px rgba(122, 31, 61, 0.35)',
        pop: '0 4px 0 #5E1630',
        'pop-soft': '0 4px 0 #E0995C',
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        wiggle: { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-6px)' },
          '40%,80%': { transform: 'translateX(6px)' },
        },
        drift: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.9' },
          '90%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-110vh) rotate(25deg)', opacity: '0' },
        },
        flicker: {
          '0%,100%': { transform: 'scaleY(1) rotate(-2deg)' },
          '50%': { transform: 'scaleY(1.12) rotate(2deg)' },
        },
        bob: { '0%,100%': { transform: 'translateY(0) rotate(-4deg)' }, '50%': { transform: 'translateY(-4px) rotate(4deg)' } },
        popIn: { '0%': { transform: 'scale(0)' }, '70%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: {
        floaty: 'floaty 3s ease-in-out infinite',
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        flicker: 'flicker 0.25s ease-in-out infinite',
        bob: 'bob 2.4s ease-in-out infinite',
        popIn: 'popIn 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
