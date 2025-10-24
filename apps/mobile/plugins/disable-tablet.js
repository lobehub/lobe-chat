// plugins/disable-tablet.js
module.exports = function withDisableTablet(config) {
  config.android = config.android || {};
  config.android.manifest = config.android.manifest || {};

  config.android.manifest.supportsScreens = {
    anyDensity: true,
    largeScreens: false,
    normalScreens: true,
    smallScreens: true,
    xlargeScreens: false,
  };

  return config;
};
