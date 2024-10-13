/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { copyToClipboard } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { TraceEventType } from '@/const/trace';
import { useClientDataSWR } from '@/libs/swr';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { traceService } from '@/services/trace';
import { ChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import {
  ChatMessage,
  ChatMessageError,
  CreateMessageParams,
  MessageToolCall,
} from '@/types/message';
import { TraceEventPayloads } from '@/types/trace';
import { setNamespace } from '@/utils/storeDebug';
import { nanoid } from '@/utils/uuid';

import type { ChatStoreState } from '../../initialState';
import { chatSelectors } from '../../selectors';
import { preventLeavingFn, toggleBooleanList } from '../../utils';
import { MessageDispatch, messagesReducer } from './reducer';

const n = setNamespace('m');

const SWR_USE_FETCH_MESSAGES = 'SWR_USE_FETCH_MESSAGES';

export interface ChatMessageAction {
  // create
  addAIMessage: () => Promise<void>;
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
  useFetchMessages: (sessionId: string, topicId?: string) => SWRResponse<ChatMessage[]>;
  copyMessage: (id: string, content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;

  // =========  ↓ Internal Method ↓  ========== //
  // ========================================== //
  // ========================================== //

  /**
   * update message at the frontend
   * this method will not update messages to database
   */
  internal_dispatchMessage: (payload: MessageDispatch) => void;

  /**
   * update the message content with optimistic update
   * a method used by other action
   */
  internal_updateMessageContent: (
    id: string,
    content: string,
    toolCalls?: MessageToolCall[],
  ) => Promise<void>;
  /**
   * update the message error with optimistic update
   */
  internal_updateMessageError: (id: string, error: ChatMessageError | null) => Promise<void>;
  /**
   * create a message with optimistic update
   */
  internal_createMessage: (
    params: CreateMessageParams,
    context?: { tempMessageId?: string; skipRefresh?: boolean },
  ) => Promise<string>;
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
    action?: string,
  ) => AbortController | undefined;
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

    // if the message is a tool calls, then delete all the related messages
    if (message.tools) {
      const toolMessageIds = message.tools.flatMap((tool) => {
        const messages = chatSelectors
          .currentChats(get())
          .filter((m) => m.tool_call_id === tool.id);

        return messages.map((m) => m.id);
      });
      ids = ids.concat(toolMessageIds);
    }

    get().internal_dispatchMessage({ type: 'deleteMessages', ids });
    await messageService.removeMessages(ids);
    await get().refreshMessages();
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
    const { activeId, activeTopicId, refreshMessages, refreshTopic, switchTopic } = get();

    await messageService.removeMessagesByAssistant(activeId, activeTopicId);

    if (activeTopicId) {
      await topicService.removeTopic(activeTopicId);
    }
    await refreshTopic();
    await refreshMessages();

    // after remove topic , go back to default topic
    switchTopic();
  },
  clearAllMessages: async () => {
    const { refreshMessages } = get();
    await messageService.removeAllMessages();
    await refreshMessages();
  },
  addAIMessage: async () => {
    const { internal_createMessage, updateInputMessage, activeTopicId, activeId, inputMessage } =
      get();
    if (!activeId) return;

    await internal_createMessage({
      content: inputMessage,
      role: 'assistant',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
    });

    updateInputMessage('');
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
  useFetchMessages: (sessionId, activeTopicId) =>
    useClientDataSWR<ChatMessage[]>(
      [SWR_USE_FETCH_MESSAGES, sessionId, activeTopicId],
      async ([, sessionId, topicId]: [string, string, string | undefined]) =>
        messageService.getMessages(sessionId, topicId),
      {
        onSuccess: (messages, key) => {
          const nextMap = {
            ...get().messagesMap,
            [messageMapKey(sessionId, activeTopicId)]: messages,
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
  refreshMessages: async () => {
    await mutate([SWR_USE_FETCH_MESSAGES, get().activeId, get().activeTopicId]);
  },

  // the internal process method of the AI message
  internal_dispatchMessage: (payload) => {
    const { activeId } = get();

    if (!activeId) return;

    const messages = messagesReducer(chatSelectors.currentChats(get()), payload);

    const nextMap = { ...get().messagesMap, [chatSelectors.currentChatKey(get())]: messages };

    if (isEqual(nextMap, get().messagesMap)) return;

    set({ messagesMap: nextMap }, false, { type: `dispatchMessage/${payload.type}`, payload });
  },

  internal_updateMessageError: async (id, error) => {
    get().internal_dispatchMessage({ id, type: 'updateMessage', value: { error } });
    await messageService.updateMessage(id, { error });
    await get().refreshMessages();
  },
  internal_updateMessageContent: async (id, content, toolCalls) => {
    const { internal_dispatchMessage, refreshMessages, internal_transformToolCalls } = get();

    // Due to the async update method and refresh need about 100ms
    // we need to update the message content at the frontend to avoid the update flick
    // refs: https://medium.com/@kyledeguzmanx/what-are-optimistic-updates-483662c3e171
    if (toolCalls) {
      internal_dispatchMessage({
        id,
        type: 'updateMessage',
        value: { tools: internal_transformToolCalls(toolCalls) },
      });
    } else {
      internal_dispatchMessage({ id, type: 'updateMessage', value: { content } });
    }

    await messageService.updateMessage(id, {
      content,
      tools: toolCalls ? internal_transformToolCalls(toolCalls) : undefined,
    });
    await refreshMessages();
  },

  internal_createMessage: async (message, context) => {
    const { internal_createTmpMessage, refreshMessages, internal_toggleMessageLoading } = get();
    let tempId = context?.tempMessageId;
    if (!tempId) {
      // use optimistic update to avoid the slow waiting
      tempId = internal_createTmpMessage(message);

      internal_toggleMessageLoading(true, tempId);
    }

    const id = await messageService.createMessage(message);
    if (!context?.skipRefresh) {
      internal_toggleMessageLoading(true, tempId);
      await refreshMessages();
    }

    internal_toggleMessageLoading(false, tempId);
    return id;
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
  internal_deleteMessage: async (id: string) => {
    get().internal_dispatchMessage({ type: 'deleteMessage', id });
    await messageService.removeMessage(id);
    await get().refreshMessages();
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
      'internal_toggleMessageLoading',
    );
  },
  internal_toggleLoadingArrays: (key, loading, id, action) => {
    if (loading) {
      window.addEventListener('beforeunload', preventLeavingFn);

      const abortController = new AbortController();
      set(
        {
          abortController,
          [key]: toggleBooleanList(get()[key] as string[], id!, loading),
        },
        false,
        action,
      );

      return abortController;
    } else {
      if (!id) {
        set({ abortController: undefined, [key]: [] }, false, action);
      } else
        set(
          {
            abortController: undefined,
            [key]: toggleBooleanList(get()[key] as string[], id, loading),
          },
          false,
          action,
        );

      window.removeEventListener('beforeunload', preventLeavingFn);
    }
  },
});
