module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FFABAB',
          DEFAULT: '#FF8788'
        },
        secondary: {
          light: '#4d9dde',
          DEFAULT: '#0072D0'
        },
        light: {
          DEFAULT: '#FBFBFB'
        },
        background: '#141414'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}
