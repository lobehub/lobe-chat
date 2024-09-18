import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import {
  DiscoverAssistantItem,
  DiscoverModelItem,
  DiscoverPlugintem,
  DiscoverProviderItem,
} from '@/types/discover';

export const CNY_TO_USD = 7.14;

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

export const DEFAULT_DISCOVER_PLUGIN_ITEM: Partial<DiscoverPlugintem> = {
  author: '',
  createdAt: DEFAULT_CREATED_AT,
  homepage: '',
  identifier: '',
  schemaVersion: 1,
  socialData: {
    called: 0,
    executionTime: 0,
    likes: 0,
    relatedAssistants: 0,
    successRate: 1,
    users: 0,
  },
};

export const DEFAULT_DISCOVER_MODEL_ITEM: Partial<DiscoverModelItem> = {
  createdAt: DEFAULT_CREATED_AT,
  identifier: '',
  providers: [],
  socialData: {
    conversations: 0,
    likes: 0,
    tokens: 0,
  },
};

export const DEFAULT_DISCOVER_PROVIDER_ITEM: Partial<DiscoverProviderItem> = {
  createdAt: DEFAULT_CREATED_AT,
  identifier: '',
  models: [],
  socialData: {
    conversations: 0,
    likes: 0,
    users: 0,
  },
};
