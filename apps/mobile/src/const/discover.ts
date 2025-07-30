import { DiscoverAssistantItem } from '@/types/discover';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';

const DEFAULT_CREATED_AT = new Date().toISOString();

export const DEFAULT_DISCOVER_ASSISTANT_ITEM: Partial<DiscoverAssistantItem> = {
  author: '',
  config: DEFAULT_AGENT_CONFIG,
  createdAt: DEFAULT_CREATED_AT,
  homepage: '',
  identifier: '',
  schemaVersion: 1,
  socialData: {
    conversations: 0,
    likes: 0,
    users: 0,
  },
};
