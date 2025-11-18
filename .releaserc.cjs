const config = require('@lobehub/lint').semanticRelease;

config.branches = [
  'main',
  {
    name: 'next',
    prerelease: true,
  },
];

config.plugins.push([
  '@semantic-release/exec',
  {
    prepareCmd: 'npm run workflow:changelog',
  },
]);

module.exports = config;
