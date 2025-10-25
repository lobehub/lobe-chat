// plugins/disable-tablet.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withDisableTablet(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults?.manifest;
    if (!manifest) return cfg;

    // 若没有 <supports-screens/> 节点则创建
    if (!manifest['supports-screens']) {
      manifest['supports-screens'] = [{ $: {} }];
    }

    // 取到属性对象并写入我们想要的值
    const attrs = manifest['supports-screens'][0].$;
    attrs['android:smallScreens'] = 'true';
    attrs['android:normalScreens'] = 'true';
    attrs['android:largeScreens'] = 'false';
    attrs['android:xlargeScreens'] = 'false';
    attrs['android:anyDensity'] = 'true';

    return cfg;
  });
};
