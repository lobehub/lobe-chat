const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: true,
    inlineRequires: true,
  },
});

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.watchFolders = [...config.watchFolders, workspaceRoot];

// Prevent TreeFS cache issues
config.resetCache = true;

// Exclude server-only packages that cause symlink issues in React Native
config.resolver.blockList = [
  // Block the entire observability-otel package and its dependencies
  /packages[/\\]obervability-otel[/\\]/,
  /@opentelemetry[/\\]instrumentation-pg/,
  /@opentelemetry[/\\]instrumentation-http/,
  /@opentelemetry[/\\]auto-instrumentations-node/,
];

module.exports = config;
