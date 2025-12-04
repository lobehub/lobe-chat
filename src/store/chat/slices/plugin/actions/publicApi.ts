/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { ChatToolPayload, UIChatMessage } from '@lobechat/types';
import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { displayMessageSelectors } from '../../message/selectors';

/**
 * Public API for plugin operations
 * These methods are called by UI components or other business scenarios
 */
export interface PluginPublicApiAction {
  /**
   * Fill plugin message content and optionally trigger AI message
   */
  fillPluginMessageContent: (
    id: string,
    content: string,
    triggerAiMessage?: boolean,
  ) => Promise<void>;

  /**
   * Re-invoke a tool message (retry failed plugin call)
   */
  reInvokeToolMessage: (id: string) => Promise<void>;

  /**
   * Summary plugin content using AI
   */
  summaryPluginContent: (id: string) => Promise<void>;

  /**
   * Invoke different type of plugin based on payload type
   * This is the unified entry point for plugin invocation
   */
  internal_invokeDifferentTypePlugin: (id: string, payload: ChatToolPayload) => Promise<any>;
}

export const pluginPublicApi: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  PluginPublicApiAction
> = (set, get) => ({
  fillPluginMessageContent: async (id, content, triggerAiMessage) => {
    const { triggerAIMessage, optimisticUpdateMessageContent } = get();

    await optimisticUpdateMessageContent(id, content);

    if (triggerAiMessage) await triggerAIMessage({ parentId: id });
  },

  reInvokeToolMessage: async (id) => {
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message || message.role !== 'tool' || !message.plugin) return;

    // Get operationId from messageOperationMap
    const operationId = get().messageOperationMap[id];
    const context = operationId ? { operationId } : undefined;

    // if there is error content, then clear the error
    if (!!message.pluginError) {
      get().optimisticUpdateMessagePluginError(id, null, context);
    }

    const payload: ChatToolPayload = { ...message.plugin, id: message.tool_call_id! };

    await get().internal_invokeDifferentTypePlugin(id, payload);
  },

  summaryPluginContent: async (id) => {
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message || message.role !== 'tool') return;

    await get().internal_execAgentRuntime({
      messages: [
        {
          role: 'assistant',
          content: '作为一名总结专家，请结合以上系统提示词，将以下内容进行总结：',
        },
        {
          ...message,
          content: message.content,
          role: 'assistant',
          name: undefined,
          tool_call_id: undefined,
        },
      ] as UIChatMessage[],
      parentMessageId: message.id,
      parentMessageType: 'assistant',
    });
  },

  internal_invokeDifferentTypePlugin: async (id, payload) => {
    switch (payload.type) {
      case 'standalone': {
        return await get().invokeStandaloneTypePlugin(id, payload);
      }

      case 'markdown': {
        return await get().invokeMarkdownTypePlugin(id, payload);
      }

      case 'builtin': {
        return await get().invokeBuiltinTool(id, payload);
      }

      // @ts-ignore
      case 'mcp': {
        return await get().invokeMCPTypePlugin(id, payload);
      }

      default: {
        return await get().invokeDefaultTypePlugin(id, payload);
      }
    }
  },
});
