const config = require('@lobehub/lint').semanticRelease;

// Remove NPM publishing by excluding "@semantic-release/npm" plugin
// Keep or add other plugins like GitHub Releases
config.plugins = config.plugins.filter((plugin) => plugin !== '@semantic-release/npm');

// Add GitHub only if required
config.plugins.push([
  '@semantic-release/exec',
  {
    prepareCmd: 'npm run workflow:changelog',
  },
]);

// Override GitHub repository URL without modifying package.json
// Make sure @semantic-release/github is present in the plugins
if (!config.plugins.some(plugin => Array.isArray(plugin) ? plugin[0] === '@semantic-release/github' : plugin === '@semantic-release/github')) {
  config.plugins.push([
    '@semantic-release/github',
    {
      repositoryUrl: 'https://github.com/jaworldwideorg/OneJA-Bot.git'
    }
  ]);
} else {
  // Find and update the existing GitHub plugin configuration
  config.plugins = config.plugins.map(plugin => {
    if (Array.isArray(plugin) && plugin[0] === '@semantic-release/github') {
      return [
        '@semantic-release/github',
        {
          ...(plugin[1] || {}),
          repositoryUrl: 'https://github.com/jaworldwideorg/OneJA-Bot.git'
        }
      ];
    }
    return plugin;
  });
}

// Set repository URL in global config
config.repositoryUrl = 'https://github.com/jaworldwideorg/OneJA-Bot.git';

module.exports = config;
