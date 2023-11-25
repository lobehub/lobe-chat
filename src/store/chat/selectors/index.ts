import {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getFunctionMessageProps,
  getMessageById,
} from './chat';
import { currentTopicLength, currentTopics } from './topic';

export const chatSelectors = {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getFunctionMessageProps,
  getMessageById,
};

export const topicSelectors = {
  currentTopicLength,
  currentTopics,
};
