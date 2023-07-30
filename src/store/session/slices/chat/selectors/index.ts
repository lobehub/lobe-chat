import { currentChats } from './chat';
import { chatsTokenCount, systemRoleTokenCount, totalTokenCount } from './token';
import { currentTopics, getTopicMessages } from './topic';

export const chatSelectors = {
  chatsTokenCount,
  currentChats,
  systemRoleTokenCount,
  totalTokenCount,
};

export const topicSelectors = {
  currentTopics,
  getTopicMessages,
};
