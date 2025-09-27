import { ToolsEngine } from '@lobechat/context-engine';
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { getToolStoreState } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { WorkingModel } from '@/types/agent';
import { ChatCompletionTool } from '@/types/openai/chat';

import { isCanUseFC } from './helper';

/**
 * Tools Engineering - Unified tools processing using ToolsEngine
 */

/**
 * Initialize ToolsEngine with current manifest schemas
 */
export const createToolsEngine = (): ToolsEngine => {
  const toolStoreState = getToolStoreState();

  // Get all available plugin manifests
  const pluginManifests = pluginSelectors.installedPluginManifestList(toolStoreState);

  // Get all builtin tool manifests
  const builtinManifests = toolStoreState.builtinTools.map(
    (tool) => tool.manifest as LobeChatPluginManifest,
  );

  // Combine all manifests
  const allManifests = [...pluginManifests, ...builtinManifests];

  return new ToolsEngine({ functionCallChecker: isCanUseFC, manifestSchemas: allManifests });
};

/**
 * Generate tools array for chat completion
 * Replaces ChatService.prepareTools method
 */
export const generateTools = (
  pluginIds: string[],
  { model, provider }: WorkingModel,
): ChatCompletionTool[] | undefined => {
  const toolsEngine = createToolsEngine();

  return toolsEngine.generateTools({ model, pluginIds, provider: provider! });
};
