import { ChatFileItem, UIChatMessage } from '@lobechat/types';

import { DEFAULT_USER_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import { chatHelpers } from '../../../helpers';
import type { ChatStoreState } from '../../../initialState';

const getMeta = (message: UIChatMessage) => {
  switch (message.role) {
    case 'user': {
      return {
        avatar: userProfileSelectors.userAvatar(useUserStore.getState()) || DEFAULT_USER_AVATAR,
      };
    }

    case 'system': {
      return message.meta;
    }

    default: {
      // For group chat, get meta from agent session
      if (message.groupId && message.agentId) {
        return sessionMetaSelectors.getAgentMetaByAgentId(message.agentId)(
          useSessionStore.getState(),
        );
      }

      // Otherwise, use the current session's agent meta for single agent chat
      return sessionMetaSelectors.currentAgentMeta(useSessionStore.getState());
    }
  }
};

const getBaseChatsByKey =
  (key: string) =>
  (s: ChatStoreState): UIChatMessage[] => {
    const messages = s.messagesMap[key] || [];

    return messages.map((i) => ({ ...i, meta: getMeta(i) }));
  };

export const currentChatKey = (s: ChatStoreState) => messageMapKey(s.activeId, s.activeTopicId);

/**
 * Current active raw message list, include thread messages
 */
const activeBaseChats = (s: ChatStoreState): UIChatMessage[] => {
  if (!s.activeId) return [];

  return getBaseChatsByKey(currentChatKey(s))(s);
};

/**
 * 排除掉所有 tool 消息，在展示时需要使用
 */
const activeBaseChatsWithoutTool = (s: ChatStoreState) => {
  const messages = activeBaseChats(s);

  return messages.filter((m) => m.role !== 'tool');
};

const getChatsWithThread = (s: ChatStoreState, messages: UIChatMessage[]) => {
  // 如果没有 activeThreadId，则返回所有的主消息
  if (!s.activeThreadId) return messages.filter((m) => !m.threadId);

  const thread = s.threadMaps[s.activeTopicId!]?.find((t) => t.id === s.activeThreadId);

  if (!thread) return messages.filter((m) => !m.threadId);

  const sourceIndex = messages.findIndex((m) => m.id === thread.sourceMessageId);
  const sliced = messages.slice(0, sourceIndex + 1);

  return [...sliced, ...messages.filter((m) => m.threadId === s.activeThreadId)];
};

// ============= Main Display Chats ========== //
// =========================================== //
const mainDisplayChats = (s: ChatStoreState): UIChatMessage[] => {
  const displayChats = activeBaseChatsWithoutTool(s);

  return getChatsWithThread(s, displayChats);
};

export const mainDisplayChatIDs = (s: ChatStoreState) => mainDisplayChats(s).map((s) => s.id);

const mainAIChats = (s: ChatStoreState): UIChatMessage[] => {
  const messages = activeBaseChats(s);

  return getChatsWithThread(s, messages);
};

const mainAIChatsWithHistoryConfig = (s: ChatStoreState): UIChatMessage[] => {
  const chats = mainAIChats(s);
  const enableHistoryCount = agentChatConfigSelectors.enableHistoryCount(useAgentStore.getState());
  const historyCount = agentChatConfigSelectors.historyCount(useAgentStore.getState());

  return chatHelpers.getSlicedMessages(chats, {
    enableHistoryCount,
    historyCount,
  });
};

const mainAIChatsMessageString = (s: ChatStoreState): string => {
  const chats = mainAIChatsWithHistoryConfig(s);
  return chats.map((m) => m.content).join('');
};

const mainAILatestMessageReasoningContent = (s: ChatStoreState) =>
  mainAIChats(s).at(-1)?.reasoning?.content;

const currentToolMessages = (s: ChatStoreState) => {
  const messages = activeBaseChats(s);

  return messages.filter((m) => m.role === 'tool');
};

const currentUserMessages = (s: ChatStoreState) => {
  const messages = activeBaseChats(s);

  return messages.filter((m) => m.role === 'user');
};

const currentUserFiles = (s: ChatStoreState) => {
  const userMessages = currentUserMessages(s);

  return userMessages
    .filter((m) => m.fileList && m.fileList?.length > 0)
    .flatMap((m) => m.fileList)
    .filter(Boolean) as ChatFileItem[];
};

const showInboxWelcome = (s: ChatStoreState): boolean => {
  const isInbox = s.activeId === INBOX_SESSION_ID;
  if (!isInbox) return false;

  const data = activeBaseChats(s);
  return data.length === 0;
};

const getMessageById = (id: string) => (s: ChatStoreState) =>
  chatHelpers.getMessageById(activeBaseChats(s), id);

const countMessagesByThreadId = (id: string) => (s: ChatStoreState) => {
  const messages = activeBaseChats(s).filter((m) => m.threadId === id);

  return messages.length;
};

export const getMessageByToolCallId = (id: string) => (s: ChatStoreState) => {
  const messages = activeBaseChats(s);
  return messages.find((m) => m.tool_call_id === id);
};
const getTraceIdByMessageId = (id: string) => (s: ChatStoreState) => getMessageById(id)(s)?.traceId;

const latestMessage = (s: ChatStoreState) => activeBaseChats(s).at(-1);

const currentChatLoadingState = (s: ChatStoreState) => !s.messagesInit;

const isCurrentChatLoaded = (s: ChatStoreState) => !!s.messagesMap[currentChatKey(s)];

const inboxActiveTopicMessages = (state: ChatStoreState) => {
  const activeTopicId = state.activeTopicId;
  return state.messagesMap[messageMapKey(INBOX_SESSION_ID, activeTopicId)] || [];
};

/**
 * Gets messages between the current user and a specific agent (thread messages)
 * This is like a DM (Direct Message) view between user and agent
 */
const getThreadMessages =
  (agentId: string) =>
  (s: ChatStoreState): UIChatMessage[] => {
    if (!agentId) return [];

    const allMessages = activeBaseChats(s);

    // Filter messages to only include:
    // 1. User messages sent TO the specific agent (role: 'user' && targetId matches agentId)
    // 2. Assistant messages FROM the specific agent sent TO user (role: 'assistant' && agentId matches && targetId is 'user')
    return allMessages.filter((message) => {
      if (message.role === 'user' && message.targetId === agentId) {
        return true; // Include user messages sent to the specific agent
      }

      if (
        message.role === 'assistant' &&
        message.agentId === agentId &&
        message.targetId === 'user'
      ) {
        return true; // Include messages from the specific agent sent to user
      }

      return false; // Exclude all other messages
    });
  };

/**
 * Gets thread message IDs for a specific agent
 */
const getThreadMessageIDs =
  (agentId: string) =>
  (s: ChatStoreState): string[] => {
    return getThreadMessages(agentId)(s).map((message) => message.id);
  };

const isSupervisorLoading = (groupId: string) => (s: ChatStoreState) =>
  s.supervisorDecisionLoading.includes(groupId);

const getSupervisorTodos = (groupId?: string, topicId?: string | null) => (s: ChatStoreState) => {
  if (!groupId) return [];
  return s.supervisorTodos[messageMapKey(groupId, topicId)] || [];
};

/**
 * Gets the latest message block from a group message that doesn't contain tools
 * Returns null if the last block contains tools or if message is not a group message
 */
const getGroupLatestMessageWithoutTools = (id: string) => (s: ChatStoreState) => {
  const message = getMessageById(id)(s);

  if (!message || message.role !== 'group' || !message.children || message.children.length === 0)
    return;

  // Get the last child
  const lastChild = message.children.at(-1);

  if (!lastChild) return;

  // Return the last child only if it doesn't have tools
  if (!lastChild.tools || lastChild.tools.length === 0) {
    return lastChild;
  }

  return;
};

export const chatSelectors = {
  activeBaseChats,
  activeBaseChatsWithoutTool,
  countMessagesByThreadId,
  currentChatKey,
  currentChatLoadingState,
  currentToolMessages,
  currentUserFiles,
  getBaseChatsByKey,
  getGroupLatestMessageWithoutTools,
  getMessageById,
  getMessageByToolCallId,
  getSupervisorTodos,
  getThreadMessageIDs,
  getThreadMessages,
  getTraceIdByMessageId,
  inboxActiveTopicMessages,
  isCurrentChatLoaded,
  isSupervisorLoading,
  latestMessage,
  mainAIChats,
  mainAIChatsMessageString,
  mainAIChatsWithHistoryConfig,
  mainAILatestMessageReasoningContent,
  mainDisplayChatIDs,
  mainDisplayChats,
  showInboxWelcome,
};
