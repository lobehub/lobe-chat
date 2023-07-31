import { DEFAULT_USER_AVATAR } from '@/const/meta';
import { agentSelectors } from '@/store/session';
import { useSettings } from '@/store/settings';
import { ChatMessage } from '@/types/chatMessage';

import type { SessionStore } from '../../../store';
import { sessionSelectors } from '../../session';
import { organizeChats } from './utils';

// 展示在聊天框中的消息
export const currentChats = (s: SessionStore): ChatMessage[] => {
  const session = sessionSelectors.currentSession(s);
  if (!session) return [];

  return organizeChats(
    session,
    {
      assistant: agentSelectors.currentAgentAvatar(s),
      user: useSettings.getState().settings.avatar || DEFAULT_USER_AVATAR,
    },
    s.activeTopicId,
  );
};

export const systemRoleSel = (s: SessionStore): string => {
  const config = agentSelectors.currentAgentConfig(s);

  return config.systemRole;
};
