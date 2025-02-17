/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration
 */
const config = {
  appId: 'com.lobehub.lobehub-desktop',
  appImage: {
    artifactName: '${productName}-${version}.${ext}',
  },
  asar: false,
  // TODO: 研究下怎么样可以做成 asar 的模式
  // asar: { smartUnpack: false },
  // asarUnpack: ['dist/next'],
  directories: {
    buildResources: 'build',
    output: 'release',
  },
  dmg: {
    artifactName: '${productName}-${version}-${arch}.${ext}',
  },
  electronDownload: {
    mirror: 'https://npmmirror.com/mirrors/electron/',
  },
  files: [
    'dist',
    'resources',
    '!dist/next/docs',
    '!dist/next/packages',
    '!dist/next/.next/server/app/sitemap',
    '!dist/next/.next/static/media',
  ],
  linux: {
    category: 'Utility',
    maintainer: 'electronjs.org',
    target: ['AppImage', 'snap', 'deb'],
  },
  mac: {
    compression: 'maximum',
    entitlementsInherit: 'build/entitlements.mac.plist',
    extendInfo: [
      { NSCameraUsageDescription: "Application requests access to the device's camera." },
      { NSMicrophoneUsageDescription: "Application requests access to the device's microphone." },
      {
        NSDocumentsFolderUsageDescription:
          "Application requests access to the user's Documents folder.",
      },
      {
        NSDownloadsFolderUsageDescription:
          "Application requests access to the user's Downloads folder.",
      },
    ],
    gatekeeperAssess: false,
    hardenedRuntime: true,
    notarize: true,
    target: [{ arch: ['x64', 'arm64'], target: 'dmg' }],
  },
  npmRebuild: true,
  nsis: {
    artifactName: '${productName}-${version}-setup.${ext}',
    createDesktopShortcut: 'always',
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
  },
  productName: 'LobeHub',
  publish: {
    provider: 'generic',
    url: 'https://example.com/auto-updates',
  },
  win: {
    executableName: 'LobeHub-app',
  },
};

export default config;
