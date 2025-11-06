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
  UIChatMessage,
  UpdateMessageRAGParams,
} from '@lobechat/types';
import { nanoid } from '@lobechat/utils';
import { StateCreator } from 'zustand/vanilla';

import { messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';

/**
 * Optimistic update operations
 * All methods follow the pattern: update frontend first, then persist to database
 */
export interface MessageOptimisticUpdateAction {
  /**
   * create a message with optimistic update
   * returns the created message ID and updated message list
   */
  optimisticCreateMessage: (
    params: CreateMessageParams,
    context?: { groupMessageId?: string, skipRefresh?: boolean; tempMessageId?: string; },
  ) => Promise<{ id: string; messages: UIChatMessage[] } | undefined>;

  /**
   * create a temp message for optimistic update
   * otherwise the message will be too slow to show
   */
  optimisticCreateTmpMessage: (params: CreateMessageParams) => string;

  /**
   * delete the message content with optimistic update
   */
  optimisticDeleteMessage: (id: string) => Promise<void>;

  /**
   * update the message content with optimistic update
   * a method used by other action
   */
  optimisticUpdateMessageContent: (
    id: string,
    content: string,
    extra?: {
      imageList?: ChatImageItem[];
      metadata?: MessageMetadata;
      model?: string;
      provider?: string;
      reasoning?: ModelReasoning;
      search?: GroundingSearch;
      toolCalls?: MessageToolCall[];
    },
  ) => Promise<void>;

  /**
   * update the message error with optimistic update
   */
  optimisticUpdateMessageError: (id: string, error: ChatMessageError | null) => Promise<void>;

  /**
   * update the message metadata with optimistic update
   */
  optimisticUpdateMessageMetadata: (
    id: string,
    metadata: Partial<MessageMetadata>,
  ) => Promise<void>;

  /**
   * update the message plugin error with optimistic update
   */
  optimisticUpdateMessagePluginError: (
    id: string,
    error: ChatMessagePluginError | null,
  ) => Promise<void>;

  /**
   * update message RAG with optimistic update
   */
  optimisticUpdateMessageRAG: (id: string, input: UpdateMessageRAGParams) => Promise<void>;
}

export const messageOptimisticUpdate: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  MessageOptimisticUpdateAction
> = (set, get) => ({
  optimisticCreateMessage: async (message, context) => {
    const {
      optimisticCreateTmpMessage,
      internal_toggleMessageLoading,
      internal_dispatchMessage,
      replaceMessages,
    } = get();

    let tempId = context?.tempMessageId;
    if (!tempId) {
      tempId = optimisticCreateTmpMessage(message as any);
      internal_toggleMessageLoading(true, tempId);
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
            body: e,
            message: (e as Error).message,
            type: ChatErrorType.CreateMessageError,
          },
        },
      });
    }
  },

  optimisticCreateTmpMessage: (message) => {
    const { internal_dispatchMessage } = get();

    // use optimistic update to avoid the slow waiting
    const tempId = 'tmp_' + nanoid();
    internal_dispatchMessage({ id: tempId, type: 'createMessage', value: message });

    return tempId;
  },

  optimisticDeleteMessage: async (id: string) => {
    get().internal_dispatchMessage({ id, type: 'deleteMessage' });
    const result = await messageService.removeMessage(id, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });
    if (result?.success && result.messages) {
      get().replaceMessages(result.messages);
    }
  },

  optimisticUpdateMessageContent: async (id, content, extra) => {
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
        imageList: extra?.imageList,
        metadata: extra?.metadata,
        model: extra?.model,
        provider: extra?.provider,
        reasoning: extra?.reasoning,
        search: extra?.search,
        tools: extra?.toolCalls ? internal_transformToolCalls(extra?.toolCalls) : undefined,
      },
      { sessionId: get().activeId, topicId: get().activeTopicId },
    );

    if (result && result.success && result.messages) {
      replaceMessages(result.messages);
    } else {
      await refreshMessages();
    }
  },

  optimisticUpdateMessageError: async (id, error) => {
    get().internal_dispatchMessage({ id, type: 'updateMessage', value: { error } });
    const result = await messageService.updateMessage(
      id,
      { error },
      { sessionId: get().activeId, topicId: get().activeTopicId },
    );
    if (result?.success && result.messages) {
      get().replaceMessages(result.messages);
    } else {
      await get().refreshMessages();
    }
  },

  optimisticUpdateMessageMetadata: async (id, metadata) => {
    const { internal_dispatchMessage, replaceMessages, refreshMessages } = get();

    // Optimistic update: update the frontend immediately
    internal_dispatchMessage({
      id,
      type: 'updateMessageMetadata',
      value: metadata,
    });

    // Persist to database
    const result = await messageService.updateMessageMetadata(id, metadata, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });

    if (!result?.success && result.messages) {
      replaceMessages(result.messages);
    } else {
      await refreshMessages();
    }
  },

  optimisticUpdateMessagePluginError: async (id, error) => {
    const result = await messageService.updateMessagePluginError(id, error, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });
    if (result?.success && result.messages) {
      get().replaceMessages(result.messages);
    }
  },

  optimisticUpdateMessageRAG: async (id, data) => {
    const result = await messageService.updateMessageRAG(id, data, {
      sessionId: get().activeId,
      topicId: get().activeTopicId,
    });
    if (result?.success && result.messages) {
      get().replaceMessages(result.messages);
    }
  },
});
