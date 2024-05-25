import { DeepPartial } from 'utility-types';

import { ChatModelCard } from '@/types/llm';
import { UserDefaultAgent, GlobalLLMProviderKey } from '@/types/user/settings';

export interface ServerModelProviderConfig {
  enabled?: boolean;
  enabledModels?: string[];
  fetchOnClient?: boolean;
  /**
   * the model cards defined in server
   */
  serverModelCards?: ChatModelCard[];
}

export type ServerLanguageModel = Partial<Record<GlobalLLMProviderKey, ServerModelProviderConfig>>;

export interface GlobalServerConfig {
  defaultAgent?: DeepPartial<UserDefaultAgent>;
  enableUploadFileToServer?: boolean;
  enabledAccessCode?: boolean;
  enabledOAuthSSO?: boolean;
  languageModel?: ServerLanguageModel;
  telemetry: {
    langfuse?: boolean;
  };
}
