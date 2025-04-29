const dotenv = require('dotenv');

dotenv.config();

const packageJSON = require('./package.json');

const channel = process.env.UPDATE_CHANNEL;

console.log(`🚄 Build Version ${packageJSON.version}, Channel: ${channel}`);

const isNightly = channel === 'nightly';
const isBeta = channel === 'beta';
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration
 */
const config = {
  appId: isNightly
    ? 'com.lobehub.lobehub-desktop-nightly'
    : isBeta
      ? 'com.lobehub.lobehub-desktop-beta'
      : 'com.lobehub.lobehub-desktop',
  appImage: {
    artifactName: '${productName}-${version}.${ext}',
  },
  asar: true,
  detectUpdateChannel: true,
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
    '!resources/locales',
    '!dist/next/docs',
    '!dist/next/packages',
    '!dist/next/.next/server/app/sitemap',
    '!dist/next/.next/static/media',
  ],
  generateUpdatesFilesForAllChannels: true,
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
    target:
      // 降低构建时间，nightly 只打 arm64
      isNightly
        ? [{ arch: ['arm64'], target: 'dmg' }]
        : [
            { arch: ['x64', 'arm64'], target: 'dmg' },
            { arch: ['x64', 'arm64'], target: 'zip' },
          ],
  },
  npmRebuild: true,
  nsis: {
    artifactName: '${productName}-${version}-setup.${ext}',
    createDesktopShortcut: 'always',
    // allowToChangeInstallationDirectory: true,
    // oneClick: false,
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
  },
  publish: [
    {
      owner: 'lobehub',
      provider: 'github',
      repo: 'lobe-chat',
    },
  ],
  win: {
    executableName: 'LobeHub',
  },
};

module.exports = config;
