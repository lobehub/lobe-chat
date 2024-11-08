import { t } from 'i18next';

import { ChatTopic, GroupedTopic } from '@/types/topic';
import { groupTopicsByTime } from '@/utils/client/topic';

import { ChatStore } from '../../store';

const currentTopics = (s: ChatStore): ChatTopic[] | undefined => s.topicMaps[s.activeId];

const currentActiveTopic = (s: ChatStore): ChatTopic | undefined => {
  return currentTopics(s)?.find((topic) => topic.id === s.activeTopicId);
};
const searchTopics = (s: ChatStore): ChatTopic[] => s.searchTopics;

const displayTopics = (s: ChatStore): ChatTopic[] | undefined =>
  s.isSearchingTopic ? searchTopics(s) : currentTopics(s);

const currentFavTopics = (s: ChatStore): ChatTopic[] =>
  currentTopics(s)?.filter((s) => s.favorite) || [];

const currentUnFavTopics = (s: ChatStore): ChatTopic[] =>
  currentTopics(s)?.filter((s) => !s.favorite) || [];

const currentTopicLength = (s: ChatStore): number => currentTopics(s)?.length || 0;

const getTopicById =
  (id: string) =>
  (s: ChatStore): ChatTopic | undefined =>
    currentTopics(s)?.find((topic) => topic.id === id);

const isCreatingTopic = (s: ChatStore) => s.creatingTopic;

const groupedTopicsSelector = (s: ChatStore): GroupedTopic[] => {
  const topics = currentTopics(s);

  if (!topics) return [];
  const favTopics = currentFavTopics(s);
  const unfavTopics = currentUnFavTopics(s);

  return favTopics.length > 0
    ? [
        {
          children: favTopics,
          id: 'favorite',
          title: t('favorite', { ns: 'topic' }),
        },
        ...groupTopicsByTime(unfavTopics),
      ]
    : groupTopicsByTime(topics);
};

export const topicSelectors = {
  currentActiveTopic,
  currentTopicLength,
  currentTopics,
  currentUnFavTopics,
  displayTopics,
  getTopicById,
  groupedTopicsSelector,
  isCreatingTopic,
  searchTopics,
};
