// craco.config.js
const path = require("path");

module.exports = {
  style: {
    postcss: {
      plugins: [
        require("tailwindcss"),
        require("autoprefixer"),
      ],
    },
  },
  eslint: {
    enable: false,
  },
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  babel: {
    plugins: [],
  },
};
