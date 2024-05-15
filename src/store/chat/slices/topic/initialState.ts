import { ChatTopic } from '@/types/topic';

export interface ChatTopicState {
  // TODO: need to add the null to the type
  activeTopicId?: string;
  isSearchingTopic: boolean;
  searchTopics: ChatTopic[];
  topicLoadingIds: string[];
  topicRenamingId?: string;
  topicSearchKeywords: string;
  topics: ChatTopic[];
  /**
   * whether topics have fetched
   */
  topicsInit: boolean;
}

export const initialTopicState: ChatTopicState = {
  activeTopicId: null as any,
  isSearchingTopic: false,
  searchTopics: [],
  topicLoadingIds: [],
  topicSearchKeywords: '',
  topics: [],
  topicsInit: false,
};
