import { ChatMessage } from '@/types/chatMessage';
import { encode } from 'gpt-tokenizer';

import type { SessionStore } from '../../store';
import { sessionSelectors } from '../session';

const currentChatsSel = (s: SessionStore): ChatMessage[] => {
  const chat = sessionSelectors.currentSession(s);
  if (!chat) return [];
  const chatArr = Object.values<ChatMessage>(chat.chats)
    // 首先按照时间顺序排序，越早的在越前面
    .sort((pre, next) => pre.createAt - next.createAt)
    // 过滤掉已归档的消息，归档消息不应该出现在聊天框中
    .filter((m) => !m.archive);

  return chatArr;
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
  currentChats: currentChatsSel,
  systemRole: systemRoleSel,
  totalTokens,
  totalTokenCount,
  systemRoleTokens,
  systemRoleTokenCount,
};
