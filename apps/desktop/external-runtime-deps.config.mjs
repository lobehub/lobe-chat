import {
  copyModulesToSource,
  getDependenciesForModules,
  getModuleFilesConfig,
} from './module-deps.config.mjs';

/**
 * Non-native modules intentionally externalized from the main-process bundle.
 *
 * These modules are not native dependencies. They stay external because their
 * process-level side effects must be owned by one Node runtime module instance.
 */
/**
 * Plugins the bundled DeepSeek Harness runtime loads BY NAME from its YAML
 * composition (`packages/heterogeneous-agents/src/spawn/dshRuntimeConfig.ts`).
 * No static import points at them, so the bundler cannot discover them and
 * they are not dependencies of `dsh-app-boot` — each must ship in
 * `node_modules` explicitly, with its dependency closure.
 */
export const dshRuntimePluginModules = [
  '@deepseek-ai/dsh-agent-spine-demo',
  '@deepseek-ai/dsh-bash-local',
  '@deepseek-ai/dsh-compaction-basic',
  '@deepseek-ai/dsh-fs-local',
  '@deepseek-ai/dsh-fs-observation-policy',
  '@deepseek-ai/dsh-llm-deepseek',
  '@deepseek-ai/dsh-sdk-jsonrpc-server',
  '@deepseek-ai/dsh-session-checkpoint-policy',
  '@deepseek-ai/dsh-session-persistence-jsonl',
  '@deepseek-ai/dsh-subagent',
  '@deepseek-ai/dsh-subagent-spawn-in-process',
  '@deepseek-ai/dsh-subprocess-local',
  '@deepseek-ai/dsh-token-meter',
  '@deepseek-ai/dsh-tool-fs',
  '@deepseek-ai/dsh-tool-subagent',
  '@deepseek-ai/dsh-tool-todo',
];

export const externalRuntimeModules = [
  '@deepseek-ai/dsh-app-boot',
  ...dshRuntimePluginModules,
  'electron-log',
  'font-list',
];

/**
 * Get all dependencies for runtime external modules.
 * @returns {string[]}
 */
export function getAllExternalRuntimeDependencies() {
  return getDependenciesForModules(externalRuntimeModules);
}

/**
 * Generate files config objects for non-native runtime external modules.
 * @returns {Array<{from: string, to: string, filter: string[]}>}
 */
export function getExternalRuntimeModulesFilesConfig() {
  return getModuleFilesConfig(externalRuntimeModules);
}

export async function copyExternalRuntimeModulesToSource() {
  await copyModulesToSource(externalRuntimeModules, 'runtime external module');
}
