const { colors } = require('./colors.js')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('daisyui')
  ]
}
