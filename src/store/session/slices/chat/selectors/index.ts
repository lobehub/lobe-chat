import { currentChats } from './chat';
import { chatsTokenCount, systemRoleTokenCount, totalTokenCount } from './token';
import { currentTopics } from './topic';

export const chatSelectors = {
  chatsTokenCount,
  currentChats,
  systemRoleTokenCount,
  totalTokenCount,
};

export const topicSelectors = {
  currentTopics,
};
