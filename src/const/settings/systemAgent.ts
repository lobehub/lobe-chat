import { UserSystemAgentConfig, GlobalTranslationConfig } from '@/types/user/settings';

import { DEFAULT_MODEL, DEFAULT_PROVIDER } from './llm';

export const DEFAULT_TRANSLATION_CONFIG: GlobalTranslationConfig = {
  model: DEFAULT_MODEL,
  provider: DEFAULT_PROVIDER,
};

export const DEFAULT_SYSTEM_AGENT_CONFIG: UserSystemAgentConfig = {
  translation: DEFAULT_TRANSLATION_CONFIG,
};
