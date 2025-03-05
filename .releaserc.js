const config = require('@lobehub/lint').semanticRelease;

// Remove NPM publishing by excluding "@semantic-release/npm" plugin
// Add GitHub Releases plugin if not already included
config.plugins.push(
  [
    '@semantic-release/exec',
    {
      prepareCmd: 'npm run workflow:changelog',
    },
  ],
  '@semantic-release/github', // Ensure GitHub releases are enabled
);

module.exports = config;
