/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bloom: {
          bg: '#F5EFF8',
          secondary: '#D7C4E8',
          mauve: '#B48AB8',
          dusty: '#765477',
          plum: '#342C40',
          // Harmonious soft accents
          light: '#FAF6FC',
          card: '#FFFFFF',
          border: '#E8DCEF',
          surface: '#EFE6F3',
          success: '#4A8B71',
          warning: '#D9822B',
          softPink: '#F9D8DE',
          coral: '#E26D7D'
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'system-ui', 'sans-serif'],
        display: ['Quicksand', 'Nunito', 'sans-serif']
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem'
      },
      boxShadow: {
        bloom: '0 8px 30px rgba(118, 84, 119, 0.08)',
        bloomHover: '0 12px 35px rgba(118, 84, 119, 0.16)',
        card: '0 4px 20px rgba(52, 44, 64, 0.05)'
      }
    },
  },
  plugins: [],
}
