import { ConfigPlugin, withAndroidStyles } from '@expo/config-plugins';

const withAndroidTransparentNavigation: ConfigPlugin = (config) => {
  return withAndroidStyles(config, (config) => {
    // Get the styles object
    const styles = config.modResults;

    // Find the AppTheme style
    const appThemeStyle = styles?.resources?.style?.find(
      (style: any) => style.$.name === 'AppTheme',
    );

    if (appThemeStyle && appThemeStyle.item) {
      // Check if the translucent navigation item already exists
      const existingItem = appThemeStyle.item.find(
        (item: any) => item.$.name === 'android:windowTranslucentNavigation',
      );

      if (!existingItem) {
        // Add the new item
        appThemeStyle.item.push({
          $: { name: 'android:windowTranslucentNavigation' },
          _: 'true',
        });
      }
    }

    return config;
  });
};

export default withAndroidTransparentNavigation;
