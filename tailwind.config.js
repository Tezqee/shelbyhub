/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        shelby: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        void: {
          DEFAULT: '#080c10',
          50: '#0d1117',
          100: '#161b22',
          200: '#1c2128',
          300: '#21262d',
          400: '#30363d',
          500: '#484f58',
          600: '#6e7681',
          700: '#8b949e',
          800: '#b1bac4',
          900: '#c9d1d9',
          950: '#e6edf3',
        },
      },
      backgroundImage: {
        'grid-pattern': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0h1v40H0zM39 0h1v40h-1zM0 0h40v1H0zM0 39h40v1H0z' fill='%2314b8a610'/%3E%3C/svg%3E")`,
        'noise': `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
        'shelby-gradient': 'linear-gradient(135deg, #042f2e 0%, #080c10 50%, #0d1117 100%)',
        'accent-gradient': 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #14b8a640, 0 0 10px #14b8a620' },
          '100%': { boxShadow: '0 0 20px #14b8a660, 0 0 40px #14b8a630' },
        },
      },
      boxShadow: {
        'shelby': '0 0 20px rgba(20, 184, 166, 0.15), 0 0 60px rgba(20, 184, 166, 0.05)',
        'shelby-lg': '0 0 40px rgba(20, 184, 166, 0.25), 0 0 100px rgba(20, 184, 166, 0.1)',
        'card': '0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
