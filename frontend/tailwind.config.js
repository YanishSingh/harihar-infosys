/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        black: '#000000',
        primary: '#CC0000',
        gray: {
          light: '#D9D9D9',          // for subtle borders/backgrounds
          DEFAULT: '#666666',        // standard text/icons
          25: '#66666640'            // 25% opacity (for timestamps, overlays)
        },
        white: '#FFFFFF'
      },
      borderRadius: {
        lg: '1rem',    // cards, panels
        xl: '1.5rem'   // buttons, modals
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.05)',
        toolbar: '0 1px 4px rgba(0, 0, 0, 0.1)'
      }
    },
  },
  plugins: [],
}
