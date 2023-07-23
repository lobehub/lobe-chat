import { agentSelectors } from '@/store/session';
import { useSettings } from '@/store/settings';
import { ChatMessage } from '@/types/chatMessage';

import type { SessionStore } from '../../../store';
import { DEFAULT_AVATAR } from '../../agentConfig';
import { sessionSelectors } from '../../session';
import { organizeChats } from './utils';

// 展示在聊天框中的消息
export const currentChats = (s: SessionStore): ChatMessage[] => {
  const session = sessionSelectors.currentSession(s);
  if (!session) return [];

  return organizeChats(session, {
    assistant: agentSelectors.currentAgentAvatar(s),
    user: useSettings.getState().settings.avatar || DEFAULT_AVATAR,
  });
};

export const systemRoleSel = (s: SessionStore): string => {
  const config = agentSelectors.currentAgentConfigSafe(s);

  return config.systemRole;
};
