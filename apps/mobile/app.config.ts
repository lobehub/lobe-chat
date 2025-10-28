import { ConfigContext, ExpoConfig } from 'expo/config';

import { version } from './package.json';

/**
 * Expo 配置
 * 使用 TypeScript 提供类型安全和自动补全
 * @see https://docs.expo.dev/workflow/configuration/
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  android: {
    adaptiveIcon: {
      backgroundColor: '#000',
      backgroundImage: './assets/images/icon-android-background.png',
      foregroundImage: './assets/images/icon-android-foreground.png',
      monochromeImage: './assets/images/icon-android-foreground.png',
    },
    icon: './assets/images/icon-android.png',
    package: 'com.lobehub.app',
  },
  androidNavigationBar: {
    barStyle: 'light-content',
  },
  androidStatusBar: {
    barStyle: 'light-content',
  },
  experiments: {
    // @ts-ignore
    appDir: './src/app',
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'f02d6f4f-e042-4c95-ba0d-ac06bb474ef0',
    },
    router: {
      origin: false,
    },
  },
  icon: './assets/images/icon.png',

  ios: {
    appleTeamId: '4684H589ZU',
    bundleIdentifier: 'com.lobehub.app',
    icon: './assets/images/ios.icon',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      // 仅支持 iPhone
      UIDeviceFamily: [1],
    },
    // 声明不支持平板
    supportsTablet: false,
    userInterfaceStyle: 'automatic',
  },
  name: 'LobeHub',
  newArchEnabled: true,
  orientation: 'portrait',
  owner: 'lobehub',
  plugins: [
    'expo-router',
    'expo-video',
    ['react-native-edge-to-edge', { android: { enforceNavigationBarContrast: false } }],
    [
      'expo-notifications',
      {
        color: '#000',
        icon: './assets/images/icon-android-notification.png',
      },
    ],
    './plugins/withFbjniFix',
    // 禁用 Android 平板支持
    './plugins/disable-tablet',
    [
      'expo-splash-screen',
      {
        android: {
          backgroundColor: '#f5f5f5',
          dark: {
            backgroundColor: '#000',
            image: './assets/images/splash-icon.png',
            imageWidth: 150,
          },
          image: './assets/images/splash-icon.png',
          imageWidth: 150,
        },
        ios: {
          backgroundColor: '#f5f5f5',
          dark: {
            backgroundColor: '#000',
            enableFullScreenImage_legacy: true,
            image: './assets/images/splash-dark.png',
            resizeMode: 'cover',
          },
          enableFullScreenImage_legacy: true,
          image: './assets/images/splash.png',
          resizeMode: 'cover',
        },
      },
    ],
    [
      'expo-font',
      {
        android: {
          fonts: [
            {
              fontDefinitions: [
                {
                  path: './assets/fonts/Hack-Regular.ttf',
                  weight: 400,
                },
                {
                  path: './assets/fonts/Hack-Bold.ttf',
                  weight: 700,
                },
                {
                  path: './assets/fonts/Hack-Italic.ttf',
                  style: 'italic',
                  weight: 400,
                },
                {
                  path: './assets/fonts/Hack-BoldItalic.ttf',
                  style: 'italic',
                  weight: 700,
                },
              ],
              fontFamily: 'Hack',
            },
            {
              fontDefinitions: [
                {
                  path: './assets/fonts/HarmonyOS_Sans_SC_Regular.ttf',
                  weight: 400,
                },
                {
                  path: './assets/fonts/HarmonyOS_Sans_SC_Medium.ttf',
                  weight: 500,
                },
                {
                  path: './assets/fonts/HarmonyOS_Sans_SC_Bold.ttf',
                  weight: 700,
                },
              ],
              fontFamily: 'HarmonyOS-Sans-SC',
            },
          ],
        },
        fonts: [
          './assets/fonts/Hack-Regular.ttf',
          './assets/fonts/Hack-Bold.ttf',
          './assets/fonts/Hack-Italic.ttf',
          './assets/fonts/Hack-BoldItalic.ttf',
          './assets/fonts/HarmonyOS_Sans_SC_Regular.ttf',
          './assets/fonts/HarmonyOS_Sans_SC_Medium.ttf',
          './assets/fonts/HarmonyOS_Sans_SC_Bold.ttf',
        ],
        ios: {
          fonts: [
            './assets/fonts/Hack-Regular.ttf',
            './assets/fonts/Hack-Bold.ttf',
            './assets/fonts/Hack-Italic.ttf',
            './assets/fonts/Hack-BoldItalic.ttf',
            './assets/fonts/HarmonyOS_Sans_SC_Regular.ttf',
            './assets/fonts/HarmonyOS_Sans_SC_Medium.ttf',
            './assets/fonts/HarmonyOS_Sans_SC_Bold.ttf',
          ],
        },
      },
    ],
    'expo-secure-store',
    'expo-localization',
  ],
  runtimeVersion: {
    policy: 'appVersion',
  },
  scheme: 'com.lobehub.app',
  slug: 'lobe-chat-react-native',
  updates: {
    url: 'https://u.expo.dev/f02d6f4f-e042-4c95-ba0d-ac06bb474ef0',
  },
  userInterfaceStyle: 'automatic',
  version: version,
  web: {
    bundler: 'metro',
    favicon: './assets/images/favicon.ico',
    output: 'static',
  },
});
