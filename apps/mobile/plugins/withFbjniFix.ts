import { ConfigPlugin, withAppBuildGradle } from '@expo/config-plugins';

const FBJNI_FORCE_BLOCK = `
configurations.all {
    resolutionStrategy {
        force "com.facebook.fbjni:fbjni:0.7.0"
    }
}
`;

const START_TAG = '// @generated begin withFbjniFix';
const END_TAG = '// @generated end withFbjniFix';

const withFbjniFix: ConfigPlugin = (config) => {
  return withAppBuildGradle(config, (cfg) => {
    const contents = cfg.modResults.contents;
    if (!contents.includes('com.facebook.fbjni:fbjni:0.7.0')) {
      cfg.modResults.contents = `${contents}\n\n${START_TAG}\n${FBJNI_FORCE_BLOCK}\n${END_TAG}\n`;
    }
    return cfg;
  });
};

export default withFbjniFix;
