import {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  currentFunctionCallProps,
  getChatsById,
} from './chat';
import { currentTopics, getTopicMessages } from './topic';

export const chatSelectors = {
  chatsMessageString,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  currentFunctionCallProps,
  getChatsById,
};

export const topicSelectors = {
  currentTopics,
  getTopicMessages,
};
