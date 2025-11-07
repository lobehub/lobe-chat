/* eslint-disable sort-keys-fix/sort-keys-fix,typescript-sort-keys/interface */
import { TraceEventType } from '@lobechat/types';
import { copyToClipboard } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { StateCreator } from 'zustand/vanilla';

import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { ChatStore } from '@/store/chat/store';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { setNamespace } from '@/utils/storeDebug';

import { dbMessageSelectors, displayMessageSelectors } from '../../../selectors';
import { toggleBooleanList } from '../../../utils';

const n = setNamespace('m');

/**
 * Public API for components
 * These methods are directly called by UI components
 */
export interface MessagePublicApiAction {
  // ===== Create ===== //
  addAIMessage: () => Promise<void>;
  addUserMessage: (params: { message: string; fileList?: string[] }) => Promise<void>;

  // ===== Delete ===== //
  /**
   * clear message on the active session
   */
  clearMessage: () => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  deleteToolMessage: (id: string) => Promise<void>;
  clearAllMessages: () => Promise<void>;

  // ===== Update ===== //
  /**
   * Update message input box content
   */
  updateMessageInput: (message: string) => void;
  modifyMessageContent: (id: string, content: string) => Promise<void>;
  toggleMessageEditing: (id: string, editing: boolean) => void;

  // ===== Others ===== //
  copyMessage: (id: string, content: string) => Promise<void>;
}

export const messagePublicApi: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  MessagePublicApiAction
> = (set, get) => ({
  addAIMessage: async () => {
    const { optimisticCreateMessage, updateMessageInput, activeTopicId, activeId, inputMessage } =
      get();
    if (!activeId) return;

    const parentId = displayMessageSelectors.lastDisplayMessageId(get());

    const result = await optimisticCreateMessage({
      content: inputMessage,
      role: 'assistant',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
      parentId,
    });

    if (result) {
      updateMessageInput('');
    }
  },

  addUserMessage: async ({ message, fileList }) => {
    const { optimisticCreateMessage, updateMessageInput, activeTopicId, activeId, activeThreadId } =
      get();
    if (!activeId) return;

    const parentId = displayMessageSelectors.lastDisplayMessageId(get());

    const result = await optimisticCreateMessage({
      content: message,
      files: fileList,
      role: 'user',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
      threadId: activeThreadId,
      parentId,
    });

    if (result) {
      updateMessageInput('');
    }
  },

  deleteMessage: async (id) => {
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message) return;

    let ids = [message.id];
    const allMessages = displayMessageSelectors.activeDisplayMessages(get());

    // Handle assistantGroup messages: delete all child blocks and tool results
    if (message.role === 'assistantGroup' && message.children) {
      // Collect all child block IDs
      const childIds = message.children.map((child) => child.id);
      ids = ids.concat(childIds);

      // Collect all tool result IDs from children
      const toolResultIds = message.children.flatMap((child) => {
        if (!child.tools) return [];
        return child.tools.filter((tool) => tool.result?.id).map((tool) => tool.result!.id);
      });
      ids = ids.concat(toolResultIds);
    }
    // Handle regular messages with tools: find and delete related tool messages
    else if (message.tools) {
      const toolMessageIds = message.tools.flatMap((tool) => {
        const messages = allMessages.filter((m) => m.tool_call_id === tool.id);
        return messages.map((m) => m.id);
      });
      ids = ids.concat(toolMessageIds);
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
    const message = dbMessageSelectors.getDbMessageById(id)(get());
    if (!message || message.role !== 'tool') return;

    const removeToolInAssistantMessage = async () => {
      if (!message.parentId) return;
      await get().optimisticRemoveToolFromAssistantMessage(message.parentId, message.tool_call_id);
    };

    await Promise.all([
      // 1. remove tool message
      get().optimisticDeleteMessage(id),
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

  updateMessageInput: (message) => {
    if (isEqual(message, get().inputMessage)) return;

    set({ inputMessage: message }, false, n('updateMessageInput', message));
  },

  modifyMessageContent: async (id, content) => {
    // tracing the diff of update
    // due to message content will change, so we need send trace before update,or will get wrong data
    get().internal_traceMessage(id, {
      eventType: TraceEventType.ModifyMessage,
      nextContent: content,
    });

    await get().optimisticUpdateMessageContent(id, content);
  },
});
