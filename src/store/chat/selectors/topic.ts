import { ChatTopic } from '@/types/topic';

import { ChatStore } from '../store';

export const currentTopics = (s: ChatStore): ChatTopic[] => {
  return s.topics;
};

export const currentTopicLength = (s: ChatStore): number => {
  return currentTopics(s).length;
};
