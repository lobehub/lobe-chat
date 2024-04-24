import { ChatTopic } from '@/types/topic';

export interface ChatTopicState {
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
  isSearchingTopic: false,
  searchTopics: [],
  topicLoadingIds: [],
  topicSearchKeywords: '',
  topics: [],
  topicsInit: false,
};
