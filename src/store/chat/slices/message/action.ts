/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import {
  ChatErrorType,
  ChatImageItem,
  ChatMessageError,
  ChatMessagePluginError,
  CreateMessageParams,
  GroundingSearch,
  MessageMetadata,
  MessageToolCall,
  ModelReasoning,
  TraceEventPayloads,
  TraceEventType,
  UIChatMessage,
  UpdateMessageRAGParams,
} from '@lobechat/types';
import { nanoid } from '@lobechat/utils';
import { copyToClipboard } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { traceService } from '@/services/trace';
import { ChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { Action, setNamespace } from '@/utils/storeDebug';

import type { ChatStoreState } from '../../initialState';
import { chatSelectors } from '../../selectors';
import { preventLeavingFn, toggleBooleanList } from '../../utils';
import { MessageDispatch, messagesReducer } from './reducer';

const n = setNamespace('m');

const SWR_USE_FETCH_MESSAGES = 'SWR_USE_FETCH_MESSAGES';

export interface ChatMessageAction {
  // create
  addAIMessage: () => Promise<void>;
  addUserMessage: (params: { message: string; fileList?: string[] }) => Promise<void>;
  // delete
  /**
   * clear message on the active session
   */
  clearMessage: () => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  deleteToolMessage: (id: string) => Promise<void>;
  clearAllMessages: () => Promise<void>;
  // update
  updateInputMessage: (message: string) => void;
  modifyMessageContent: (id: string, content: string) => Promise<void>;
  toggleMessageEditing: (id: string, editing: boolean) => void;
  // query
  useFetchMessages: (
    enable: boolean,
    messageContextId: string,
    activeTopicId?: string,
    type?: 'session' | 'group',
  ) => SWRResponse<UIChatMessage[]>;
  copyMessage: (id: string, content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  replaceMessages: (messages: UIChatMessage[]) => void;
  // =========  ↓ Internal Method ↓  ========== //
  // ========================================== //
  // ========================================== //
  internal_updateMessageRAG: (id: string, input: UpdateMessageRAGParams) => Promise<void>;

  /**
   * update message at the frontend
   * this method will not update messages to database
   */
  internal_dispatchMessage: (
    payload: MessageDispatch,
    context?: { topicId?: string | null; sessionId: string },
  ) => void;

  /**
   * update the message content with optimistic update
   * a method used by other action
   */
  internal_updateMessageContent: (
    id: string,
    content: string,
    extra?: {
      toolCalls?: MessageToolCall[];
      reasoning?: ModelReasoning;
      search?: GroundingSearch;
      metadata?: MessageMetadata;
      imageList?: ChatImageItem[];
      model?: string;
      provider?: string;
    },
  ) => Promise<void>;
  /**
   * update the message error with optimistic update
   */
  internal_updateMessageError: (id: string, error: ChatMessageError | null) => Promise<void>;
  internal_updateMessagePluginError: (
    id: string,
    error: ChatMessagePluginError | null,
  ) => Promise<void>;
  /**
   * create a message with optimistic update
   * returns the created message ID and updated message list
   */
  internal_createMessage: (
    params: CreateMessageParams,
    context?: { tempMessageId?: string; skipRefresh?: boolean; groupMessageId?: string },
  ) => Promise<{ id: string; messages: UIChatMessage[] } | undefined>;
  /**
   * create a temp message for optimistic update
   * otherwise the message will be too slow to show
   */
  internal_createTmpMessage: (params: CreateMessageParams) => string;
  /**
   * delete the message content with optimistic update
   */
  internal_deleteMessage: (id: string) => Promise<void>;

  internal_fetchMessages: () => Promise<void>;
  internal_traceMessage: (id: string, payload: TraceEventPayloads) => Promise<void>;

  /**
   * method to toggle message create loading state
   * the AI message status is creating -> generating
   * other message role like user and tool , only this method need to be called
   */
  internal_toggleMessageLoading: (loading: boolean, id: string) => void;

  /**
   * helper to toggle the loading state of the array,used by these three toggleXXXLoading
   */
  internal_toggleLoadingArrays: (
    key: keyof ChatStoreState,
    loading: boolean,
    id?: string,
    action?: Action,
  ) => AbortController | undefined;

  /**
   * Update active session type
   */
  internal_updateActiveSessionType: (sessionType?: 'agent' | 'group') => void;
  /**
   * Update active session ID with cleanup of pending operations
   */
  internal_updateActiveId: (activeId: string) => void;
}

export const chatMessage: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatMessageAction
> = (set, get) => ({
  deleteMessage: async (id) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    let ids = [message.id];
    const allMessages = chatSelectors.activeBaseChats(get());

    // if the message is a tool calls, then delete all the related tool messages
    if (message.tools) {
      const toolMessageIds = message.tools.flatMap((tool) => {
        const messages = allMessages.filter((m) => m.tool_call_id === tool.id);
        return messages.map((m) => m.id);
      });
      ids = ids.concat(toolMessageIds);
    }

    // if the message is a group message, find all children messages (via parentId)
    if (message.role === 'group') {
      const childMessages = allMessages.filter((m) => m.parentId === message.id);
      const childMessageIds = childMessages.map((m) => m.id);
      ids = ids.concat(childMessageIds);

      // Also delete tool results of children messages
      const childToolMessageIds = childMessages.flatMap((child) => {
        if (!child.tools) return [];
        return child.tools.flatMap((tool) => {
          const toolMessages = allMessages.filter((m) => m.tool_call_id === tool.id);
          return toolMessages.map((m) => m.id);
        });
      });
      ids = ids.concat(childToolMessageIds);
    }

    get().internal_dispatchMessage({ type: 'deleteMessages', ids });
    const result = await messageService.removeMessages(ids, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });
    if (result?.success && result.messages) {
      get().replaceMessages(result.messages);
    }
  },

  deleteToolMessage: async (id) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message || message.role !== 'tool') return;

    const removeToolInAssistantMessage = async () => {
      if (!message.parentId) return;
      await get().internal_removeToolToAssistantMessage(message.parentId, message.tool_call_id);
    };

    await Promise.all([
      // 1. remove tool message
      get().internal_deleteMessage(id),
      // 2. remove the tool item in the assistant tools
      removeToolInAssistantMessage(),
    ]);
  },

  clearMessage: async () => {
    const { activeId, activeTopicId, refreshTopic, switchTopic, activeSessionType } = get();

    // Check if this is a group session - use activeSessionType if available, otherwise check session store
    let isGroupSession = activeSessionType === 'group';
    if (activeSessionType === undefined) {
      // Fallback: check session store directly
      const sessionStore = useSessionStore.getState();
      isGroupSession = sessionSelectors.isCurrentSessionGroupSession(sessionStore);
    }

    // For group sessions, we need to clear group messages using groupId
    // For regular sessions, we clear session messages using sessionId
    if (isGroupSession) {
      // For group chat, activeId is the groupId
      await messageService.removeMessagesByGroup(activeId, activeTopicId);
    } else {
      // For regular session, activeId is the sessionId
      await messageService.removeMessagesByAssistant(activeId, activeTopicId);
    }

    if (activeTopicId) {
      await topicService.removeTopic(activeTopicId);
    }
    await refreshTopic();

    // Clear messages directly since all messages are deleted
    get().replaceMessages([]);

    // after remove topic , go back to default topic
    switchTopic();
  },
  clearAllMessages: async () => {
    await messageService.removeAllMessages();
    // Clear messages directly since all messages are deleted
    get().replaceMessages([]);
  },
  addAIMessage: async () => {
    const { internal_createMessage, updateInputMessage, activeTopicId, activeId, inputMessage } =
      get();
    if (!activeId) return;

    const result = await internal_createMessage({
      content: inputMessage,
      role: 'assistant',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
    });

    if (result) {
      updateInputMessage('');
    }
  },
  addUserMessage: async ({ message, fileList }) => {
    const { internal_createMessage, updateInputMessage, activeTopicId, activeId, activeThreadId } =
      get();
    if (!activeId) return;

    const result = await internal_createMessage({
      content: message,
      files: fileList,
      role: 'user',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
      threadId: activeThreadId,
    });

    if (result) {
      updateInputMessage('');
    }
  },
  copyMessage: async (id, content) => {
    await copyToClipboard(content);

    get().internal_traceMessage(id, { eventType: TraceEventType.CopyMessage });
  },
  toggleMessageEditing: (id, editing) => {
    set(
      { messageEditingIds: toggleBooleanList(get().messageEditingIds, id, editing) },
      false,
      'toggleMessageEditing',
    );
  },

  updateInputMessage: (message) => {
    if (isEqual(message, get().inputMessage)) return;

    set({ inputMessage: message }, false, n('updateInputMessage', message));
  },
  modifyMessageContent: async (id, content) => {
    // tracing the diff of update
    // due to message content will change, so we need send trace before update,or will get wrong data
    get().internal_traceMessage(id, {
      eventType: TraceEventType.ModifyMessage,
      nextContent: content,
    });

    await get().internal_updateMessageContent(id, content);
  },

  /**
   * @param enable - whether to enable the fetch
   * @param messageContextId - Can be sessionId or groupId
   */
  useFetchMessages: (enable, messageContextId, activeTopicId, type = 'session') =>
    useClientDataSWR<UIChatMessage[]>(
      enable ? [SWR_USE_FETCH_MESSAGES, messageContextId, activeTopicId, type] : null,
      async ([, sessionId, topicId, type]: [string, string, string | undefined, string]) =>
        type === 'session'
          ? messageService.getMessages(sessionId, topicId)
          : messageService.getGroupMessages(sessionId, topicId),
      {
        onSuccess: (messages, key) => {
          const nextMap = {
            ...get().messagesMap,
            [messageMapKey(messageContextId || '', activeTopicId)]: messages,
          };

          // no need to update map if the messages have been init and the map is the same
          if (get().messagesInit && isEqual(nextMap, get().messagesMap)) return;

          set(
            { messagesInit: true, messagesMap: nextMap },
            false,
            n('useFetchMessages', { messages, queryKey: key }),
          );
        },
      },
    ),
  // TODO: The mutate should only be called once, but since we haven't merge session and group,
  // we need to call it twice
  refreshMessages: async () => {
    await mutate([SWR_USE_FETCH_MESSAGES, get().activeId, get().activeTopicId, 'session']);
    await mutate([SWR_USE_FETCH_MESSAGES, get().activeId, get().activeTopicId, 'group']);
  },
  replaceMessages: (messages) => {
    set(
      {
        messagesMap: {
          ...get().messagesMap,
          [messageMapKey(get().activeId, get().activeTopicId)]: messages,
        },
      },
      false,
      'replaceMessages',
    );
  },

  internal_updateMessageRAG: async (id, data) => {
    const result = await messageService.updateMessageRAG(id, data, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });
    if (result?.success && result.messages) {
      get().replaceMessages(result.messages);
    }
  },

  // the internal process method of the AI message
  internal_dispatchMessage: (payload, context) => {
    const activeId = typeof context !== 'undefined' ? context.sessionId : get().activeId;
    const topicId = typeof context !== 'undefined' ? context.topicId : get().activeTopicId;

    const messagesKey = messageMapKey(activeId, topicId);

    const messages = messagesReducer(chatSelectors.getBaseChatsByKey(messagesKey)(get()), payload);

    const nextMap = { ...get().messagesMap, [messagesKey]: messages };

    if (isEqual(nextMap, get().messagesMap)) return;

    set({ messagesMap: nextMap }, false, { type: `dispatchMessage/${payload.type}`, payload });
  },

  internal_updateMessageError: async (id, error) => {
    get().internal_dispatchMessage({ id, type: 'updateMessage', value: { error } });
    const result = await messageService.updateMessage(
      id,
      { error },
      { topicId: get().activeTopicId, sessionId: get().activeId },
    );
    if (result?.success && result.messages) {
      get().replaceMessages(result.messages);
    } else {
      await get().refreshMessages();
    }
  },

  internal_updateMessagePluginError: async (id, error) => {
    const result = await messageService.updateMessagePluginError(id, error, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });
    if (result?.success && result.messages) {
      get().replaceMessages(result.messages);
    }
  },

  internal_updateMessageContent: async (id, content, extra) => {
    const {
      internal_dispatchMessage,
      refreshMessages,
      internal_transformToolCalls,
      replaceMessages,
    } = get();

    // Due to the async update method and refresh need about 100ms
    // we need to update the message content at the frontend to avoid the update flick
    // refs: https://medium.com/@kyledeguzmanx/what-are-optimistic-updates-483662c3e171
    if (extra?.toolCalls) {
      internal_dispatchMessage({
        id,
        type: 'updateMessage',
        value: { tools: internal_transformToolCalls(extra?.toolCalls) },
      });
    } else {
      internal_dispatchMessage({
        id,
        type: 'updateMessage',
        value: { content },
      });
    }

    const result = await messageService.updateMessage(
      id,
      {
        content,
        tools: extra?.toolCalls ? internal_transformToolCalls(extra?.toolCalls) : undefined,
        reasoning: extra?.reasoning,
        search: extra?.search,
        metadata: extra?.metadata,
        model: extra?.model,
        provider: extra?.provider,
        imageList: extra?.imageList,
      },
      { topicId: get().activeTopicId, sessionId: get().activeId },
    );

    if (result && result.success && result.messages) {
      replaceMessages(result.messages);
    } else {
      await refreshMessages();
    }
  },

  internal_fetchMessages: async () => {
    const messages = await messageService.getMessages(get().activeId, get().activeTopicId);
    const nextMap = { ...get().messagesMap, [chatSelectors.currentChatKey(get())]: messages };
    // no need to update map if the messages have been init and the map is the same
    if (get().messagesInit && isEqual(nextMap, get().messagesMap)) return;

    set(
      { messagesInit: true, messagesMap: nextMap },
      false,
      n('internal_fetchMessages', { messages }),
    );
  },
  internal_createTmpMessage: (message) => {
    const { internal_dispatchMessage } = get();

    // use optimistic update to avoid the slow waiting
    const tempId = 'tmp_' + nanoid();
    internal_dispatchMessage({ type: 'createMessage', id: tempId, value: message });

    return tempId;
  },
  internal_createMessage: async (message, context) => {
    const {
      internal_createTmpMessage,
      internal_toggleMessageLoading,
      internal_dispatchMessage,
      replaceMessages,
    } = get();

    let tempId = context?.tempMessageId;
    if (!tempId) {
      tempId = 'tmp_' + nanoid();

      // Check if should add as group block (explicitly controlled by caller)
      if (context?.groupMessageId) {
        internal_dispatchMessage({
          type: 'addGroupBlock',
          groupMessageId: context.groupMessageId,
          blockId: tempId,
          value: {
            id: tempId,
            content: message.content,
          },
        });
        internal_toggleMessageLoading(true, tempId);
      } else {
        // Regular message creation at top level
        tempId = internal_createTmpMessage(message as any);
        internal_toggleMessageLoading(true, tempId);
      }
    }

    try {
      const result = await messageService.createMessage(message);

      if (!context?.skipRefresh) {
        // Use the messages returned from createMessage (already grouped)
        replaceMessages(result.messages);
      }

      internal_toggleMessageLoading(false, tempId);
      return result;
    } catch (e) {
      internal_toggleMessageLoading(false, tempId);
      internal_dispatchMessage({
        id: tempId,
        type: 'updateMessage',
        value: {
          error: {
            type: ChatErrorType.CreateMessageError,
            message: (e as Error).message,
            body: e,
          },
        },
      });
    }
  },

  internal_deleteMessage: async (id: string) => {
    get().internal_dispatchMessage({ type: 'deleteMessage', id });
    const result = await messageService.removeMessage(id, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });
    if (result?.success && result.messages) {
      get().replaceMessages(result.messages);
    }
  },
  internal_traceMessage: async (id, payload) => {
    // tracing the diff of update
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    const traceId = message?.traceId;
    const observationId = message?.observationId;

    if (traceId && message?.role === 'assistant') {
      traceService
        .traceEvent({ traceId, observationId, content: message.content, ...payload })
        .catch();
    }
  },

  // ----- Loading ------- //
  internal_toggleMessageLoading: (loading, id) => {
    set(
      {
        messageLoadingIds: toggleBooleanList(get().messageLoadingIds, id, loading),
      },
      false,
      `internal_toggleMessageLoading/${loading ? 'start' : 'end'}`,
    );
  },
  internal_toggleLoadingArrays: (key, loading, id, action) => {
    const abortControllerKey = `${key}AbortController`;
    if (loading) {
      window.addEventListener('beforeunload', preventLeavingFn);

      const abortController = new AbortController();
      set(
        {
          [abortControllerKey]: abortController,
          [key]: toggleBooleanList(get()[key] as string[], id!, loading),
        },
        false,
        action,
      );

      return abortController;
    } else {
      if (!id) {
        set({ [abortControllerKey]: undefined, [key]: [] }, false, action);
      } else
        set(
          {
            [abortControllerKey]: undefined,
            [key]: toggleBooleanList(get()[key] as string[], id, loading),
          },
          false,
          action,
        );

      window.removeEventListener('beforeunload', preventLeavingFn);
    }
  },
  internal_updateActiveSessionType: (sessionType?: 'agent' | 'group') => {
    if (get().activeSessionType === sessionType) return;

    set({ activeSessionType: sessionType }, false, n('updateActiveSessionType'));
  },

  internal_updateActiveId: (activeId: string) => {
    const currentActiveId = get().activeId;
    if (currentActiveId === activeId) return;

    // Before switching sessions, cancel all pending supervisor decisions
    get().internal_cancelAllSupervisorDecisions();

    set({ activeId }, false, n(`updateActiveId/${activeId}`));
  },
});
