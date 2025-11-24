const config = require('@lobehub/lint').semanticRelease;

config.plugins.push([
  '@semantic-release/exec',
  {
    prepareCmd: 'npm run workflow:changelog',
  },
]);

module.exports = config;
