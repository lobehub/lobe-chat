const config = require('@lobehub/lint').stylelint;

module.exports = {
  ...config,
  rules: {
    'custom-property-pattern': null,
    'no-descending-specificity': null,
    ...config.rules,
  },
};
