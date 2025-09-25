import { DiscoverAssistantItem } from '@lobechat/types';

import { DEFAULT_AGENT_CONFIG } from '@/_const/settings';

const DEFAULT_CREATED_AT = new Date().toISOString();

export const DEFAULT_DISCOVER_ASSISTANT_ITEM: Partial<DiscoverAssistantItem> = {
  author: '',
  config: DEFAULT_AGENT_CONFIG,
  createdAt: DEFAULT_CREATED_AT,
  homepage: '',
  identifier: '',
};
