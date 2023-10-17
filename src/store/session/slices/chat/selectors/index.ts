import {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getChatsById,
  getFunctionMessageParams,
} from './chat';
import { currentTopics, getTopicMessages } from './topic';

export const chatSelectors = {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  getChatsById,
  getFunctionMessageParams,
};

export const topicSelectors = {
  currentTopics,
  getTopicMessages,
};
