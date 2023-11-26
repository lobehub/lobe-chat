import { ChatTopic } from '@/types/topic';

import { ChatStore } from '../store';

const currentTopics = (s: ChatStore): ChatTopic[] => s.topics;

const currentUnFavTopics = (s: ChatStore): ChatTopic[] => s.topics.filter((s) => !s.favorite);

const currentTopicLength = (s: ChatStore): number => currentTopics(s).length;

const getTopicById =
  (id: string) =>
  (s: ChatStore): ChatTopic | undefined =>
    currentTopics(s).find((topic) => topic.id === id);

export const topicSelectors = {
  currentTopicLength,
  currentTopics,
  currentUnFavTopics,
  getTopicById,
};
