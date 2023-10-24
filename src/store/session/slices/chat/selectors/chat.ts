import { LobePluginType } from '@lobehub/chat-plugin-sdk';
import { t } from 'i18next';

import { DEFAULT_INBOX_AVATAR, DEFAULT_USER_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { useGlobalStore } from '@/store/global';
import { ChatMessage } from '@/types/chatMessage';

import type { SessionStore } from '../../../store';
import { agentSelectors } from '../../agentConfig';
import { sessionSelectors } from '../../session/selectors';
import { getSlicedMessagesWithConfig } from '../utils';
import { currentTopics } from './topic';
import { organizeChats } from './utils';

export const getChatsById =
  (id: string) =>
  (s: SessionStore): ChatMessage[] => {
    const session = sessionSelectors.getSessionById(id)(s);

    if (!session) return [];

    return organizeChats(session, {
      meta: {
        assistant: {
          avatar: agentSelectors.currentAgentAvatar(s),
          backgroundColor: agentSelectors.currentAgentBackgroundColor(s),
        },
        user: {
          avatar: useGlobalStore.getState().settings.avatar || DEFAULT_USER_AVATAR,
        },
      },
      topicId: s.activeTopicId,
    });
  };

// 当前激活的消息列表
export const currentChats = (s: SessionStore): ChatMessage[] => {
  if (!s.activeId) return [];

  return getChatsById(s.activeId)(s);
};

// 针对新助手添加初始化时的自定义消息
export const currentChatsWithGuideMessage = (s: SessionStore): ChatMessage[] => {
  const data = currentChats(s);
  const noTopic = currentTopics(s);

  const isBrandNewChat = data.length === 0 && noTopic;

  if (!isBrandNewChat) return data;

  const [activeId, isInbox] = [s.activeId, s.activeId === INBOX_SESSION_ID];
  const meta = agentSelectors.currentAgentMeta(s);

  const inboxMsg = t('inbox.defaultMessage', { ns: 'chat' });
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
    createAt: Date.now(),
    extra: {},
    id: 'default',
    meta: meta || {
      avatar: DEFAULT_INBOX_AVATAR,
    },
    role: 'assistant',
    updateAt: Date.now(),
  } as ChatMessage;

  return [emptyInboxGuideMessage];
};

export const currentChatsWithHistoryConfig = (s: SessionStore): ChatMessage[] => {
  const chats = currentChats(s);
  const config = agentSelectors.currentAgentConfig(s);

  return getSlicedMessagesWithConfig(chats, config);
};

export const chatsMessageString = (s: SessionStore): string => {
  const chats = currentChatsWithHistoryConfig(s);
  return chats.map((m) => m.content).join('');
};

export const getFunctionMessageProps =
  ({ plugin, content, id }: Pick<ChatMessage, 'plugin' | 'content' | 'id'>) =>
  (s: SessionStore) => ({
    arguments: plugin?.arguments,
    command: plugin,
    content,
    id: plugin?.identifier,
    loading: id === s.chatLoadingId,
    type: plugin?.type as LobePluginType,
  });

export const getMessageById = (id: string) => (s: SessionStore) => {
  for (const e of Object.values(s.sessions)) {
    if (e.chats[id]) return e.chats[id];
  }
};
