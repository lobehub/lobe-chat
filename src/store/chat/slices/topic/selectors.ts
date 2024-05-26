import { ChatTopic } from '@/types/topic';

import { ChatStore } from '../../store';

const currentTopics = (s: ChatStore): ChatTopic[] | undefined => s.topicMaps[s.activeId];

const currentActiveTopic = (s: ChatStore): ChatTopic | undefined => {
  return currentTopics(s)?.find((topic) => topic.id === s.activeTopicId);
};
const searchTopics = (s: ChatStore): ChatTopic[] => s.searchTopics;

const displayTopics = (s: ChatStore): ChatTopic[] | undefined =>
  s.isSearchingTopic ? searchTopics(s) : currentTopics(s);

const currentUnFavTopics = (s: ChatStore): ChatTopic[] => s.topics.filter((s) => !s.favorite);

const currentTopicLength = (s: ChatStore): number => currentTopics(s)?.length || 0;

const getTopicById =
  (id: string) =>
  (s: ChatStore): ChatTopic | undefined =>
    currentTopics(s)?.find((topic) => topic.id === id);

export const topicSelectors = {
  currentActiveTopic,
  currentTopicLength,
  currentTopics,
  currentUnFavTopics,
  displayTopics,
  getTopicById,
  searchTopics,
};
