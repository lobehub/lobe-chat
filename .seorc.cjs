const { defineConfig } = require('@lobehub/seo-cli');

module.exports = defineConfig({
  entry: ['./docs/**/*.mdx'],
  modelName: 'chatgpt-4o-latest',
  experimental: {
    jsonMode: true,
  },
});
