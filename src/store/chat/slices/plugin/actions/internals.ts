/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { ToolNameResolver } from '@lobechat/context-engine';
import { MessageToolCall, ToolsCallingContext } from '@lobechat/types';
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { builtinTools } from '@/tools';
import { Action } from '@/utils/storeDebug';

import { displayMessageSelectors } from '../../message/selectors';

/**
 * Internal utility methods and runtime state management
 * These are building blocks used by other actions
 */
export interface PluginInternalsAction {
  /**
   * Toggle plugin API calling state
   */
  internal_togglePluginApiCalling: (
    loading: boolean,
    id?: string,
    action?: Action,
  ) => AbortController | undefined;

  /**
   * Transform tool calls from runtime format to storage format
   */
  internal_transformToolCalls: (toolCalls: MessageToolCall[]) => any[];

  /**
   * Construct tools calling context for plugin invocation
   */
  internal_constructToolsCallingContext: (id: string) => ToolsCallingContext | undefined;
}

export const pluginInternals: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  PluginInternalsAction
> = (set, get) => ({
  internal_togglePluginApiCalling: (loading, id, action) => {
    return get().internal_toggleLoadingArrays('pluginApiLoadingIds', loading, id, action);
  },

  internal_transformToolCalls: (toolCalls) => {
    const toolNameResolver = new ToolNameResolver();

    // Build manifests map from tool store
    const toolStoreState = useToolStore.getState();
    const manifests: Record<string, LobeChatPluginManifest> = {};

    // Get all installed plugins
    const installedPlugins = pluginSelectors.installedPlugins(toolStoreState);
    for (const plugin of installedPlugins) {
      if (plugin.manifest) {
        manifests[plugin.identifier] = plugin.manifest as LobeChatPluginManifest;
      }
    }

    // Get all builtin tools
    for (const tool of builtinTools) {
      if (tool.manifest) {
        manifests[tool.identifier] = tool.manifest as LobeChatPluginManifest;
      }
    }

    return toolNameResolver.resolve(toolCalls, manifests);
  },

  internal_constructToolsCallingContext: (id: string) => {
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message) return;

    return {
      topicId: message.topicId,
    };
  },
});
