import { LobePluginType } from '@lobehub/chat-plugin-sdk';
import { t } from 'i18next';

import { DEFAULT_INBOX_AVATAR, DEFAULT_USER_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
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

    case 'assistant': {
      return sessionMetaSelectors.currentAgentMeta(useSessionStore.getState());
    }

    case 'function': {
      // TODO: 后续改成将 plugin metadata 写入 message metadata 的方案
      return {
        avatar: '🧩',
        title: 'plugin-unknown',
      };
    }
  }
};

const currentChatKey = (s: ChatStore) => `${s.activeId}_${s.activeTopicId}`;

// 当前激活的消息列表
const currentChats = (s: ChatStore): ChatMessage[] => {
  if (!s.activeId) return [];

  return s.messages.map((i) => ({ ...i, meta: getMeta(i) }));
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
  const config = agentSelectors.currentAgentConfig(useAgentStore.getState());

  return chatHelpers.getSlicedMessagesWithConfig(chats, config);
};

const chatsMessageString = (s: ChatStore): string => {
  const chats = currentChatsWithHistoryConfig(s);
  return chats.map((m) => m.content).join('');
};

const getFunctionMessageProps =
  ({ plugin, content, id }: Pick<ChatMessage, 'plugin' | 'content' | 'id'>) =>
  (s: ChatStore) => ({
    arguments: plugin?.arguments,
    command: plugin,
    content,
    id: plugin?.identifier,
    loading: id === s.chatLoadingId,
    type: plugin?.type as LobePluginType,
  });

const getMessageById = (id: string) => (s: ChatStore) => chatHelpers.getMessageById(s.messages, id);
const getTraceIdByMessageId = (id: string) => (s: ChatStore) => getMessageById(id)(s)?.traceId;

const latestMessage = (s: ChatStore) => currentChats(s).at(-1);

const currentChatLoadingState = (s: ChatStore) => !s.messagesInit;

export const chatSelectors = {
  chatsMessageString,
  currentChatIDsWithGuideMessage,
  currentChatKey,
  currentChatLoadingState,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getFunctionMessageProps,
  getMessageById,
  getTraceIdByMessageId,
  latestMessage,
  showInboxWelcome,
};
