/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, // <-- Ini yang diubah
    autoprefixer: {},
  },
};
export default config;