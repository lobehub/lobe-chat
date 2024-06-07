import { t } from 'i18next';

import { DEFAULT_INBOX_AVATAR, DEFAULT_USER_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { messageMapKey } from '@/store/chat/slices/message/utils';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { ChatMessage } from '@/types/message';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

import { chatHelpers } from '../../helpers';
import type { ChatStore } from '../../store';

const getMeta = (message: ChatMessage) => {
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
      return sessionMetaSelectors.currentAgentMeta(useSessionStore.getState());
    }
  }
};

const currentChatKey = (s: ChatStore) => messageMapKey(s.activeId, s.activeTopicId);

// 当前激活的消息列表
const currentChats = (s: ChatStore): ChatMessage[] => {
  if (!s.activeId) return [];

  const messages = s.messagesMap[currentChatKey(s)] || [];

  return messages.map((i) => ({ ...i, meta: getMeta(i) }));
};

const initTime = Date.now();

const showInboxWelcome = (s: ChatStore): boolean => {
  const isInbox = s.activeId === INBOX_SESSION_ID;
  if (!isInbox) return false;

  const data = currentChats(s);
  const isBrandNewChat = data.length === 0;

  return isBrandNewChat;
};

// 针对新助手添加初始化时的自定义消息
const currentChatsWithGuideMessage =
  (meta: MetaData) =>
  (s: ChatStore): ChatMessage[] => {
    const data = currentChats(s);

    const isBrandNewChat = data.length === 0;

    if (!isBrandNewChat) return data;

    const [activeId, isInbox] = [s.activeId, s.activeId === INBOX_SESSION_ID];

    const inboxMsg = '';
    const agentSystemRoleMsg = t('agentDefaultMessageWithSystemRole', {
      name: meta.title || t('defaultAgent'),
      ns: 'chat',
      systemRole: meta.description,
    });
    const agentMsg = t('agentDefaultMessage', {
      id: activeId,
      name: meta.title || t('defaultAgent'),
      ns: 'chat',
    });

    const emptyInboxGuideMessage = {
      content: isInbox ? inboxMsg : !!meta.description ? agentSystemRoleMsg : agentMsg,
      createdAt: initTime,
      extra: {},
      id: 'default',
      meta: merge({ avatar: DEFAULT_INBOX_AVATAR }, meta),
      role: 'assistant',
      updatedAt: initTime,
    } as ChatMessage;

    return [emptyInboxGuideMessage];
  };

const currentChatIDsWithGuideMessage = (s: ChatStore) => {
  const meta = sessionMetaSelectors.currentAgentMeta(useSessionStore.getState());

  return currentChatsWithGuideMessage(meta)(s).map((s) => s.id);
};

const currentChatsWithHistoryConfig = (s: ChatStore): ChatMessage[] => {
  const chats = currentChats(s);
  const config = agentSelectors.currentAgentChatConfig(useAgentStore.getState());

  return chatHelpers.getSlicedMessagesWithConfig(chats, config);
};

const chatsMessageString = (s: ChatStore): string => {
  const chats = currentChatsWithHistoryConfig(s);
  return chats.map((m) => m.content).join('');
};

const getMessageById = (id: string) => (s: ChatStore) =>
  chatHelpers.getMessageById(currentChats(s), id);

const getTraceIdByMessageId = (id: string) => (s: ChatStore) => getMessageById(id)(s)?.traceId;

const latestMessage = (s: ChatStore) => currentChats(s).at(-1);

const currentChatLoadingState = (s: ChatStore) => !s.messagesInit;

const isCurrentChatLoaded = (s: ChatStore) => !!s.messagesMap[currentChatKey(s)];

const isMessageEditing = (id: string) => (s: ChatStore) => s.messageEditingIds.includes(id);
const isMessageLoading = (id: string) => (s: ChatStore) => s.messageLoadingIds.includes(id);
const isHasMessageLoading = (s: ChatStore) => s.messageLoadingIds.length > 0;
const isCreatingMessage = (s: ChatStore) => s.isCreatingMessage;

const isMessageGenerating = (id: string) => (s: ChatStore) => s.chatLoadingIds.includes(id);
const isToolCallStreaming = (id: string, index: number) => (s: ChatStore) => {
  const isLoading = s.toolCallingStreamIds[id];

  if (!isLoading) return false;

  return isLoading[index];
};
const isAIGenerating = (s: ChatStore) => s.chatLoadingIds.length > 0;

export const chatSelectors = {
  chatsMessageString,
  currentChatIDsWithGuideMessage,
  currentChatKey,
  currentChatLoadingState,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getMessageById,
  getTraceIdByMessageId,
  isAIGenerating,
  isCreatingMessage,
  isCurrentChatLoaded,
  isHasMessageLoading,
  isMessageEditing,
  isMessageGenerating,
  isMessageLoading,
  isToolCallStreaming,
  latestMessage,
  showInboxWelcome,
};
