import {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getChatsById,
  getFunctionMessageProps,
  getMessageById,
} from './chat';
import { currentTopicLength, currentTopics, getTopicMessages } from './topic';

export const chatSelectors = {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getChatsById,
  getFunctionMessageProps,
  getMessageById,
};

export const topicSelectors = {
  currentTopicLength,
  currentTopics,
  getTopicMessages,
};
