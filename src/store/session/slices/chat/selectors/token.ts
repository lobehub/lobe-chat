import { encode } from 'gpt-tokenizer';

import { agentSelectors } from '@/store/session/slices/agentConfig';

import type { SessionStore } from '../../../store';
import { currentChatsWithHistoryConfig } from './chat';

export const systemRoleSel = (s: SessionStore): string => {
  const config = agentSelectors.currentAgentConfig(s);

  return config.systemRole;
};

const systemRoleTokens = (s: SessionStore): number[] => {
  const systemRole = systemRoleSel(s);

  return encode(systemRole || '');
};

const chatsTokens = (s: SessionStore): number[] => {
  const chats = currentChatsWithHistoryConfig(s);
  return encode(chats.map((m) => m.content).join(''));
};

export const chatsTokenCount = (s: SessionStore) => chatsTokens(s).length;

export const systemRoleTokenCount = (s: SessionStore) => systemRoleTokens(s).length;

export const totalTokenCount = (s: SessionStore) => chatsTokens(s).length + systemRoleTokenCount(s);
