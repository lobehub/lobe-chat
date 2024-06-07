import { SystemAgentItem, UserSystemAgentConfig } from '@/types/user/settings';

import { DEFAULT_MODEL, DEFAULT_PROVIDER } from './llm';

export const DEFAULT_SYSTEM_AGENT_ITEM: SystemAgentItem = {
  model: DEFAULT_MODEL,
  provider: DEFAULT_PROVIDER,
};

export const DEFAULT_SYSTEM_AGENT_CONFIG: UserSystemAgentConfig = {
  topic: DEFAULT_SYSTEM_AGENT_ITEM,
  translation: DEFAULT_SYSTEM_AGENT_ITEM,
};
