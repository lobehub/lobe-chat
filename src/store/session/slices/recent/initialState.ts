import { FileListItem } from '@/types/files';
import { ChatTopic } from '@/types/topic';

export interface RecentState {
  isRecentPagesInit: boolean;
  isRecentResourcesInit: boolean;
  isRecentTopicsInit: boolean;
  recentPages: any[];
  recentResources: FileListItem[];
  recentTopics: ChatTopic[];
}

export const initialRecentState: RecentState = {
  isRecentPagesInit: false,
  isRecentResourcesInit: false,
  isRecentTopicsInit: false,
  recentPages: [],
  recentResources: [],
  recentTopics: [],
};

