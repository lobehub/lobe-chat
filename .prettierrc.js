module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'never',
  endOfLine: 'lf',
  overrides: [{ files: '.prettierrc', options: { parser: 'json' } }],
  plugins: [require.resolve('prettier-plugin-packagejson'), require.resolve('prettier-plugin-organize-imports')],
  pluginSearchDirs: false,
};
