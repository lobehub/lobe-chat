/**
 * Tools Engineering - Unified tools processing using ToolsEngine
 */
import { ToolsEngine } from '@lobechat/context-engine';
import type { PluginEnableChecker } from '@lobechat/context-engine';
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { getToolStoreState } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import { isCanUseFC } from './helper';

/**
 * Tools engine configuration options
 */
export interface ToolsEngineConfig {
  /** Additional manifests to include beyond the standard ones */
  additionalManifests?: LobeChatPluginManifest[];
  /** Custom enable checker for plugins */
  enableChecker?: PluginEnableChecker;
}

/**
 * Initialize ToolsEngine with current manifest schemas and configurable options
 */
export const createToolsEngine = (config: ToolsEngineConfig = {}): ToolsEngine => {
  const { enableChecker, additionalManifests = [] } = config;

  const toolStoreState = getToolStoreState();

  // Get all available plugin manifests
  const pluginManifests = pluginSelectors.installedPluginManifestList(toolStoreState);

  // Get all builtin tool manifests
  const builtinManifests = toolStoreState.builtinTools.map(
    (tool) => tool.manifest as LobeChatPluginManifest,
  );

  // Combine all manifests
  const allManifests = [...pluginManifests, ...builtinManifests, ...additionalManifests];

  return new ToolsEngine({
    enableChecker,
    functionCallChecker: isCanUseFC,
    manifestSchemas: allManifests,
  });
};
