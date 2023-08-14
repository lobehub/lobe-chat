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
  const systemRole = agentSelectors.currentAgentSystemRole(s);

  const emptyInboxGuideMessage = {
    content: isInbox
      ? t('inbox.defaultMessage')
      : !!systemRole
      ? t('agentDefaultMessageWithSystemRole', { systemRole })
      : t('agentDefaultMessage', { id: activeId }),
    createAt: Date.now(),
    extra: {},
    id: 'default',
    meta: {
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
