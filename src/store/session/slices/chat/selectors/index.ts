import {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getChatsById,
  getFunctionMessageProps,
  getMessageById,
} from './chat';
import { currentTopics, getTopicMessages } from './topic';

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
  currentTopics,
  getTopicMessages,
};
