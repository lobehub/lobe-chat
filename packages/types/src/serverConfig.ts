import type { PartialDeep } from 'type-fest';

import { IFeatureFlagsState } from '@/config/featureFlags';

import { ChatModelCard } from './llm';
import {
  GlobalLLMProviderKey,
  UserDefaultAgent,
  UserImageConfig,
  UserSystemAgentConfig,
} from './user/settings';

export interface ServerModelProviderConfig {
  enabled?: boolean;
  enabledModels?: string[];
  fetchOnClient?: boolean;
  /**
   * the model lists defined in server
   */
  serverModelLists?: ChatModelCard[];
}

export type ServerLanguageModel = Partial<Record<GlobalLLMProviderKey, ServerModelProviderConfig>>;

export interface GlobalServerConfig {
  aiProvider: ServerLanguageModel;
  defaultAgent?: PartialDeep<UserDefaultAgent>;
  enableUploadFileToServer?: boolean;
  enabledAccessCode?: boolean;
  /**
   * @deprecated
   */
  enabledOAuthSSO?: boolean;
  image?: PartialDeep<UserImageConfig>;
  oAuthSSOProviders?: string[];
  systemAgent?: PartialDeep<UserSystemAgentConfig>;
  telemetry: {
    langfuse?: boolean;
  };
}

export interface GlobalRuntimeConfig {
  serverConfig: GlobalServerConfig;
  serverFeatureFlags: IFeatureFlagsState;
}
