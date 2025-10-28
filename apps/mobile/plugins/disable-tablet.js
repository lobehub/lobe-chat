const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withDisableTablet(config) {
  return withAndroidManifest(config, (cfg) => {
    const m = cfg.modResults.manifest;

    // 1) 软限制：不适配大平板
    if (!m['supports-screens']) m['supports-screens'] = [{ $: {} }];
    const s = m['supports-screens'][0].$;
    s['android:smallScreens'] = 'true';
    s['android:normalScreens'] = 'true';
    // 允许 large：防止把“大屏手机”误杀；仍禁 xlarge（平板）
    s['android:largeScreens'] = 'true';
    s['android:xlargeScreens'] = 'false';
    s['android:anyDensity'] = 'true';

    // 2) 硬限制：白名单仅手机屏幕（small/normal/large），密度含常见“非标准值”
    // 说明：
    // - Play 要求精确匹配 density；不少机型会报 560/600 等“非标准”值
    // - 同时保留标准桶名（ldpi..xxxhdpi），兼容更多机型
    const sizes = ['small', 'normal', 'large']; // 不包含 xlarge
    const densities = [
      'ldpi',
      'mdpi',
      'tvdpi',
      'hdpi',
      'xhdpi',
      'xxhdpi',
      'xxxhdpi',
      560,
      600, // 常见“非标准”密度，覆盖 Redmi/部分三星
    ];

    m['compatible-screens'] = [
      {
        screen: sizes.flatMap((size) =>
          densities.map((dpi) => ({
            $: {
              'android:screenDensity': String(dpi),
              'android:screenSize': size,
            },
          })),
        ),
      },
    ];

    return cfg;
  });
};
