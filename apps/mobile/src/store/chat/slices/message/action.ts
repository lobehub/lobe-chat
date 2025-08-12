/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { StateCreator } from 'zustand/vanilla';
import useSWR, { SWRResponse } from 'swr';

import { messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import {
  ChatMessage,
  ChatMessageError,
  ChatMessagePluginError,
  CreateMessageParams,
  MessageMetadata,
  MessageToolCall,
  ModelReasoning,
} from '@/types/message';
import { ChatImageItem } from '@/types/message/image';
import { GroundingSearch } from '@/types/search';
import { Action, setNamespace } from '@/utils/storeDebug';
import { nanoid } from '@/utils/uuid';

import { toggleBooleanList } from '../../utils';
import { MessageDispatch } from './reducer';
import { TraceEventPayloads } from '@/types/trace';
import { ChatStoreState } from '../../initialState';

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
  useFetchMessages: (
    enable: boolean,
    sessionId: string,
    topicId?: string,
  ) => SWRResponse<ChatMessage[]>;
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
   */
  internal_createMessage: (
    params: CreateMessageParams,
    context?: { tempMessageId?: string; skipRefresh?: boolean },
  ) => Promise<string | undefined>;
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
}

export const chatMessage: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatMessageAction
> = (set, get) => ({
  // ============ 核心功能实现 ============

  addAIMessage: async () => {
    const { activeId, activeTopicId, internal_createMessage, updateInputMessage } = get();
    const newMessage: CreateMessageParams = {
      content: '',
      role: 'assistant',
      sessionId: activeId,
      topicId: activeTopicId,
    };

    await internal_createMessage(newMessage);
    updateInputMessage('');
    return;
  },

  clearMessage: async () => {
    const { activeId } = get();
    // TODO: 实现清除消息功能
    set(
      {
        messagesMap: {
          ...get().messagesMap,
          [activeId]: [],
        },
        messagesInit: false,
      },
      false,
      n('clearMessage'),
    );
  },

  deleteMessage: async (id: string) => {
    const { activeId } = get();
    const messages = get().messagesMap[activeId] || [];
    set(
      {
        messagesMap: {
          ...get().messagesMap,
          [activeId]: messages.filter((m) => m.id !== id),
        },
      },
      false,
      n('deleteMessage'),
    );

    // 从服务端删除
    try {
      await messageService.removeMessage(id);
    } catch (error) {
      console.error('Delete message failed:', error);
    }
  },

  deleteToolMessage: async (id: string) => {
    return get().deleteMessage(id);
  },

  clearAllMessages: async () => {
    set(
      {
        messagesMap: {},
        messagesInit: false,
      },
      false,
      n('clearAllMessages'),
    );

    try {
      await messageService.removeAllMessages();
    } catch (error) {
      console.error('Clear all messages failed:', error);
    }
  },

  updateInputMessage: (message: string) => {
    set({ inputMessage: message }, false, n('updateInputMessage'));
  },

  modifyMessageContent: async (id: string, content: string) => {
    // 乐观更新
    get().internal_updateMessageContent(id, content);

    try {
      await messageService.updateMessage(id, { content });
    } catch (error) {
      console.error('Update message content failed:', error);
    }
  },

  toggleMessageEditing: (id: string, editing: boolean) => {
    set(
      {
        messageEditingIds: toggleBooleanList(get().messageEditingIds, id, editing),
      },
      false,
      n('toggleMessageEditing'),
    );
  },

  useFetchMessages: (enable: boolean, sessionId: string, topicId?: string) => {
    const key = enable ? `${SWR_USE_FETCH_MESSAGES}-${sessionId}-${topicId}` : null;

    return useSWR<ChatMessage[]>(
      key,
      async () => {
        return messageService.getMessages(sessionId, topicId);
      },
      {
        onSuccess: (data) => {
          const { internal_dispatchMessage } = get();
          internal_dispatchMessage({
            messages: data,
            sessionId,
            topicId,
            type: 'addMessages',
          });

          set({ messagesInit: true }, false, n('useFetchMessages(success)'));
        },
        revalidateOnFocus: false,
      },
    );
  },

  copyMessage: async (id: string, content: string) => {
    // TODO: 实现复制消息功能
    // await copyToClipboard(content);
    console.log('Copy message:', id, content);
  },

  refreshMessages: async () => {
    const { activeId, activeTopicId } = get();
    set({ messagesInit: false }, false, n('refreshMessages'));

    try {
      const messages = await messageService.getMessages(activeId, activeTopicId);
      get().internal_dispatchMessage({
        messages,
        sessionId: activeId,
        topicId: activeTopicId,
        type: 'addMessages',
      });
      set({ messagesInit: true }, false, n('refreshMessages(success)'));
    } catch (error) {
      console.error('Refresh messages failed:', error);
    }
  },

  // ============ 内部方法实现 ============

  internal_dispatchMessage: (payload: MessageDispatch) => {
    const { activeId } = get();
    const { messages, sessionId, topicId } = payload;
    const key = messageMapKey(sessionId || activeId, topicId);
    const currentMessagesMap = get().messagesMap;
    const currentMessages = currentMessagesMap[key] || [];

    let newMessagesMap = currentMessagesMap;

    switch (payload.type) {
      case 'addMessage': {
        if (payload.message) {
          newMessagesMap = {
            ...currentMessagesMap,
            [key]: [...currentMessages, payload.message as ChatMessage],
          };
        }
        break;
      }
      case 'addMessages': {
        newMessagesMap = {
          ...currentMessagesMap,
          [key]: messages || [],
        };
        break;
      }
      case 'updateMessage': {
        if (payload.message) {
          const index = currentMessages.findIndex((m) => m.id === payload.id);
          if (index >= 0) {
            const updatedMessages = [...currentMessages];
            updatedMessages[index] = { ...updatedMessages[index], ...payload.message };
            newMessagesMap = {
              ...currentMessagesMap,
              [key]: updatedMessages,
            };
          }
        }
        break;
      }
      case 'updateMessageContent': {
        if (payload.content !== undefined) {
          const index = currentMessages.findIndex((m) => m.id === payload.id);
          if (index >= 0) {
            const updatedMessages = [...currentMessages];
            updatedMessages[index] = {
              ...updatedMessages[index],
              content: payload.content,
              updatedAt: Date.now(),
            };
            newMessagesMap = {
              ...currentMessagesMap,
              [key]: updatedMessages,
            };
          }
        }
        break;
      }
    }

    if (newMessagesMap !== currentMessagesMap) {
      set({ messagesMap: newMessagesMap }, false, n('dispatchMessage'));
    }
  },

  internal_updateMessageContent: async (id: string, content: string) => {
    const { activeId, activeTopicId } = get();

    get().internal_dispatchMessage({
      type: 'updateMessageContent',
      id,
      content,
      sessionId: activeId,
      topicId: activeTopicId,
    });
  },

  internal_updateMessageError: async (id: string, error: ChatMessageError | null) => {
    const { activeId, activeTopicId } = get();

    get().internal_dispatchMessage({
      type: 'updateMessage',
      id,
      message: { error },
      sessionId: activeId,
      topicId: activeTopicId,
    });
  },

  internal_updateMessagePluginError: async (id: string, error: ChatMessagePluginError | null) => {
    // Mobile端暂不支持插件功能
    console.log('Plugin error update not supported in mobile:', id, error);
  },

  internal_createMessage: async (params: CreateMessageParams, context = {}) => {
    const { internal_createTmpMessage, internal_toggleMessageLoading, refreshMessages } = get();

    let tempId = context?.tempMessageId;
    if (!tempId) {
      // 使用乐观更新避免缓慢等待
      tempId = internal_createTmpMessage(params);
      internal_toggleMessageLoading(true, tempId);
    }

    try {
      const id = await messageService.createMessage(params);
      if (!context?.skipRefresh) {
        await refreshMessages();
      }
      internal_toggleMessageLoading(false, tempId);
      return id;
    } catch (error) {
      console.error('Create message failed:', error);
      internal_toggleMessageLoading(false, tempId);
      throw error;
    }
  },

  internal_createTmpMessage: (params: CreateMessageParams) => {
    const tempId = nanoid();
    const tempMessage: ChatMessage = {
      id: tempId,
      content: params.content,
      role: params.role,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      meta: {},
      parentId: params.parentId,
    };

    const { activeId, activeTopicId } = get();
    get().internal_dispatchMessage({
      type: 'addMessage',
      message: tempMessage,
      sessionId: activeId,
      topicId: activeTopicId,
    });

    return tempId;
  },

  internal_toggleMessageLoading: (loading: boolean, id: string) => {
    get().internal_toggleLoadingArrays('messageLoadingIds', loading, id);
  },

  internal_toggleLoadingArrays: (
    key: keyof ChatStoreState,
    loading: boolean,
    id?: string,
    action?: Action,
  ) => {
    if (!id) return undefined;

    const actionName = action || n('toggleLoadingArrays');
    set(
      {
        [key]: toggleBooleanList(get()[key] as string[], id, loading),
      },
      false,
      actionName as any,
    );
    return undefined;
  },

  internal_deleteMessage: async (id: string) => {
    await get().deleteMessage(id);
  },

  internal_fetchMessages: async () => {
    await get().refreshMessages();
  },

  internal_traceMessage: async (id: string, payload: TraceEventPayloads) => {
    // Mobile端暂不支持追踪功能
    console.log('Trace message not supported in mobile:', { id, payload });
  },

  // ============ 未实现功能（抛出错误）============

  // sendMessage: async (message: string) => {
  //   throw new Error('sendMessage should be implemented in aiChat slice');
  // },

  // translateMessage: async (id: string, targetLang?: string) => {
  //   throw new Error('Translation feature not implemented in mobile version');
  // },

  // ttsMessage: async (id: string) => {
  //   throw new Error('TTS feature not implemented in mobile version');
  // },
});
