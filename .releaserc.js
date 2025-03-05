const config = require('@lobehub/lint').semanticRelease;

// Remove NPM publishing by excluding "@semantic-release/npm" plugin
// Keep or add other plugins like GitHub Releases
config.plugins = config.plugins.filter((plugin) => plugin !== '@semantic-release/npm');

// Add GitHub only if required
config.plugins.push(
  [
    '@semantic-release/exec',
    {
      prepareCmd: 'npm run workflow:changelog',
    },
  ],
  '@semantic-release/github', // Ensure GitHub releases plugin is here
);

module.exports = config;
