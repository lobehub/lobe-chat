const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

const workspaceRoot = path.resolve(projectRoot, '../..');

// 1. 监听整个 monorepo 根目录
config.watchFolders = [workspaceRoot];

// 2. 将 monorepo 根目录的 node_modules 添加到解析路径
// Expo 应用需要能找到 'lobe-chat/node_modules'
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. (仅当您在 packages/ 中有 React Native 相关 UI 组件时需要)
// 确保 Metro 不会因为多个 react/react-native 实例而报错
// 通过将它们指向根目录的实例来解决
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => {
      if (name === 'react' || name === 'react-native') {
        return path.join(workspaceRoot, 'node_modules', name);
      }
      return path.join(projectRoot, 'node_modules', name);
    },
  },
);

// 添加 WASM 支持
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'wasm'],
  sourceExts: [...config.resolver.sourceExts, 'mjs'],
};

module.exports = config;
