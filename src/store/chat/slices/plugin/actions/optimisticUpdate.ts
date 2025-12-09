/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { ChatMessageError, ChatToolPayload, MessagePluginItem } from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { StateCreator } from 'zustand/vanilla';

import { messageService } from '@/services/message';
import { OptimisticUpdateContext } from '@/store/chat/slices/message/actions/optimisticUpdate';
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
  optimisticUpdatePluginState: (
    id: string,
    value: any,
    context?: OptimisticUpdateContext,
  ) => Promise<void>;

  /**
   * Update plugin arguments with optimistic update
   */
  optimisticUpdatePluginArguments: <T = any>(
    id: string,
    value: T,
    replace?: boolean,
    context?: OptimisticUpdateContext,
  ) => Promise<void>;

  /**
   * Update plugin with optimistic update (generic method for any plugin field)
   */
  optimisticUpdatePlugin: (
    id: string,
    value: Partial<MessagePluginItem>,
    context?: OptimisticUpdateContext,
  ) => Promise<void>;

  /**
   * Add tool to assistant message with optimistic update
   */
  optimisticAddToolToAssistantMessage: (
    id: string,
    tool: ChatToolPayload,
    context?: OptimisticUpdateContext,
  ) => Promise<void>;

  /**
   * Remove tool from assistant message with optimistic update
   */
  optimisticRemoveToolFromAssistantMessage: (
    id: string,
    tool_call_id?: string,
    context?: OptimisticUpdateContext,
  ) => Promise<void>;

  /**
   * Update plugin error with optimistic update
   */
  optimisticUpdatePluginError: (
    id: string,
    error: ChatMessageError,
    context?: OptimisticUpdateContext,
  ) => Promise<void>;

  /**
   * Use the optimistic update value to update the message tools to database
   */
  internal_refreshToUpdateMessageTools: (
    id: string,
    context?: OptimisticUpdateContext,
  ) => Promise<void>;
}

export const pluginOptimisticUpdate: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  PluginOptimisticUpdateAction
> = (set, get) => ({
  optimisticUpdatePluginState: async (id, value, context) => {
    const { replaceMessages, internal_getSessionContext } = get();

    // optimistic update
    get().internal_dispatchMessage(
      { id, type: 'updateMessage', value: { pluginState: value } },
      context,
    );

    const { sessionId, topicId } = internal_getSessionContext(context);

    const result = await messageService.updateMessagePluginState(id, value, {
      sessionId,
      topicId,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages, { sessionId, topicId });
    }
  },

  optimisticUpdatePluginArguments: async (id, value, replace = false, context) => {
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
    get().internal_dispatchMessage(
      { id, type: 'updateMessagePlugin', value: { arguments: JSON.stringify(nextValue) } },
      context,
    );

    // 同样需要更新 assistantMessage 的 pluginArguments
    if (assistantMessage) {
      get().internal_dispatchMessage(
        {
          id: assistantMessage.id,
          type: 'updateMessageTools',
          tool_call_id: toolMessage?.tool_call_id,
          value: { arguments: JSON.stringify(nextValue) },
        },
        context,
      );
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

  optimisticUpdatePlugin: async (id, value, context) => {
    const { replaceMessages, internal_getSessionContext } = get();

    // optimistic update
    get().internal_dispatchMessage(
      {
        id,
        type: 'updateMessagePlugin',
        value,
      },
      context,
    );

    const { sessionId, topicId } = internal_getSessionContext(context);

    const result = await messageService.updateMessagePlugin(id, value, {
      sessionId,
      topicId,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages, { sessionId, topicId });
    }
  },

  optimisticAddToolToAssistantMessage: async (id, tool, context) => {
    const assistantMessage = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!assistantMessage) return;

    const { internal_dispatchMessage, internal_refreshToUpdateMessageTools } = get();
    internal_dispatchMessage(
      {
        type: 'addMessageTool',
        value: tool,
        id: assistantMessage.id,
      },
      context,
    );

    await internal_refreshToUpdateMessageTools(id, context);
  },

  optimisticRemoveToolFromAssistantMessage: async (id, tool_call_id, context) => {
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message || !tool_call_id) return;

    const { internal_dispatchMessage, internal_refreshToUpdateMessageTools } = get();

    // optimistic update
    internal_dispatchMessage({ type: 'deleteMessageTool', tool_call_id, id: message.id }, context);

    // update the message tools
    await internal_refreshToUpdateMessageTools(id, context);
  },

  optimisticUpdatePluginError: async (id, error, context) => {
    const { replaceMessages, internal_getSessionContext } = get();

    get().internal_dispatchMessage({ id, type: 'updateMessage', value: { error } }, context);

    const { sessionId, topicId } = internal_getSessionContext(context);

    const result = await messageService.updateMessage(
      id,
      { error },
      {
        sessionId,
        topicId,
      },
    );
    if (result?.success && result.messages) {
      replaceMessages(result.messages, { sessionId, topicId });
    }
  },

  internal_refreshToUpdateMessageTools: async (id, context) => {
    const { dbMessageSelectors } = await import('../../message/selectors');
    const message = dbMessageSelectors.getDbMessageById(id)(get());
    if (!message || !message.tools) return;

    const { internal_toggleMessageLoading, replaceMessages, internal_getSessionContext } = get();

    const { sessionId, topicId } = internal_getSessionContext(context);

    internal_toggleMessageLoading(true, id);
    const result = await messageService.updateMessage(
      id,
      { tools: message.tools },
      {
        sessionId,
        topicId,
      },
    );
    internal_toggleMessageLoading(false, id);

    if (result?.success && result.messages) {
      replaceMessages(result.messages, { sessionId, topicId });
    }
  },
});
