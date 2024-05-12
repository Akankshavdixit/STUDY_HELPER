/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/*.{html,ejs,js}"],
  theme: {
    extend: {
      backgroundImage: {
        'studykid': "url('./resources/pblbgimg.jpg')",
        
    },
    backgroundSize: {
      '50': '50%',
    },
  },
  plugins: [],
}
}

