/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { ChatMessageError, ChatToolPayload, MessagePluginItem } from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { StateCreator } from 'zustand/vanilla';

import { messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';
import { merge } from '@/utils/merge';
import { safeParseJSON } from '@/utils/safeParseJSON';

import { displayMessageSelectors } from '../../message/selectors';

/**
 * Optimistic update operations for plugin-related data
 * All methods follow the pattern: update frontend first, then persist to database
 */
export interface PluginOptimisticUpdateAction {
  /**
   * Update plugin state with optimistic update
   */
  optimisticUpdatePluginState: (id: string, value: any) => Promise<void>;

  /**
   * Update plugin arguments with optimistic update
   */
  optimisticUpdatePluginArguments: <T = any>(
    id: string,
    value: T,
    replace?: boolean,
  ) => Promise<void>;

  /**
   * Update plugin with optimistic update (generic method for any plugin field)
   */
  optimisticUpdatePlugin: (id: string, value: Partial<MessagePluginItem>) => Promise<void>;

  /**
   * Add tool to assistant message with optimistic update
   */
  optimisticAddToolToAssistantMessage: (id: string, tool: ChatToolPayload) => Promise<void>;

  /**
   * Remove tool from assistant message with optimistic update
   */
  optimisticRemoveToolFromAssistantMessage: (id: string, tool_call_id?: string) => Promise<void>;

  /**
   * Update plugin error with optimistic update
   */
  optimisticUpdatePluginError: (id: string, error: ChatMessageError) => Promise<void>;

  /**
   * Use the optimistic update value to update the message tools to database
   */
  internal_refreshToUpdateMessageTools: (id: string) => Promise<void>;
}

export const pluginOptimisticUpdate: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  PluginOptimisticUpdateAction
> = (set, get) => ({
  optimisticUpdatePluginState: async (id, value) => {
    const { replaceMessages } = get();

    // optimistic update
    get().internal_dispatchMessage({ id, type: 'updateMessage', value: { pluginState: value } });

    const result = await messageService.updateMessagePluginState(id, value, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  optimisticUpdatePluginArguments: async (id, value, replace = false) => {
    const { refreshMessages } = get();
    const toolMessage = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!toolMessage || !toolMessage?.tool_call_id) return;

    let assistantMessage = displayMessageSelectors.getDisplayMessageById(
      toolMessage?.parentId || '',
    )(get());

    const prevArguments = toolMessage?.plugin?.arguments;
    const prevJson = safeParseJSON(prevArguments || '');
    const nextValue = replace ? (value as any) : merge(prevJson || {}, value);
    if (isEqual(prevJson, nextValue)) return;

    // optimistic update
    get().internal_dispatchMessage({
      id,
      type: 'updateMessagePlugin',
      value: { arguments: JSON.stringify(nextValue) },
    });

    // 同样需要更新 assistantMessage 的 pluginArguments
    if (assistantMessage) {
      get().internal_dispatchMessage({
        id: assistantMessage.id,
        type: 'updateMessageTools',
        tool_call_id: toolMessage?.tool_call_id,
        value: { arguments: JSON.stringify(nextValue) },
      });
      assistantMessage = displayMessageSelectors.getDisplayMessageById(assistantMessage?.id)(get());
    }

    const updateAssistantMessage = async () => {
      if (!assistantMessage) return;
      await messageService.updateMessage(assistantMessage!.id, {
        tools: assistantMessage?.tools,
      });
    };

    await Promise.all([
      messageService.updateMessagePluginArguments(id, nextValue),
      updateAssistantMessage(),
    ]);

    await refreshMessages();
  },

  optimisticUpdatePlugin: async (id, value) => {
    const { replaceMessages } = get();

    // optimistic update
    get().internal_dispatchMessage({
      id,
      type: 'updateMessagePlugin',
      value,
    });

    const result = await messageService.updateMessagePlugin(id, value, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  optimisticAddToolToAssistantMessage: async (id, tool) => {
    const assistantMessage = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!assistantMessage) return;

    const { internal_dispatchMessage, internal_refreshToUpdateMessageTools } = get();
    internal_dispatchMessage({
      type: 'addMessageTool',
      value: tool,
      id: assistantMessage.id,
    });

    await internal_refreshToUpdateMessageTools(id);
  },

  optimisticRemoveToolFromAssistantMessage: async (id, tool_call_id) => {
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message || !tool_call_id) return;

    const { internal_dispatchMessage, internal_refreshToUpdateMessageTools } = get();

    // optimistic update
    internal_dispatchMessage({ type: 'deleteMessageTool', tool_call_id, id: message.id });

    // update the message tools
    await internal_refreshToUpdateMessageTools(id);
  },

  optimisticUpdatePluginError: async (id, error) => {
    const { replaceMessages } = get();

    get().internal_dispatchMessage({ id, type: 'updateMessage', value: { error } });
    const result = await messageService.updateMessage(
      id,
      { error },
      {
        sessionId: get().activeId,
        topicId: get().activeTopicId,
      },
    );
    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  internal_refreshToUpdateMessageTools: async (id) => {
    const { dbMessageSelectors } = await import('../../message/selectors');
    const message = dbMessageSelectors.getDbMessageById(id)(get());
    if (!message || !message.tools) return;

    const { internal_toggleMessageLoading, replaceMessages } = get();

    internal_toggleMessageLoading(true, id);
    const result = await messageService.updateMessage(
      id,
      { tools: message.tools },
      {
        sessionId: get().activeId,
        topicId: get().activeTopicId,
      },
    );
    internal_toggleMessageLoading(false, id);

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },
});
