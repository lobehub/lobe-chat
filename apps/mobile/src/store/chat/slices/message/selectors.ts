import { DEFAULT_USER_AVATAR } from '@/const/meta';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { ChatMessage } from '@/types/message';

import type { ChatStoreState } from '../../initialState';

const getMeta = (message: ChatMessage) => {
  switch (message.role) {
    case 'user': {
      return {
        avatar: useUserStore.getState().user?.avatar || DEFAULT_USER_AVATAR,
      };
    }

    case 'system': {
      return message.meta;
    }

    default: {
      return sessionMetaSelectors.currentAgentMeta(useSessionStore.getState());
    }
  }
};

const getBaseChatsByKey =
  (key: string) =>
  (s: ChatStoreState): ChatMessage[] => {
    const messages = s.messagesMap[key] || [];

    return messages.map((i) => ({ ...i, meta: getMeta(i) }));
  };

const currentChatKey = (s: ChatStoreState) => messageMapKey(s.activeId, s.activeTopicId);

/**
 * Current active raw message list
 */
const activeBaseChats = (s: ChatStoreState): ChatMessage[] => {
  if (!s.activeId) return [];

  return getBaseChatsByKey(currentChatKey(s))(s);
};

/**
 * Current active chats for display
 */
const activeChats = (s: ChatStoreState): ChatMessage[] => {
  return activeBaseChats(s);
};

/**
 * Get current active message count
 */
const currentMessageLength = (s: ChatStoreState): number => {
  return activeBaseChats(s).length;
};

/**
 * Check if chat is loading
 */
const isCurrentChatLoaded = (s: ChatStoreState): boolean => {
  return s.messagesInit;
};

/**
 * Get message loading state
 */
const isMessageLoading =
  (id: string) =>
  (s: ChatStoreState): boolean => {
    return s.messageLoadingIds.includes(id);
  };

/**
 * Get message editing state
 */
const isMessageEditing =
  (id: string) =>
  (s: ChatStoreState): boolean => {
    return s.messageEditingIds.includes(id);
  };

/**
 * Get current chat messages by sessionId and topicId
 */
const getChatsBySessionId =
  (sessionId: string, topicId?: string) =>
  (s: ChatStoreState): ChatMessage[] => {
    const key = messageMapKey(sessionId, topicId);
    return getBaseChatsByKey(key)(s);
  };

/**
 * Find message by id in current active chat
 */
const getMessageById =
  (id: string) =>
  (s: ChatStoreState): ChatMessage | undefined => {
    return activeBaseChats(s).find((message) => message.id === id);
  };

/**
 * Get latest message in current chat
 */
const latestMessage = (s: ChatStoreState): ChatMessage | undefined => {
  const messages = activeBaseChats(s);
  return messages.at(-1);
};

/**
 * Get current messages (alias for activeChats for compatibility)
 */
const getCurrentMessages = (s: ChatStoreState): ChatMessage[] => {
  return activeChats(s);
};

/**
 * Check if any chat is loading
 */
const isAnyChatLoading = (s: ChatStoreState): boolean => {
  return s.chatLoadingIds.length > 0 || s.messageLoadingIds.length > 0;
};

export const chatMessage = {
  activeBaseChats,
  activeChats,
  currentChatKey,
  currentMessageLength,
  getBaseChatsByKey,
  getChatsBySessionId,
  getCurrentMessages,
  getMessageById,
  isAnyChatLoading,
  isCurrentChatLoaded,
  isMessageEditing,
  isMessageLoading,
  latestMessage,
};
