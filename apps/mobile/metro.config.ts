import { getDefaultConfig } from 'expo/metro-config';
import path from 'node:path';

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// @ts-expect-error - Metro config properties are readonly in types but mutable at runtime
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: true,
    inlineRequires: true,
  },
});

// @ts-expect-error - Metro config properties are readonly in types but mutable at runtime
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// @ts-expect-error - Metro config properties are readonly in types but mutable at runtime
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// Prevent TreeFS cache issues
// @ts-expect-error - Metro config properties are readonly in types but mutable at runtime
config.resetCache = true;

// Exclude server-only packages that cause symlink issues in React Native
// @ts-expect-error - Metro config properties are readonly in types but mutable at runtime
config.resolver.blockList = [
  // Block the entire observability-otel package and its dependencies
  /packages[/\\]obervability-otel[/\\]/,
  /@opentelemetry[/\\]instrumentation-pg/,
  /@opentelemetry[/\\]instrumentation-http/,
  /@opentelemetry[/\\]auto-instrumentations-node/,
];

// Custom resolver to handle React Native incompatible modules
// @ts-expect-error - Metro config properties are readonly in types but mutable at runtime
const defaultResolver = config.resolver.resolveRequest;
// @ts-expect-error - Metro config properties are readonly in types but mutable at runtime
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block node:stream imports in React Native
  // Note: Even though node:stream is used in conditional code (if typeof window === 'undefined'),
  // Metro still tries to resolve it during static analysis. We mock it as an empty module
  // since the runtime will never execute the Node.js code path in React Native (window exists).
  if (moduleName === 'node:stream' && platform !== 'web') {
    return {
      type: 'empty',
    };
  }

  // Use default resolver for other modules
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
