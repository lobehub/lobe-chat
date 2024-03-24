const { defineConfig } = require('@lobehub/seo-cli');

module.exports = defineConfig({
  entry: ['./docs/**/*.mdx'],
  modelName: 'gpt-3.5-turbo-1106',
  tagStringify: true,
  experimental: {
    jsonMode: true,
  },
});
