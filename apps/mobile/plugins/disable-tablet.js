const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withDisableTablet(config) {
  return withAndroidManifest(config, (cfg) => {
    const m = cfg.modResults.manifest;

    // 1) 仍保留 supports-screens（你现在已经有了）
    if (!m['supports-screens']) m['supports-screens'] = [{ $: {} }];
    const s = m['supports-screens'][0].$;
    s['android:smallScreens'] = 'true';
    s['android:normalScreens'] = 'true';
    s['android:largeScreens'] = 'false';
    s['android:xlargeScreens'] = 'false';
    s['android:anyDensity'] = 'true';

    // 2) 追加 compatible-screens，只白名单 small/normal
    const densities = ['ldpi', 'mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
    const sizes = ['small', 'normal']; // 不包含 large/xlarge
    m['compatible-screens'] = [
      {
        screen: sizes.flatMap((size) =>
          densities.map((dpi) => ({
            $: { 'android:screenDensity': dpi, 'android:screenSize': size },
          })),
        ),
      },
    ];

    return cfg;
  });
};
