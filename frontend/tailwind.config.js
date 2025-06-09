module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      keyframes: {
        'pulse-border': {
          '0%, 100%': { boxShadow: '0 0 0 0 #5DEBD7' },
          '50%': { boxShadow: '0 0 16px 4px #5DEBD7' },
        },
        'audio-bar': {
          '0%, 100%': { height: '0.5rem' },
          '50%': { height: '2rem' },
        },
        'sweep-horizontal': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
      },
      animation: {
        'pulse-border': 'pulse-border 2s infinite',
        'audio-bar': 'audio-bar 1s infinite',
        'sweep-horizontal': 'sweep-horizontal 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}; 