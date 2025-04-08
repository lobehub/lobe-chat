/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration
 */
const config = {
  appId: 'com.lobehub.lobehub-desktop',
  appImage: {
    artifactName: '${productName}-${version}.${ext}',
  },
  asar: true,
  // asarUnpack: [
  //   'dist/next/.next/**/*',
  //   // 'dist/next/node_modules/**/*',
  //   // 'dist/next/public/**/*'
  // ],
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
  generateUpdatesFilesForAllChannels: true,
  linux: {
    category: 'Utility',
    maintainer: 'electronjs.org',
    // publish: ['github'],
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
    publish: ['github'],
    target: [{ arch: ['x64', 'arm64'], target: 'dmg' }],
  },
  npmRebuild: true,
  nsis: {
    allowToChangeInstallationDirectory: true,
    artifactName: '${productName}-${version}-setup.${ext}',
    createDesktopShortcut: 'always',
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
  },
  publish: [
    {
      owner: 'lobehub',
      provider: 'github',
      releaseType: 'release',
      repo: 'lobe-chat',
    },
  ],
  win: {
    executableName: 'LobeHub-app',
    // publish: ['github'],
  },
};

export default config;
