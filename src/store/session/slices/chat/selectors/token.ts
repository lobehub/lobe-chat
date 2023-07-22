import { encode } from 'gpt-tokenizer';

import type { SessionStore } from '../../../store';
import { currentChats, systemRoleSel } from './chat';

const systemRoleTokens = (s: SessionStore): number[] => {
  const systemRole = systemRoleSel(s);

  return encode(systemRole || '');
};

const chatsTokens = (s: SessionStore): number[] => {
  const chats = currentChats(s);
  return encode(chats.map((m) => m.content).join(''));
};

export const chatsTokenCount = (s: SessionStore) => chatsTokens(s).length;

export const systemRoleTokenCount = (s: SessionStore) => systemRoleTokens(s).length;

export const totalTokenCount = (s: SessionStore) => chatsTokens(s).length + systemRoleTokenCount(s);
