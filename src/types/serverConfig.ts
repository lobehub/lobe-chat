import { DeepPartial } from 'utility-types';

import { ChatModelCard } from '@/types/llm';
import { GlobalDefaultAgent, GlobalLLMProviderKey } from '@/types/settings';

export interface ServerModelProviderConfig {
  enabled?: boolean;
  enabledModels?: string[];
  fetchOnClient?: boolean;
  /**
   * the model cards defined in server
   */
  serverModelCards?: ChatModelCard[];
}

export interface GlobalServerConfig {
  defaultAgent?: DeepPartial<GlobalDefaultAgent>;
  enableUploadFileToServer?: boolean;
  enabledAccessCode?: boolean;
  enabledOAuthSSO?: boolean;
  languageModel?: Partial<Record<GlobalLLMProviderKey, ServerModelProviderConfig>>;
  telemetry: {
    langfuse?: boolean;
  };
}
