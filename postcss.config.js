// @filename postcss.config.js
module.exports = {
  plugins: {
    '@unocss/postcss': {
      // Optional
      content: ['**/*.{html,js,ts,jsx,tsx}'],
    },
  },
};
