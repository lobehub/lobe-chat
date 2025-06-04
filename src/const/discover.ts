import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import {
  DiscoverAssistantDetail,
  DiscoverModelDetail,
  DiscoverPluginDetail,
  DiscoverProviderDetail,
} from '@/types/discover';

const DEFAULT_CREATED_AT = new Date().toISOString();

export const DEFAULT_DISCOVER_ASSISTANT_ITEM: Partial<DiscoverAssistantDetail> = {
  author: '',
  config: DEFAULT_AGENT_CONFIG,
  createdAt: DEFAULT_CREATED_AT,
  homepage: '',
  identifier: '',
};

export const DEFAULT_DISCOVER_PLUGIN_ITEM: Partial<DiscoverPluginDetail> = {
  author: '',
  createdAt: DEFAULT_CREATED_AT,
  homepage: '',
  identifier: '',
  schemaVersion: 1,
};

export const DEFAULT_DISCOVER_MODEL_ITEM: Partial<DiscoverModelDetail> = {
  identifier: '',
  providers: [],
};

export const DEFAULT_DISCOVER_PROVIDER_ITEM: Partial<DiscoverProviderDetail> = {
  identifier: '',
  models: [],
};
