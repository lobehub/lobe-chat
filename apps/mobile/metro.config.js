const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// --- Ultimate Monorepo Configuration ---

// 2. Let Metro know where to resolve packages from.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@types': path.resolve(__dirname, '../../packages/types/src'),
};

config.watchFolders = [
  ...config.watchFolders,
  workspaceRoot,
  path.resolve(__dirname, '../../packages/types/src'),
];

// 3. Enable experimental symlinks support for pnpm.
// This is the most crucial part for pnpm-based monorepos,
// allowing Metro to correctly resolve files from outside the project root.
// config.resolver.unstable_enableSymlinks = true;

// 4. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`.
// This is highly recommended for monorepos to prevent resolving to wrong modules.
// config.resolver.disableHierarchicalLookup = true;

module.exports = config;
