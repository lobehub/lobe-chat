import { ChatTopic } from '@/types/topic';

export interface ChatTopicState {
  // TODO: need to add the null to the type
  activeTopicId?: string;
  /**
   * whether all topics drawer is open
   */
  allTopicsDrawerOpen: boolean;
  creatingTopic: boolean;
  inSearchingMode?: boolean;
  isSearchingTopic: boolean;
  searchTopics: ChatTopic[];
  /**
   * total count of topics for each agent
   */
  topicCountMap: Record<string, number>;
  topicLoadingIds: string[];
  /**
   * current page number for each agent (0-based)
   */
  topicLoadingMoreStates: Record<string, boolean>;
  topicMaps: Record<string, ChatTopic[]>;
  /**
   * current page number for each agent (0-based)
   */
  topicPageMap: Record<string, number>;
  /**
   * loading state when expanding page size
   */
  topicPageSizeExpandingStates: Record<string, boolean>;
  topicRenamingId?: string;
  topicSearchKeywords: string;
  /**
   * whether there are more topics to load for each agent
   */
  topicsHasMore: Record<string, boolean>;
  /**
   * whether topics have fetched
   */
  topicsInit: boolean;
}

export const initialTopicState: ChatTopicState = {
  activeTopicId: null as any,
  allTopicsDrawerOpen: false,
  creatingTopic: false,
  isSearchingTopic: false,
  searchTopics: [],
  topicCountMap: {},
  topicLoadingIds: [],
  topicLoadingMoreStates: {},
  topicMaps: {},
  topicPageMap: {},
  topicPageSizeExpandingStates: {},
  topicSearchKeywords: '',
  topicsHasMore: {},
  topicsInit: false,
};
