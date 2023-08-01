import { currentChats, getChatsById } from './chat';
import { chatsTokenCount, systemRoleTokenCount, totalTokenCount } from './token';
import { currentTopics, getTopicMessages } from './topic';

export const chatSelectors = {
  chatsTokenCount,
  currentChats,
  getChatsById,
  systemRoleTokenCount,
  totalTokenCount,
};

export const topicSelectors = {
  currentTopics,
  getTopicMessages,
};
