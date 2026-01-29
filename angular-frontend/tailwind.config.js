// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores extraídos de la imagen
        'accent': '#FF6B00', // Naranja Vibrante (Hero BG, Botones, Logo)
        'dark': '#053B50',   // Azul Oscuro/Teal (Footer BG, Títulos)
        'light': '#F9F9F9',  // Fondo de secciones claras
      },
      fontFamily: {
        'sans': ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
