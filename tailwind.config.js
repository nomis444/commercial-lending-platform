/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          900: '#1a1a1a',
          800: '#2d2d2d',
        },
        orange: {
          500: '#ff6b35',
          600: '#e55a2b',
        },
        electric: {
          500: '#00d084',
          600: '#00b872',
        },
        purple: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        },
      },
    },
  },
  plugins: [],
}

