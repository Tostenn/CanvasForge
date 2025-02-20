/** @type {import('tailwindcss').Config} */
module.exports = {
  // content: ['./templates/**/*.html','./static/js/**/*.js'],
  purge: {
    content: ['./templates/**/*.html','./static/js/**/*.js'],
    options: {
      safelist: [
        'bg-red-500', 'bg-blue-500', 'bg-green-500',
        'text-red-100', 'text-blue-100', 'text-green-100',
        'hover:text-red-300', 'hover:text-blue-300', 'hover:text-green-300',
        "overflow-hidden"
      ],
    },
  },
  theme: {
    extend: {},
  },
  plugins: [],
}

