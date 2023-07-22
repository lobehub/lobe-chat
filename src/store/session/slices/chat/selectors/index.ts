import { currentChats } from './chat';
import { chatsTokenCount, systemRoleTokenCount, totalTokenCount } from './token';

export const chatSelectors = {
  chatsTokenCount,
  currentChats,
  systemRoleTokenCount,
  totalTokenCount,
};
