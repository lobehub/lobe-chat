import {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getChatsById,
  getFunctionMessageProps,
} from './chat';
import { currentTopics, getTopicMessages } from './topic';

export const chatSelectors = {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getChatsById,
  getFunctionMessageProps,
};

export const topicSelectors = {
  currentTopics,
  getTopicMessages,
};
