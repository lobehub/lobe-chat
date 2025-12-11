import { t } from 'i18next';

import { ChatTopic, ChatTopicSummary, GroupedTopic } from '@/types/topic';
import { groupTopicsByTime } from '@/utils/client/topic';

import { ChatStoreState } from '../../initialState';
import { topicMapKey } from '../../utils/topicMapKey';
import { TopicData } from './initialState';

// Helper selector: get current topic data based on session context
const currentTopicData = (s: ChatStoreState): TopicData | undefined => {
  const key = topicMapKey({
    agentId: s.activeAgentId,
    groupId: s.activeGroupId,
  });
  return s.topicDataMap[key];
};

const currentTopics = (s: ChatStoreState): ChatTopic[] | undefined => currentTopicData(s)?.items;

const currentActiveTopic = (s: ChatStoreState): ChatTopic | undefined => {
  return currentTopics(s)?.find((topic) => topic.id === s.activeTopicId);
};
const searchTopics = (s: ChatStoreState): ChatTopic[] => s.searchTopics;

const displayTopics = (s: ChatStoreState): ChatTopic[] | undefined => currentTopics(s);

const currentFavTopics = (s: ChatStoreState): ChatTopic[] =>
  currentTopics(s)?.filter((s) => s.favorite) || [];

const currentUnFavTopics = (s: ChatStoreState): ChatTopic[] =>
  currentTopics(s)?.filter((s) => !s.favorite) || [];

const currentTopicLength = (s: ChatStoreState): number => currentTopicData(s)?.items?.length || 0;

const currentTopicCount = (s: ChatStoreState): number => currentTopicData(s)?.total || 0;

const getTopicById =
  (id: string) =>
  (s: ChatStoreState): ChatTopic | undefined =>
    currentTopics(s)?.find((topic) => topic.id === id);

const currentActiveTopicSummary = (s: ChatStoreState): ChatTopicSummary | undefined => {
  const activeTopic = currentActiveTopic(s);
  if (!activeTopic) return undefined;

  return {
    content: activeTopic.historySummary || '',
    model: activeTopic.metadata?.model || '',
    provider: activeTopic.metadata?.provider || '',
  };
};

const isCreatingTopic = (s: ChatStoreState) => s.creatingTopic;
const isUndefinedTopics = (s: ChatStoreState) => !currentTopics(s);
const isInSearchMode = (s: ChatStoreState) => s.inSearchingMode;
const isSearchingTopic = (s: ChatStoreState) => s.isSearchingTopic;

// Limit topics for sidebar display based on user's page size preference
const displayTopicsForSidebar =
  (pageSize: number) =>
  (s: ChatStoreState): ChatTopic[] | undefined => {
    const topics = currentTopics(s);
    if (!topics) return undefined;

    // Return only the first page worth of topics for sidebar
    return topics.slice(0, pageSize);
  };

const groupedTopicsSelector = (s: ChatStoreState): GroupedTopic[] => {
  const topics = displayTopics(s);

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

// Limit grouped topics for sidebar
const groupedTopicsForSidebar =
  (pageSize: number) =>
  (s: ChatStoreState): GroupedTopic[] => {
    const limitedTopics = displayTopicsForSidebar(pageSize)(s);
    if (!limitedTopics) return [];

    const favTopics = limitedTopics.filter((t) => t.favorite);
    const unfavTopics = limitedTopics.filter((t) => !t.favorite);

    return favTopics.length > 0
      ? [
          {
            children: favTopics,
            id: 'favorite',
            title: t('favorite', { ns: 'topic' }),
          },
          ...groupTopicsByTime(unfavTopics),
        ]
      : groupTopicsByTime(limitedTopics);
  };

const hasMoreTopics = (s: ChatStoreState): boolean => currentTopicData(s)?.hasMore ?? false;

const isLoadingMoreTopics = (s: ChatStoreState): boolean =>
  currentTopicData(s)?.isLoadingMore ?? false;

const isExpandingPageSize = (s: ChatStoreState): boolean =>
  currentTopicData(s)?.isExpandingPageSize ?? false;

export const topicSelectors = {
  currentActiveTopic,
  currentActiveTopicSummary,
  currentTopicCount,
  currentTopicData,
  currentTopicLength,
  currentTopics,
  currentUnFavTopics,
  displayTopics,
  displayTopicsForSidebar,
  getTopicById,
  groupedTopicsForSidebar,
  groupedTopicsSelector,
  hasMoreTopics,
  isCreatingTopic,
  isExpandingPageSize,
  isInSearchMode,
  isLoadingMoreTopics,
  isSearchingTopic,
  isUndefinedTopics,
  searchTopics,
};
