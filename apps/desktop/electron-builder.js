const dotenv = require('dotenv');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');

dotenv.config();

const packageJSON = require('./package.json');

const channel = process.env.UPDATE_CHANNEL;
const arch = os.arch();

console.log(`🚄 Build Version ${packageJSON.version}, Channel: ${channel}`);
console.log(`🏗️ Building for architecture: ${arch}`);

const isNightly = channel === 'nightly';
const isBeta = packageJSON.name.includes('beta');

// 根据版本类型确定协议 scheme
const getProtocolScheme = () => {
  if (isNightly) return 'lobehub-nightly';
  if (isBeta) return 'lobehub-beta';

  return 'lobehub';
};

const protocolScheme = getProtocolScheme();

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
  asarUnpack: [
    // https://github.com/electron-userland/electron-builder/issues/9001#issuecomment-2778802044
    '**/node_modules/sharp/**/*',
    '**/node_modules/@img/**/*',
  ],
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
    target: ['AppImage', 'snap', 'deb', 'rpm', 'tar.gz'],
  },
  mac: {
    compression: 'maximum',
    entitlementsInherit: 'build/entitlements.mac.plist',
    extendInfo: {
      CFBundleURLTypes: [
        {
          CFBundleURLName: 'LobeHub Protocol',
          CFBundleURLSchemes: [protocolScheme],
        },
      ],
      NSCameraUsageDescription: "Application requests access to the device's camera.",
      NSDocumentsFolderUsageDescription:
        "Application requests access to the user's Documents folder.",
      NSDownloadsFolderUsageDescription:
        "Application requests access to the user's Downloads folder.",
      NSMicrophoneUsageDescription: "Application requests access to the device's microphone.",
    },
    gatekeeperAssess: false,
    hardenedRuntime: true,
    notarize: true,
    target:
      // 降低构建时间，nightly 只打 dmg
      // 根据当前机器架构只构建对应架构的包
      isNightly
        ? [{ arch: [arch === 'arm64' ? 'arm64' : 'x64'], target: 'dmg' }]
        : [
            { arch: [arch === 'arm64' ? 'arm64' : 'x64'], target: 'dmg' },
            { arch: [arch === 'arm64' ? 'arm64' : 'x64'], target: 'zip' },
          ],
  },
  npmRebuild: true,
  nsis: {
    allowToChangeInstallationDirectory: true,
    artifactName: '${productName}-${version}-setup.${ext}',
    createDesktopShortcut: 'always',
    installerHeader: './build/nsis-header.bmp',
    installerSidebar: './build/nsis-sidebar.bmp',
    oneClick: false,
    shortcutName: '${productName}',
    uninstallDisplayName: '${productName}',
    uninstallerSidebar: './build/nsis-sidebar.bmp',
  },
  protocols: [
    {
      name: 'LobeHub Protocol',
      schemes: [protocolScheme],
    },
  ],
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

// macOS latest-mac.yml 重命名现在由 GitHub Actions 工作流处理，而不是 electron-builder 钩子

module.exports = config;
