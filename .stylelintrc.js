module.exports = {
  extends: ['stylelint-config-recommended', 'stylelint-config-clean-order'],
  files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
  plugins: ['stylelint-order'],
  customSyntax: 'postcss-styled-syntax',
  rules: {
    'no-empty-source': null,
    'no-invalid-double-slash-comments': null,
  },
};
