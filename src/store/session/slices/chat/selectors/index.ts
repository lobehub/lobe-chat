import { currentChats, currentChatsWithGuideMessage, getChatsById } from './chat';
import { chatsTokenCount, systemRoleTokenCount, totalTokenCount } from './token';
import { currentTopics, getTopicMessages } from './topic';

export const chatSelectors = {
  chatsTokenCount,
  currentChats,
  currentChatsWithGuideMessage,
  getChatsById,
  systemRoleTokenCount,
  totalTokenCount,
};

export const topicSelectors = {
  currentTopics,
  getTopicMessages,
};
