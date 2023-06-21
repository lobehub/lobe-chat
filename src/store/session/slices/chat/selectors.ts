import { ChatMessage } from '@/types/chatMessage';
import { encode } from 'gpt-tokenizer';

import type { SessionStore } from '../../store';
import { sessionSelectors } from '../session';

const currentChatsSel = (s: SessionStore): ChatMessage[] => {
  const chat = sessionSelectors.currentChat(s);

  return chat?.chats || [];
};

const systemRoleSel = (s: SessionStore): string | undefined => {
  const systemRoleMessage = currentChatsSel(s);

  return systemRoleMessage.find((s) => s.role === 'system')?.content;
};

const totalTokens = (s: SessionStore): number[] => {
  const chats = currentChatsSel(s);
  return encode(chats.map((m) => m.content).join(''));
};

const systemRoleTokens = (s: SessionStore): number[] => {
  const systemRole = systemRoleSel(s);

  return encode(systemRole || '');
};

const totalTokenCount = (s: SessionStore) => totalTokens(s).length;

const systemRoleTokenCount = (s: SessionStore) => systemRoleTokens(s).length;

export const chatSelectors = {
  systemRole: systemRoleSel,
  totalTokens,
  totalTokenCount,
  systemRoleTokens,
  systemRoleTokenCount,
};
