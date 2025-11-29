import {
  ChatErrorType,
  type ChatImageItem,
  type ChatMessageError,
  type ChatMessagePluginError,
  type ChatToolPayload,
  type ChatVideoItem,
  type CreateMessageParams,
  type GroundingSearch,
  type MessageMetadata,
  type MessagePluginItem,
  type ModelReasoning,
  type UpdateMessageRAGParams,
} from '@lobechat/types';
import { merge, nanoid, safeParseJSON } from '@lobechat/utils';
import isEqual from 'fast-deep-equal';
import type { StateCreator } from 'zustand';

import { messageService } from '@/services/message';

import type { Store as ConversationStore } from '../../../action';
import { dataSelectors } from '../../data/selectors';

/**
 * Message CRUD Actions
 *
 * Handles all message create, read, update, delete operations
 * with optimistic updates (update UI first, then persist to database)
 */
export interface MessageCRUDAction {
  // ===== Update Tools ===== //
  /**
   * Add a tool to an assistant message
   */
  addToolToMessage: (messageId: string, tool: ChatToolPayload) => Promise<void>;

  /**
   * Clear all messages in the current conversation
   */
  clearMessages: () => Promise<void>;

  // ===== Create ===== //
  /**
   * Create a message with optimistic update
   * Returns the created message ID
   */
  createMessage: (params: CreateMessageParams) => Promise<string | undefined>;

  /**
   * Create a temporary message for optimistic update
   * Used for immediate UI feedback before server response
   */
  createTempMessage: (
    params: CreateMessageParams & {
      imageList?: ChatImageItem[];
      videoList?: ChatVideoItem[];
    },
  ) => string;

  /**
   * Delete an assistant message and its associated tool messages
   */
  deleteAssistantMessage: (id: string) => Promise<void>;

  // ===== Delete ===== //
  /**
   * Delete a single message
   */
  deleteMessage: (id: string) => Promise<void>;

  /**
   * Delete multiple messages
   */
  deleteMessages: (ids: string[]) => Promise<void>;

  /**
   * Delete a tool message and remove the tool from its parent assistant message
   */
  deleteToolMessage: (id: string) => Promise<void>;

  /**
   * Remove a tool from an assistant message
   */
  removeToolFromMessage: (messageId: string, toolCallId: string) => Promise<void>;

  // ===== Update Content ===== //
  /**
   * Update message content with optimistic update
   */
  updateMessageContent: (
    id: string,
    content: string,
    extra?: {
      imageList?: ChatImageItem[];
      metadata?: MessageMetadata;
      model?: string;
      provider?: string;
      reasoning?: ModelReasoning;
      search?: GroundingSearch;
      tools?: ChatToolPayload[];
    },
  ) => Promise<void>;

  /**
   * Update message error with optimistic update
   */
  updateMessageError: (id: string, error: ChatMessageError | null) => Promise<void>;

  /**
   * Update message metadata with optimistic update
   */
  updateMessageMetadata: (id: string, metadata: Partial<MessageMetadata>) => Promise<void>;

  /**
   * Update message plugin with optimistic update
   */
  updateMessagePlugin: (id: string, value: Partial<MessagePluginItem>) => Promise<void>;

  /**
   * Update message plugin error with optimistic update
   */
  updateMessagePluginError: (id: string, error: ChatMessagePluginError | null) => Promise<void>;

  /**
   * Update message RAG with optimistic update
   */
  updateMessageRAG: (id: string, data: UpdateMessageRAGParams) => Promise<void>;

  /**
   * Update a tool in an assistant message
   */
  updateMessageTool: (
    messageId: string,
    toolCallId: string,
    value: Partial<ChatToolPayload>,
  ) => Promise<void>;

  /**
   * Update plugin arguments with optimistic update
   * Updates both the tool message plugin arguments and the parent assistant message tools
   */
  updatePluginArguments: <T = any>(id: string, value: T, replace?: boolean) => Promise<void>;
}

export const messageCRUDSlice: StateCreator<
  ConversationStore,
  [['zustand/devtools', never]],
  [],
  MessageCRUDAction
> = (set, get) => ({
  // ===== Update Tools ===== //
  addToolToMessage: async (messageId, tool) => {
    const { internal_dispatchMessage, replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Optimistic update
    internal_dispatchMessage({
      id: messageId,
      type: 'addMessageTool',
      value: tool,
    });

    // Persist to database
    const result = await messageService.updateMessage(
      messageId,
      { tools: [tool] },
      { sessionId, topicId: topicId ?? undefined },
    );

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  clearMessages: async () => {
    const { context, replaceMessages } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Clear from database
    await messageService.removeMessagesByAssistant(sessionId, topicId ?? undefined);

    // Clear local state
    replaceMessages([]);
  },

  // ===== Create ===== //
  createMessage: async (params) => {
    const { context, internal_dispatchMessage, replaceMessages, internal_toggleMessageLoading } =
      get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Create temp message for optimistic update
    const tempId = get().createTempMessage(params);
    internal_toggleMessageLoading(true, tempId);

    try {
      const result = await messageService.createMessage({
        ...params,
        sessionId,
        topicId: topicId ?? undefined,
      });

      // Replace with server response
      replaceMessages(result.messages);
      internal_toggleMessageLoading(false, tempId);

      return result.id;
    } catch (e) {
      internal_toggleMessageLoading(false, tempId);

      // Update temp message with error
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

      return undefined;
    }
  },

  createTempMessage: (params) => {
    const { internal_dispatchMessage } = get();

    const tempId = 'tmp_' + nanoid();
    internal_dispatchMessage({
      id: tempId,
      type: 'createMessage',
      value: params,
    });

    return tempId;
  },

  deleteAssistantMessage: async (id) => {
    const message = dataSelectors.getDbMessageById(id)(get());
    if (!message) return;

    let ids = [message.id];

    // If assistant message has tools, also delete tool messages
    if (message.tools) {
      const allMessages = get().dbMessages;
      const toolMessageIds = message.tools.flatMap((tool) => {
        const messages = allMessages.filter((m) => m.tool_call_id === tool.id);
        return messages.map((m) => m.id);
      });
      ids = ids.concat(toolMessageIds);
    }

    await get().deleteMessages(ids);
  },

  // ===== Delete ===== //
  deleteMessage: async (id) => {
    const state = get();
    const { internal_dispatchMessage, replaceMessages, context } = state;
    const { agentId, topicId } = context;
    const sessionId = agentId;

    const message = dataSelectors.getDisplayMessageById(id)(state);
    if (!message) return;

    let ids = [message.id];

    // Handle assistantGroup messages: delete all child blocks and tool results
    if (message.role === 'assistantGroup' && message.children) {
      const childIds = message.children.map((child) => child.id);
      ids = ids.concat(childIds);

      // Collect all tool result IDs from children
      const toolResultIds = message.children.flatMap((child) => {
        if (!child.tools) return [];
        return child.tools.filter((tool) => tool.result?.id).map((tool) => tool.result!.id);
      });
      ids = ids.concat(toolResultIds);
    }

    // Optimistic update
    internal_dispatchMessage({ ids, type: 'deleteMessages' });

    // Persist to database
    const result = await messageService.removeMessages(ids, {
      sessionId,
      topicId: topicId ?? undefined,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  deleteMessages: async (ids) => {
    const { internal_dispatchMessage, replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Optimistic update
    internal_dispatchMessage({ ids, type: 'deleteMessages' });

    // Persist to database
    const result = await messageService.removeMessages(ids, {
      sessionId,
      topicId: topicId ?? undefined,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  deleteToolMessage: async (id) => {
    const { internal_dispatchMessage, replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    const message = dataSelectors.getDbMessageById(id)(get());
    if (!message || message.role !== 'tool') return;

    // 1. Remove tool message
    internal_dispatchMessage({ id, type: 'deleteMessage' });

    // 2. Remove tool from parent assistant message
    if (message.parentId && message.tool_call_id) {
      internal_dispatchMessage({
        id: message.parentId,
        tool_call_id: message.tool_call_id,
        type: 'deleteMessageTool',
      });
    }

    // Persist to database
    const result = await messageService.removeMessage(id, {
      sessionId,
      topicId: topicId ?? undefined,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  removeToolFromMessage: async (messageId, toolCallId) => {
    const { internal_dispatchMessage, replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Optimistic update
    internal_dispatchMessage({
      id: messageId,
      tool_call_id: toolCallId,
      type: 'deleteMessageTool',
    });

    // Get the updated tools for persistence
    const message = dataSelectors.getDbMessageById(messageId)(get());
    if (message) {
      const result = await messageService.updateMessage(
        messageId,
        { tools: message.tools || [] },
        { sessionId, topicId: topicId ?? undefined },
      );

      if (result?.success && result.messages) {
        replaceMessages(result.messages);
      }
    }
  },

  // ===== Update Content ===== //
  updateMessageContent: async (id, content, extra) => {
    const { internal_dispatchMessage, replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Optimistic update
    if (extra?.tools) {
      internal_dispatchMessage({
        id,
        type: 'updateMessage',
        value: { tools: extra.tools },
      });
    } else {
      internal_dispatchMessage({
        id,
        type: 'updateMessage',
        value: { content },
      });
    }

    // Persist to database
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
        tools: extra?.tools,
      },
      { sessionId, topicId: topicId ?? undefined },
    );

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  updateMessageError: async (id, error) => {
    const { internal_dispatchMessage, replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Optimistic update
    internal_dispatchMessage({
      id,
      type: 'updateMessage',
      value: { error },
    });

    // Persist to database
    const result = await messageService.updateMessage(
      id,
      { error },
      { sessionId, topicId: topicId ?? undefined },
    );

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  updateMessageMetadata: async (id, metadata) => {
    const { internal_dispatchMessage, replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Optimistic update
    internal_dispatchMessage({ id, type: 'updateMessageMetadata', value: metadata });

    // Persist to database
    const result = await messageService.updateMessageMetadata(id, metadata, {
      sessionId,
      topicId: topicId ?? undefined,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  updateMessagePlugin: async (id, value) => {
    const { internal_dispatchMessage, replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Optimistic update
    internal_dispatchMessage({
      id,
      type: 'updateMessagePlugin',
      value,
    });

    // Persist to database
    const result = await messageService.updateMessagePlugin(id, value, {
      sessionId,
      topicId: topicId ?? undefined,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  updateMessagePluginError: async (id, error) => {
    const { replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Persist to database (no optimistic update for plugin error)
    const result = await messageService.updateMessagePluginError(id, error, {
      sessionId,
      topicId: topicId ?? undefined,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  updateMessageRAG: async (id, data) => {
    const { replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Persist to database
    const result = await messageService.updateMessageRAG(id, data, {
      sessionId,
      topicId: topicId ?? undefined,
    });

    if (result?.success && result.messages) {
      replaceMessages(result.messages);
    }
  },

  updateMessageTool: async (messageId, toolCallId, value) => {
    const { internal_dispatchMessage, replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    // Optimistic update
    internal_dispatchMessage({
      id: messageId,
      tool_call_id: toolCallId,
      type: 'updateMessageTools',
      value,
    });

    // Get the updated tools for persistence
    const message = dataSelectors.getDbMessageById(messageId)(get());
    if (message?.tools) {
      const result = await messageService.updateMessage(
        messageId,
        { tools: message.tools },
        { sessionId, topicId: topicId ?? undefined },
      );

      if (result?.success && result.messages) {
        replaceMessages(result.messages);
      }
    }
  },

  updatePluginArguments: async (id, value, replace = false) => {
    const { internal_dispatchMessage, replaceMessages, context } = get();
    const { agentId, topicId } = context;
    const sessionId = agentId;

    const toolMessage = dataSelectors.getDisplayMessageById(id)(get());
    if (!toolMessage || !toolMessage.tool_call_id) return;

    const prevArguments = toolMessage.plugin?.arguments;
    const prevJson = safeParseJSON(prevArguments || '');
    const nextValue = replace ? (value as any) : merge(prevJson || {}, value);
    if (isEqual(prevJson, nextValue)) return;

    const nextArgumentsStr = JSON.stringify(nextValue);

    // Optimistic update - update tool message plugin
    internal_dispatchMessage({
      id,
      type: 'updateMessagePlugin',
      value: { arguments: nextArgumentsStr },
    });

    // Also update parent assistant message tools
    if (toolMessage.parentId) {
      internal_dispatchMessage({
        id: toolMessage.parentId,
        tool_call_id: toolMessage.tool_call_id,
        type: 'updateMessageTools',
        value: { arguments: nextArgumentsStr },
      });
    }

    // Persist to database
    // Update both tool message plugin and assistant message tools
    const assistantMessage = toolMessage.parentId
      ? dataSelectors.getDisplayMessageById(toolMessage.parentId)(get())
      : undefined;

    await Promise.all([
      messageService.updateMessagePluginArguments(id, nextValue),
      assistantMessage
        ? messageService.updateMessage(
            assistantMessage.id,
            { tools: assistantMessage.tools },
            { sessionId, topicId: topicId ?? undefined },
          )
        : Promise.resolve(),
    ]);

    // Refresh messages from database
    const messages = await messageService.getMessages({ sessionId, topicId: topicId ?? undefined });
    if (messages) {
      replaceMessages(messages);
    }
  },
});
