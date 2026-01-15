/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#166534',
        'primary-dark': '#14532d',
        secondary: '#84cc16',
        'secondary-hover': '#a3e635',
      },
      borderRadius: {
        'sm': '0.375rem', // 6px
        'md': '0.5rem',   // 8px
        'lg': '0.75rem',  // 12px
        'xl': '1rem',     // 16px
      }
    },
  },
  plugins: [],
}
