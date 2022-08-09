/** @type {import('tailwindcss').Config} */
module.exports = {
  // PurgeCSS will not remove the css already specified in the content array.
  // It will remove the rest
  content: ['./src/**/*.{html,ts}'],
  // classes that should be included in the bundle regardless if they appear in the app
  safelist: ['bg-blue-400', 'bg-green-400', 'bg-red-400'], 
  theme: {
    extend: {},
  },
  plugins: [],
}
