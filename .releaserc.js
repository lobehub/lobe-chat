const release = require('@lobehub/lint').semanticRelease;

module.exports = {
  ...release,
  plugins: [
    ...release.plugins,
    [
      '@codedependant/semantic-release-docker',
      {
        dockerImage: 'lobe-chat',
      },
    ],
  ],
};
